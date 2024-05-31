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
	//"mime/multipart"
	"testing"
	"bytes"
	"time"
	"strings"
	"regexp"
	"encoding/json"
	// "os"
	// "io/ioutil"

	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/gcloud"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/tft"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/utils"
	"github.com/stretchr/testify/assert"
	// "github.com/parnurzeal/gorequest"
)

type TestParams struct {
	t *testing.T
	assert *assert.Assertions
	example *tft.TFBlueprintTest
	projectId string
}

// Retry if these errors are encountered.
var retryErrors = map[string]string{
	// IAM for Eventarc service agent is eventually consistent
	".*Permission denied while using the Eventarc Service Agent.*": "Eventarc Service Agent IAM is eventually consistent",
}

func TestSimpleExample(t *testing.T) {

	example := tft.NewTFBlueprintTest(t, tft.WithRetryableTerraformErrors(retryErrors, 10, time.Minute))

	example.DefineVerify(func(assert *assert.Assertions) {
		projectId := example.GetTFSetupStringOutput("project_id")

		// Use publicly available image url
		visionApiMethod:= "vqa"
		vqaQuestion:= "What is this?"
		vqaNumResults:= "1"
		imageBucket:= "cloud-samples-data"
		imageFile:= "vision/eiffel_tower.jpg"
		visionEntrypointUrlArr := strings.Fields(example.GetStringOutput("vision_prediction_url"))
		annotateUrl := strings.Trim(visionEntrypointUrlArr[0], "[]") + "/annotate"

		testParams := TestParams{t, assert, example, projectId}
		// Check if the vision input and annotations buckets exists
		outputBucketName, inputBucketName := testBucketExists(testParams)
		UNUSED(outputBucketName, inputBucketName)

		// Check Cloud Function status and trigger region
		annotateGcsFunctionName, annotateGcsFunctionRegion, annotateHttpFunctionName, annotateHttpFunctionRegion := testFunctionExists(testParams)
		UNUSED(annotateGcsFunctionName, annotateGcsFunctionRegion, annotateHttpFunctionName, annotateHttpFunctionRegion)

		// Check the RESTful API annotation
		testNormalAnnotateApi(testParams, annotateUrl, visionApiMethod, vqaQuestion, vqaNumResults, imageBucket, imageFile)

	})
	example.Test()
}

func testBucketExists(testParams TestParams) (string, string) {
	gcloudArgs := gcloud.WithCommonArgs([]string{"--project", testParams.projectId})
	// Check if the vision annotations bucket exists
	outputBucketName := testParams.example.GetStringOutput("vision_annotations_gcs")
	storage := gcloud.Run(testParams.t, fmt.Sprintf("storage buckets describe %s --format=json", outputBucketName), gcloudArgs)
	testParams.assert.NotEmpty(storage)

	// Check if the vision input bucket exists
	inputBucketName := testParams.example.GetStringOutput("vision_input_gcs")
	storage = gcloud.Run(testParams.t, fmt.Sprintf("storage buckets describe %s --format=json", inputBucketName), gcloudArgs)
	testParams.assert.NotEmpty(storage)
	return outputBucketName, inputBucketName
}

// UNUSED allows unused variables to be included in Go programs
func UNUSED(x ...interface{}) {}

func testFunctionExists(testParams TestParams) (string, string, string, string) {
	gcloudArgs := gcloud.WithCommonArgs([]string{"--project", testParams.projectId})
	// Check Cloud Function status and trigger region
	var match []string
	annotateGcsFunctionName := testParams.example.GetStringOutput("annotate_gcs_function_name")
	annotateGcsFunctionRegion := ""
	annotateGcsFunctionSelfLink := fmt.Sprintf("functions/%s", annotateGcsFunctionName)
	annotateHttpFunctionName := testParams.example.GetStringOutput("annotate_http_function_name")
	annotateHttpFunctionRegion := ""
	annotateHttpFunctionSelfLink := fmt.Sprintf("functions/%s", annotateHttpFunctionName)
	functions := gcloud.Run(testParams.t, ("functions list --format=json"), gcloudArgs).Array()
	for _, function := range functions {
		state := function.Get("state").String()
		testParams.assert.Equal("ACTIVE", state, "expected Cloud Function to be active")
		functionName := function.Get("name").String()
		eventTrigger := function.Get("eventTrigger")
		if len(eventTrigger.String()) > 0 && strings.Contains(functionName, annotateGcsFunctionSelfLink) {
			fmt.Printf("eventTrigger: %s\n", eventTrigger.String())
			annotateGcsFunctionRegion = eventTrigger.Get("triggerRegion").String()
			fmt.Printf("triggerRegion: %s\n", annotateGcsFunctionRegion)
		}
		if strings.Contains(functionName, annotateHttpFunctionSelfLink) {
			reg := regexp.MustCompile(`locations/([^/]+)/`)
			match = reg.FindStringSubmatch(functionName)
		}
		if len(match) > 1 {
			annotateHttpFunctionRegion = match[1]
		}
	}
	testParams.assert.NotEmpty(annotateGcsFunctionRegion)
	testParams.assert.NotEmpty(annotateHttpFunctionRegion)

	// Check the eventTrigger for the annotate_gcs function
	annotateGcsFunction := gcloud.Run(testParams.t, fmt.Sprintf("functions describe %s --region %s --gen2 --format=json", annotateGcsFunctionName, annotateGcsFunctionRegion), gcloudArgs)
	topicName := annotateGcsFunction.Get("eventTrigger").Get("pubsubTopic").String()
	topic := gcloud.Run(testParams.t, fmt.Sprintf("pubsub topics describe %s --format=json", topicName), gcloudArgs)
	testParams.assert.NotEmpty(topic)

	// Check Cloud Function source code exists
	annotateHttpFunction := gcloud.Run(testParams.t, fmt.Sprintf("functions describe %s --region %s --gen2 --format=json", annotateHttpFunctionName, annotateHttpFunctionRegion), gcloudArgs)
	annotateHttpSourceBucket := annotateHttpFunction.Get("buildConfig.source.storageSource.bucket").String()
	annotateHttpSourceObject := annotateHttpFunction.Get("buildConfig.source.storageSource.object").String()
	annotateHttpSource := gcloud.Run(testParams.t, fmt.Sprintf("storage objects describe gs://%s/%s --format=json", annotateHttpSourceBucket, annotateHttpSourceObject), gcloudArgs)
	testParams.assert.NotEmpty(annotateHttpSource)

	annotateGcsSourceBucket := annotateGcsFunction.Get("buildConfig.source.storageSource.bucket").String()
	annotateGcsSourceObject := annotateGcsFunction.Get("buildConfig.source.storageSource.object").String()
	annotateGcsSource := gcloud.Run(testParams.t, fmt.Sprintf("storage objects describe gs://%s/%s --format=json", annotateGcsSourceBucket, annotateGcsSourceObject), gcloudArgs)
	testParams.assert.NotEmpty(annotateGcsSource)

	return annotateGcsFunctionName, annotateGcsFunctionRegion, annotateHttpFunctionName, annotateHttpFunctionRegion
}

func testNormalAnnotateApi(testParams TestParams, annotateUrl string, visionApiMethod string, vqaQuestion string, vqaNumResults string, imageBucket string, imageFile string) {
	// Call the annotate API
	isServing := func() (bool, error) {
		postBody, _ := json.Marshal(map[string]string{
			"vision_api_method":  visionApiMethod,
			"vqa_question": vqaQuestion,
			"vqa_num_results": vqaNumResults,
			"image_bucket": imageBucket,
			"image_file": imageFile,
		})
		resp, err := http.Post(annotateUrl, "application/json", bytes.NewBuffer(postBody))
		if err != nil || resp.StatusCode != 200 {
			// retry if err or status not 200
			return true, nil
		}
		return false, nil
	}
	utils.Poll(testParams.t, isServing, 20, time.Second * 10)
}
