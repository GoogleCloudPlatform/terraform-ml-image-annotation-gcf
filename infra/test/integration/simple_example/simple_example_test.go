// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package simple_example

import (
	"fmt"
	"net/http"
	"mime/multipart"
	"testing"
	"bytes"
	"time"
	"strings"

	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/gcloud"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/tft"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/utils"
	"github.com/stretchr/testify/assert"
)

// Retry if these errors are encountered.
var retryErrors = map[string]string{
	// IAM for Eventarc service agent is eventually consistent
	".*Permission denied while using the Eventarc Service Agent.*": "Eventarc Service Agent IAM is eventually consistent",
}

func TestSimpleExample(t *testing.T) {

	example := tft.NewTFBlueprintTest(t, tft.WithRetryableTerraformErrors(retryErrors, 10, time.Minute))

	example.DefineVerify(func(assert *assert.Assertions) {
		projectID := example.GetTFSetupStringOutput("project_id")
		gcloudArgs := gcloud.WithCommonArgs([]string{"--project", projectID})

		// Use publicly available image url
		imageURI := "https://storage.googleapis.com/cft_test_data/annotate_images/ML20682781.jpg"
		features := []string{"FACE_DETECTION", "OBJECT_LOCALIZATION", "IMAGE_PROPERTIES", "LABEL_DETECTION", "SAFE_SEARCH_DETECTION"}
		visionEntrypointUrlArr := strings.Fields(example.GetStringOutput("vision_entrypoint_url"))
		annotateUrl := strings.Trim(visionEntrypointUrlArr[0], "[]") + "/annotate"

		// Check if the vision annotations bucket exists
		bucketName := example.GetStringOutput("vision_annotations_gcs")
		storage := gcloud.Run(t, fmt.Sprintf("storage buckets describe %s --format=json", bucketName), gcloudArgs)
		assert.NotEmpty(storage)

		// Check if the vision input bucket exists
		bucketName = example.GetStringOutput("vision_input_gcs")
		storage = gcloud.Run(t, fmt.Sprintf("storage buckets describe %s --format=json", bucketName), gcloudArgs)
		assert.NotEmpty(storage)

		// Check cloud function status and trigger region
		annotateGcsFunctionName := example.GetStringOutput("annotate_gcs_function_name")
		annotateGcsFunctionRegion := ""
		functions := gcloud.Run(t, ("functions list --format=json"), gcloudArgs).Array()
		for _, function := range functions {
			state := function.Get("state").String()
			assert.Equal("ACTIVE", state, "expected Cloud Function to be active")
			functionName := function.Get("name").String()
			eventTrigger := function.Get("eventTrigger")
			if len(eventTrigger.String()) > 0 && strings.Contains(functionName, "functions/" + annotateGcsFunctionName) {
				fmt.Printf("eventTrigger: %s\n", eventTrigger.String())
				annotateGcsFunctionRegion = eventTrigger.Get("triggerRegion").String()
				fmt.Printf("triggerRegion: %s\n", annotateGcsFunctionRegion)
			}
		}
		assert.NotEmpty(annotateGcsFunctionRegion)

		// Check the eventTrigger for the annotate_gcs function
		annotateGcsFunction := gcloud.Run(t, fmt.Sprintf("functions describe %s --region %s --gen2 --format=json", annotateGcsFunctionName, annotateGcsFunctionRegion), gcloudArgs)
		topicName := annotateGcsFunction.Get("eventTrigger").Get("pubsubTopic").String()
		topic := gcloud.Run(t, fmt.Sprintf("pubsub topics describe %s --format=json", topicName), gcloudArgs)
		assert.NotEmpty(topic)

		fmt.Printf("annotateUrl: %s \n", annotateUrl)

		// Check the RESTful API annotation
		isServing := func() (bool, error) {
			req, err := CreateVisionAPIRequest(annotateUrl, imageURI, features)
			client := http.Client{}
			resp, err := client.Do(req)
			if err != nil || resp.StatusCode != 200 {
				// retry if err or status not 200
				return true, nil
			}
			return false, nil
		}
		utils.Poll(t, isServing, 20, time.Second * 3)
	})
	example.Test()
}

func CreateVisionAPIRequest(annotateUrl string, imageURI string, features []string) (*http.Request, error) {
	// Create a multipart request body
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)

	// Add the image_uri field
	err := writer.WriteField("image_uri", imageURI)
	if err != nil {
		return nil, err
	}
	// Add the features field
	for _, feature := range features {
		err = writer.WriteField("features", feature)
		if err != nil {
			return nil, err
		}
	}

	// Close the multipart writer
	err = writer.Close()
	if err != nil {
		return nil, err
	}

	// Create a new HTTP POST request with the multipart request body
	req, err := http.NewRequest("POST", annotateUrl, body)
	if err != nil {
		return nil, err
	}

	// Set the Content-Type header to multipart/form-data with a boundary
	req.Header.Set("Content-Type", writer.FormDataContentType())
	return req, nil
}
