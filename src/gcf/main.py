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

import collections
import io
import json
import os
import sys

# Imports Python standard library logging
# Logs show fine in the Cloud Logs explorer, but in GCF LOGS, they show HTTP logging request.
import logging
from typing import Dict, List, Optional, OrderedDict
from urllib import parse

import functions_framework
from flask import Request, Response, make_response, send_file
from google.cloud import logging as cloud_logging
from google.cloud import storage, vision

from vertexai.vision_models import ImageQnAModel
from google.cloud import aiplatform
from vertexai.vision_models import Image
from flask import jsonify
from google.cloud import storage
from urllib.parse import urlparse
import functions_framework

# Pub/Sub Imports
from concurrent import futures
from google.cloud import pubsub_v1
from typing import Callable


####################
### Variables ######
####################

FEATURES_ENV = "FEATURES"
INPUT_BUCKET_ENV = "INPUT_BUCKET"
ANNOTATIONS_BUCKET_ENV = "ANNOTATIONS_BUCKET"
GCP_PROJECT_ENV = "GCP_PROJECT"
PUBSUB_TOPIC_ENV = "PUBSUB_TOPIC"

FILE_LIST_SIZE_MAX = 8196
NUM_EMBEDDED_ANNOTATIONS_MAX = 10

TEST_IMAGE = "gs://cloud-samples-data/vision/eiffel_tower.jpg"
project_id = os.environ.get(GCP_PROJECT_ENV, None)
topic_id = os.environ.get(PUBSUB_TOPIC_ENV, None)
#aiplatform.init(project=project_id)


#####################
##### Logging #######
#####################

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

#####################
##### Clients #######
#####################
# Create all the clients that can be reused
# Storage client for GCS
storage_client = storage.Client()
# VQA V1 client 
image_qna_model = ImageQnAModel.from_pretrained("imagetext@001")
# Pub/Sub client
publisher = pubsub_v1.PublisherClient()
publish_futures = []

# This is the function that calls the VQA function
def vqa (
        image_bytes: bytes,
        image_prompt: str,
        num_results: int
    ) -> list[str]:
    # Load the bytes into the Image handler
    input_image = Image(image_bytes)
    # Ask the VQA the question and return the results
    return image_qna_model.ask_question(
        image=input_image,
        question=image_prompt,
        number_of_results=num_results
    )

# Helper function to split apart the GCS URI 
def decode_gcs_url(
        url: str
    ) -> tuple[str,str] :
    # Read the URI and parse it
    p = urlparse(url)
    bucket = p.netloc
    file_path = p.path[0:].split('/', 1)
    # Return the relevant objects (bucket, path to object)
    return bucket, file_path[1]

# We can't use the image load from local file since it expects a local path
# We use a GCS URL and get the bytes of the image 
def read_file_from_gcs(
        bucket: str,
        file_path: str
        ) -> bytes:
    bucket = storage_client.bucket(bucket)
    blob = bucket.blob(file_path)
    # Return the object as bytes
    return blob.download_as_bytes()

########################
### Pub/Sub Section ####
########################

"""Publishes multiple messages to a Pub/Sub topic with an error handler."""
def get_callback(
        publish_future: pubsub_v1.publisher.futures.Future, data: str
    ) -> Callable[[pubsub_v1.publisher.futures.Future], None]:
    def callback(publish_future: pubsub_v1.publisher.futures.Future) -> None:
        try:
            # Wait 60 seconds for the publish call to succeed.
            print(publish_future.result(timeout=60))
        except futures.TimeoutError:
            print(f"Publishing {data} timed out.")

    return callback

# TODO: need to add code to split the payloads if too large
def pub_sub_write(
        project_id: str,
        topic_id: str, 
        data_payloads: list[str]
    ) -> None:
    topic_path = publisher.topic_path(project_id, topic_id)
    for data_payload in data_payloads:
        publish_future = publisher.publish(topic_path, data_payload.encode("utf-8"))
        # Non-blocking. Publish failures are handled in the callback function.
        publish_future.add_done_callback(get_callback(publish_future, data_payload))
        publish_futures.append(publish_future)

    # Wait for all the publish futures to resolve before exiting.
    futures.wait(publish_futures, return_when=futures.ALL_COMPLETED)

def list_bucket_object_names(
        bucket_name: str, max_results: Optional[int] = 2048
    ) -> Optional[List[storage.Blob]]:
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

def parse_request_json(
        request_json: str
    ) -> tuple[str,str,str,str,int]:
    method = request_json["vision_api_method"]
    image_bucket = request_json["image_bucket"]
    image_file = request_json["image_file"]
    vqa_question = None
    vqa_num_results = None
    if method == "vqa":
        vqa_question = request_json["vqa_question"]
        vqa_num_results = request_json["vqa_num_results"]
    return method, image_bucket, image_file, vqa_question, vqa_num_results

def read_and_infer(
        vqa_question: str,
        vqa_num_results: int,
        image_bucket: str,
        image_list: list(str)
    ) -> None:
    payload_list = []
    for image_file_name in image_list:
        image_bytes = read_file_from_gcs(image_bucket,image_file_name)
        vqa_results = vqa(image_bytes,vqa_question,vqa_num_results)
        payload_list.append(",".join(vqa_results))
    pub_sub_write(project_id,topic_id,payload_list)

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

    api_method, image_bucket, image_file, vqa_question, vqa_num_results = parse_request_json(request_json)

    image_list = []
    if image_file is not None:
        image_list.append(image_file)
    else:
        image_list = list_bucket_object_names(image_bucket)

    if api_method == "vqa":
        read_and_infer(vqa_question,vqa_num_results,image_bucket,image_list)

    # TODO: Actually make a response
    response = make_response("Toodles",200)
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

    default_question = "What is this"
    default_number_of_results = 3

    read_and_infer(default_question,default_number_of_results,src_bucket,[image_file_name])