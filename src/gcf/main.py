# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
import os
import sys

# Imports Python standard library logging
# Logs show fine in the Cloud Logs explorer, but in GCF LOGS, they show HTTP logging request.
import logging
from typing import List, Optional, Tuple

import functions_framework
from flask import make_response
from google.cloud import logging as cloud_logging
from google.cloud import storage

from vertexai.vision_models import ImageQnAModel
from vertexai.vision_models import Image


# Variables

GCP_PROJECT_ENV = "GCP_PROJECT"
OUTPUT_BUCKET_ENV = "OUTPUT_BUCKET"

DEFAULT_QUESTION = "What is this?"
DEFAULT_NUMBER_OF_RESULTS = 3

FILE_LIST_SIZE_MAX = 8196
NUM_EMBEDDED_ANNOTATIONS_MAX = 10

TEST_IMAGE = "gs://cloud-samples-data/vision/eiffel_tower.jpg"
project_id = os.environ.get(GCP_PROJECT_ENV, None)
output_bucket = os.environ.get(OUTPUT_BUCKET_ENV, None)

# Logging

# Instantiates a client
logging_client = cloud_logging.Client()
# Retrieves a Cloud Logging handler based on the environment
# you're running in and integrates the handler with the
# Python logging module. By default this captures all logs
# at INFO level and higher
logging_client.setup_logging()

# The name of the log to write to
LOG_NAME = "vision-api"
# Selects the log to write to
logger = logging_client.logger(LOG_NAME)

# By default, disable logging for production:
logging.disable(sys.maxsize)
log_level = os.environ.get("LOG_LEVEL", None)
# if user set log level, enable logging and set the level
if log_level:
    logging.disable(logging.NOTSET)
    logging.getLogger().setLevel(log_level)


# Storage

def gcs_write(
        bucket_name: str, 
        file_name: str,
        content: str):
    """Write and read a blob from GCS using file-like IO.

    Args:
        bucket_name: name of the GCS bucket where content will be stored
        file_name: name of the file
        content: content to be stored into the file
    """

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(get_file_name(file_name)+".txt")
    # write the <content> into the file/blob
    with blob.open("w") as fp:
        fp.write(content)

def read_file_from_gcs(
        bucket: str,
        file_path: str
) -> bytes:
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket)
    blob = bucket.blob(file_path)
    # Return the object as bytes
    return blob.download_as_bytes()

def pretty_print_file(
    bucket: str,
    file_path: str
) -> str:
    return "gs://{}/{}".format(bucket,file_path)

def get_file_name(
    file_path: str
) -> str:
    filename = file_path.split("/")[-1]
    return (filename.split(".")[0])

def list_bucket_object_names(
    bucket_name: str,
    max_results: Optional[int] = 2048
) -> Optional[List[str]]:
    """Lists all the objects in the bucket."""
    storage_client = storage.Client()
    try:
        blobs = storage_client.list_blobs(bucket_name, max_results=max_results)
        blob_list = []
        for blob in blobs:
            blob_list.append(blob.name)
        return blob_list
    except Exception:
        pass
    return None

# Helper functions

def parse_request_json(
    request_json: str
) -> Tuple[str, str, str, str, int]:
    method = request_json["vision_api_method"]
    image_bucket = request_json["image_bucket"]
    image_file = request_json["image_file"]
    vqa_question = DEFAULT_QUESTION
    vqa_num_results = DEFAULT_NUMBER_OF_RESULTS
    if method == "vqa":
        vqa_question = request_json["vqa_question"]
        vqa_num_results = request_json["vqa_num_results"]
    return method, image_bucket, image_file, vqa_question, vqa_num_results


def read_and_infer(
    vqa_question: str,
    vqa_num_results: int,
    image_bucket: str,
    image_list: List[str]
) -> None:
    for image_file_name in image_list:
        image_bytes = read_file_from_gcs(image_bucket, image_file_name)
        vqa_results = vqa(image_bytes, vqa_question, vqa_num_results)
        contents = {
            "File URI" : pretty_print_file(image_bucket,image_file_name),
            "Prompt" : vqa_question,
            "Number of requested results": vqa_num_results,
            "Responses" : ",".join(vqa_results)
        }
        gcs_write(output_bucket, image_file_name, json.dumps(contents))


def vqa(
    image_bytes: bytes,
    image_prompt: str,
    num_results: int
) -> List[str]:
    # VQA V1 client
    image_qna_model = ImageQnAModel.from_pretrained("imagetext@001")
    # Load the bytes into the Image handler
    input_image = Image(image_bytes)
    # Ask the VQA the question and return the results
    return image_qna_model.ask_question(
        image=input_image,
        question=image_prompt,
        number_of_results=num_results
    )


# Entrypoints

@functions_framework.http
def annotate_http(request):
    """HTTP Cloud Function.

    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The image anotation response as JSON or an HTTP error.
        Response object is AnnotateImageResponse,
        explained in: <https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse>
    """
    # Expect a JSON request
    content_type = request.headers["content-type"]
    request_json = None
    if content_type == "application/json":
        request_json = request.get_json()

    api_method, image_bucket, image_file, vqa_question, vqa_num_results = parse_request_json(
        request_json)

    response = make_response("Success", 200)
    image_list = []
    if image_file is not None:
        image_list.append(image_file)
    else:
        image_list = list_bucket_object_names(image_bucket)

    if api_method == "vqa":
        read_and_infer(vqa_question, vqa_num_results, image_bucket, image_list)
        response = make_response("VQA Inference to Pub/Sub Success", 200)

    # TODO: Actually make a response
    return response


# Triggered when a new object is created in the GCS bucket.


@functions_framework.cloud_event
def annotate_gcs(cloud_event):
    """Annotate image dropped into GCS bucket.

    Terraform configuration subscribes this function for the events generated by GCS bucket.
    event_trigger {
        trigger_region = var.gcf_location # The trigger must be in the same location as the bucket
        event_type = "google.cloud.storage.object.v1.finalized"
        retry_policy = "RETRY_POLICY_RETRY"
        service_account_email = google_service_account.gcf-sa.email
        event_filters {
        attribute = "bucket"
        value = var.input-bucket
        }
    }

    Args:
        cloud_event: is event generated by GCS bucket when new object is created
    """

    # read notification event data, showing also variables which are not used in this code
    data = cloud_event.data
    event_id = cloud_event["id"]
    event_type = cloud_event["type"]
    src_bucket = data["bucket"]
    image_file_name = data["name"]
    logging.info(
        f"Received event {event_type} id={event_id} from {src_bucket} for file {image_file_name}"
    )

    read_and_infer(DEFAULT_QUESTION, DEFAULT_NUMBER_OF_RESULTS, src_bucket, [image_file_name])
    response = make_response("VQA Inference to Pub/Sub Success", 200)
    return response
