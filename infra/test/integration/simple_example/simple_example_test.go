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
	"regexp"
	"encoding/json"
	"os"
	"io/ioutil"

	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/gcloud"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/tft"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/utils"
	"github.com/stretchr/testify/assert"
	"github.com/parnurzeal/gorequest"
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
		visionEntrypointUrlArr := strings.Fields(example.GetStringOutput("vision_prediction_url"))
		annotateUrl := strings.Trim(visionEntrypointUrlArr[0], "[]") + "/annotate"

		// Check if the vision annotations bucket exists
		bucketName := example.GetStringOutput("vision_annotations_gcs")
		storage := gcloud.Run(t, fmt.Sprintf("storage buckets describe %s --format=json", bucketName), gcloudArgs)
		assert.NotEmpty(storage)

		// Check if the vision input bucket exists
		inputBucketName := example.GetStringOutput("vision_input_gcs")
		storage = gcloud.Run(t, fmt.Sprintf("storage buckets describe %s --format=json", inputBucketName), gcloudArgs)
		assert.NotEmpty(storage)

		// Check Cloud Function status and trigger region
		annotateGcsFunctionName := example.GetStringOutput("annotate_gcs_function_name")
		annotateGcsFunctionRegion := ""
		annotateHttpFunctionName := example.GetStringOutput("annotate_http_function_name")
		annotateHttpFunctionRegion := ""
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
			if strings.Contains(functionName, "functions/" + annotateHttpFunctionName) {
				reg := regexp.MustCompile(`locations/([^/]+)/`)
				match := reg.FindStringSubmatch(functionName)
				if len(match) > 1 {
					annotateHttpFunctionRegion = match[1]
				}
			}
		}
		assert.NotEmpty(annotateGcsFunctionRegion)
		assert.NotEmpty(annotateHttpFunctionRegion)

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

		// Check Cloud Function source code exists
		annotateHttpFunction := gcloud.Run(t, fmt.Sprintf("functions describe %s --region %s --gen2 --format=json", annotateHttpFunctionName, annotateHttpFunctionRegion), gcloudArgs)
		annotateHttpSourceBucket := annotateHttpFunction.Get("buildConfig.source.storageSource.bucket").String()
		annotateHttpSourceObject := annotateHttpFunction.Get("buildConfig.source.storageSource.object").String()
		annotateHttpSource := gcloud.Run(t, fmt.Sprintf("storage objects describe gs://%s/%s --format=json", annotateHttpSourceBucket, annotateHttpSourceObject), gcloudArgs)
		assert.NotEmpty(annotateHttpSource)

		annotateGcsSourceBucket := annotateGcsFunction.Get("buildConfig.source.storageSource.bucket").String()
		annotateGcsSourceObject := annotateGcsFunction.Get("buildConfig.source.storageSource.object").String()
		annotateGcsSource := gcloud.Run(t, fmt.Sprintf("storage objects describe gs://%s/%s --format=json", annotateGcsSourceBucket, annotateGcsSourceObject), gcloudArgs)
		assert.NotEmpty(annotateGcsSource)

		// Update annotate_gcs env vars
		sourceCodeUrl := example.GetStringOutput("source_code_url")
		gcloud.Run(t, fmt.Sprintf("functions deploy %s --region=%s --trigger-bucket=%s --source=%s --gen2 --update-env-vars=FEATURES=TEXT_DETECTION --format=json",
			annotateGcsFunctionName, annotateGcsFunctionRegion, inputBucketName, sourceCodeUrl), gcloudArgs)

		// Upload test image to input bucket
		testFileName := "TestImage.jpg"
		testFilePath := fmt.Sprintf("testfile/%s", testFileName)
		gcloud.Run(t, fmt.Sprintf("storage cp %s %s --format=json", testFilePath, inputBucketName), gcloudArgs)

		// Update annotate-http env vars
		gcloud.Run(t, fmt.Sprintf("functions deploy %s --region=%s --trigger-http --source=%s --gen2 --update-env-vars=FEATURES=TEXT_DETECTION --format=json",
			annotateHttpFunctionName, annotateHttpFunctionRegion, sourceCodeUrl), gcloudArgs)

		// Check the RESTful API annotation
		request := gorequest.New()
		resp, body, errs := request.Post(annotateUrl).
			Type("multipart").
			Send(`{"image_uri": "` + imageURI + `"}`).
			Retry(5, 5 * time.Second, http.StatusBadRequest, http.StatusInternalServerError).
			End()
		for _, err := range errs {
			assert.NoError(err)
		}
		assert.Equal(http.StatusOK, resp.StatusCode)

		// Check the RESTful API annotation response
		var annotateResult map[string]any
		err := json.Unmarshal([]byte(body), &annotateResult)
		assert.NoError(err)
		textAnnotations := annotateResult["textAnnotations"].([]interface{})
		assert.NotEmpty(textAnnotations)

		// Check the annotation result file
		testResultJsonFileName := testFileName + ".json"
		gcloud.Run(t, fmt.Sprintf("storage cp %s/%s testfile/ --format=json", bucketName, testResultJsonFileName), gcloudArgs)
		jsonFile, err := os.Open(fmt.Sprintf("testfile/%s", testResultJsonFileName))
		assert.NoError(err)
		defer jsonFile.Close()
		byteValue, _ := ioutil.ReadAll(jsonFile)
		err = json.Unmarshal(byteValue, &annotateResult)
		assert.NoError(err)
		textAnnotations = annotateResult["textAnnotations"].([]interface{})
		assert.NotEmpty(textAnnotations)

		// Check the RESTful API error code
		resp, _, errs = request.Post(annotateUrl).
			Type("multipart").
			Send(`{"features": ["FACE_DETECTION"]}`).
			Retry(5, 5 * time.Second, http.StatusBadRequest, http.StatusInternalServerError).
			End()
		for _, err := range errs {
			assert.NoError(err)
		}
		assert.Equal(http.StatusPreconditionFailed, resp.StatusCode)

		resp, _, errs = request.Put(annotateUrl).
			Type("multipart").
			Send(`{"image_uri": "` + imageURI + `"}`).
			Send(`{"features": ["FACE_DETECTION"]}`).
			Retry(5, 5 * time.Second, http.StatusBadRequest, http.StatusInternalServerError).
			End()
		for _, err := range errs {
			assert.NoError(err)
		}
		assert.Equal(http.StatusNotImplemented, resp.StatusCode)
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
