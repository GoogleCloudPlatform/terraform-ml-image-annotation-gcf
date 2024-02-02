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

FEATURES_ENV = "FEATURES"
INPUT_BUCKET_ENV = "INPUT_BUCKET"
ANNOTATIONS_BUCKET_ENV = "ANNOTATIONS_BUCKET"

FILE_LIST_SIZE_MAX = 8196
NUM_EMBEDDED_ANNOTATIONS_MAX = 10

TEST_IMAGE = "gs://cloud-samples-data/vision/eiffel_tower.jpg"

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


def read_vision_image_from_gcs(
    bucket_name: str, file_name: str
) -> Optional[vision.Image]:
    """Read image from the bucket.

    Args:
        bucket_name: bucket name containingh image
        file_name: path+pile name for the image

    Returns:
        Image: an optional vision.Image object.
    """

    logging.info(f"Reading image {bucket_name}/{file_name}")
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    with blob.open("rb") as fp:
        content = fp.read()
    if content:
        image = vision.Image(content=content)
        return image
    return None


def get_all_vision_features() -> List[Dict[str, vision.Feature.Type]]:
    """Gets a list of all Vision features.

    Returns:
        list: A list of all available features.
    """
    return [{"type_": feature} for feature in vision.Feature.Type if feature != 0]


def get_feature_by_name(feature_name: str) -> Optional[vision.Feature.Type]:
    """Gets a vision feature if it exists.

    Args:
        feature_name: Vision feature name.

    Returns:
        feature: a vision.Feature.Type matching name.
    """

    for feature in vision.Feature.Type:
        if feature.name == feature_name:
            return feature
    return None


def build_features_list(feature_names: str) -> Optional[list]:
    """Gets a list of Vision features for given list of names.

    Args:
        feature_names: a comma-delimited list of feature names.

    Returns:
        list: a list of vision.Feature.Type matching names in the input.
    """

    features_list = []
    features_items = feature_names.split(",")
    for feature_name in features_items:
        feature = get_feature_by_name(feature_name.upper().strip('"').strip())
        if feature:
            features_list.append({"type_": feature})
    return features_list


def annotate_image_uri(image_uri: str, detect_features: Optional[list] = None) -> str:
    """Calculate annotations for the image referenced by the URI.

    Args:
        image_uri: URI pointing to the image
        detect_features: a list of Vision Feature Types

    Returns:
        string: JSON with annotations built from vision.AnnotateImageResponse
    """

    logging.info("Annotate image: %s", image_uri)
    vision_client = vision.ImageAnnotatorClient()
    logging.info("Building Vision Image object.")
    vision_image = vision.Image()
    vision_image.source.image_uri = image_uri
    logging.info("Building Request")
    request = vision.AnnotateImageRequest(image=vision_image, features=detect_features)
    logging.info("Annotating image.")
    response = vision_client.annotate_image(request, timeout=120.0)
    json_string = type(response).to_json(response)
    return json_string


def annotate_image(
    vision_image: vision.Image, detect_features: Optional[list] = None
) -> str:
    """Calculate annotations for the image referenced by URI.

    Args:
        image: a Vision Image object containing image data.
        detect_features: a list of Vision Feature Types

    Returns:
        string: JSON with annotations built from vision.AnnotateImageResponse
    """
    logging.info("annotate_image()")
    vision_client = vision.ImageAnnotatorClient()
    logging.info("Building Request")
    request = vision.AnnotateImageRequest(image=vision_image, features=detect_features)
    logging.info("Annotating image.")
    response = vision_client.annotate_image(request, timeout=120.0)
    json_string = type(response).to_json(response)
    return json_string


# ------- GCS ------


def gcs_write(bucket_name, file_name, content):
    """Write and read a blob from GCS using file-like IO.

    Args:
        bucket_name: name of the GCS bucket where content will be stored
        file_name: name of the file
        content: content to be stored into the file
    """

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    # write the <content> into the file/blob
    with blob.open("w") as fp:
        fp.write(content)


def json_filename_for_image(file_name: str) -> str:
    """Returns name of the JSON file for source image file name."""
    return file_name + ".json"


def image_filename_for_json(file_name: str) -> str:
    """Returns name of the image file name for annotation JSON file name."""
    path_items = os.path.splitext(file_name)
    return path_items[0]


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
    # build a list of requested annotation features form environment variable
    features_list = []
    features_env = os.environ.get(FEATURES_ENV, None)
    if features_env is None:
        logging.warn(
            "Annotation features aren't defined in the environment variable %s",
            FEATURES_ENV,
        )
    else:
        logging.info(f"{event_id}: Env. features:{features_env}")
        features_list = build_features_list(features_env)
    logging.info(f"{event_id}: Annotating for features: {features_list}")
    # form environment variable retreive bucket name for results
    annotations_bucket = os.environ.get(ANNOTATIONS_BUCKET_ENV)
    if annotations_bucket is None:
        logging.error("%s is not defined.", ANNOTATIONS_BUCKET_ENV)
        return
    # create result file name:
    annotations_file_name = json_filename_for_image(image_file_name)
    vision_image = read_vision_image_from_gcs(src_bucket, image_file_name)
    if vision_image:
        logging.info(
            f"{event_id}: Loaded {image_file_name} as vision.Image, executing annotations."
        )
        json_result = annotate_image(vision_image, features_list)
        logging.info(f"{event_id}: Annotated image {image_file_name}")
        if json_result:
            logging.info(
                f"{event_id}: Saving JSON: {annotations_bucket}/{annotations_file_name}"
            )
            gcs_write(annotations_bucket, annotations_file_name, json_result)
    else:
        logging.error(f"{event_id}: Image {image_file_name} could not be read.")
    logging.info(f"Event {event_id} is processed")


# -------------  DEMO UI utilities  ----------------------


def list_bucket(
    bucket_name: str, max_results: Optional[int] = 2048
) -> Optional[List[storage.Blob]]:
    """Lists all the blobs in the bucket."""
    storage_client = storage.Client()
    try:
        blobs = storage_client.list_blobs(bucket_name, max_results=max_results)
        return blobs
    except Exception:
        pass
    return None


def read_blob(bucket_name: str, file_name: str) -> Optional[str]:
    """Read an object from the bucket.

    Args:
        bucket_name: bucket name containingh image
        file_name: path+file name for the image

    Returns:
        Object data object.
    """

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    try:
        with blob.open("rb") as fp:
            content = fp.read()
    except Exception:
        return None
    return content


def read_json_str(bucket_name: str, file_name: str) -> Optional[str]:
    """
    Read JSON file from GCS bucket.

    Args:
        bucket_name: bucket name containingh image
        file_name: path+file name of JSON file

    Returns:
        File contents as JSON string.
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    try:
        json_str = blob.download_as_string()
        if json_str:
            json_obj = json.loads(json_str)
            return json_obj
    except Exception:
        pass
    return None


def get_list_of_files(
    imagess_bucket: str,
    annotations_bucket: str,
    start: Optional[str] = None,
    end: Optional[str] = None,
    embed: Optional[str] = None,
) -> Response:
    range_start = 0
    range_end = FILE_LIST_SIZE_MAX
    num_embedded_annotations = 0  # request number of embedded annotation results
    if start:
        try:
            range_start = int(start)
        except ValueError:
            pass
    if end:
        try:
            range_end = int(end)
        except ValueError:
            pass
    if embed:
        try:
            num_embedded_annotations = int(embed)
            # limit numbwer to something reasonable
            if num_embedded_annotations > NUM_EMBEDDED_ANNOTATIONS_MAX:
                num_embedded_annotations = NUM_EMBEDDED_ANNOTATIONS_MAX
        except ValueError:
            pass
    # list images
    image_blobs = list_bucket(imagess_bucket, range_end)
    if not image_blobs:
        return make_response("No images.", 404)
    image_blobs = list(image_blobs)[range_start:range_end]
    # list annotations
    annotation_blobs = list_bucket(annotations_bucket, range_end)
    if not annotation_blobs:
        return make_response("No image annotations.", 404)
    # create a list of JSON file names
    list_of_annotation_names = []
    for annotation_blob in annotation_blobs:
        if annotation_blob.name.lower().endswith(".json"):
            list_of_annotation_names.append(annotation_blob.name)

    list_of_names: OrderedDict[
        str, Optional[OrderedDict[str, Optional[str]]]
    ] = collections.OrderedDict()
    for image_blob in image_blobs:
        json_filename = json_filename_for_image(image_blob.name)
        if json_filename in list_of_annotation_names:
            # optionally fill in JSON annotations, but only if number of files is small
            if num_embedded_annotations > 0:
                json_content = read_json_str(annotations_bucket, json_filename)
                num_embedded_annotations -= 1
            else:
                json_content = None
            annotation = collections.OrderedDict(
                {"annotation": json_filename, "content": json_content}
            )
            list_of_names[image_blob.name] = annotation
        else:
            list_of_names[image_blob.name] = None

    return make_response(json.dumps(list_of_names, indent=2), 200)


def get_image(imagess_bucket, image_name):
    image = read_blob(imagess_bucket, image_name)
    if image:
        return send_file(
            io.BytesIO(image),
            mimetype="image/jpeg",
            as_attachment=False,
            download_name=image_name,
        )
    return make_response("Image not found: %s" % image_name, 404)


def get_annotation(annotations_bucket, annotation_name):
    json = read_json_str(annotations_bucket, annotation_name)
    if json:
        return make_response(json, 200)
    return make_response("Annotation not found: %s" % annotation_name, 404)


def handle_bucket(request: Request):
    """Decode request and dispatch handling to the functions.

    Used by the demo UI to display images and annotation results
    from batch processing in the GCS buckets.

    Args:
        request: Flask HTTP request.aborter

    Returns:
        HTTP response.
    """

    # define return values for invalid request"
    result = "Undefined request: [%s]." % request.args
    error_code = 404
    # get bucket names from env. variables
    imagess_bucket = os.environ.get(INPUT_BUCKET_ENV)
    if imagess_bucket is None:
        logging.error("%s is not defined.", INPUT_BUCKET_ENV)
        return make_response("%s is not defined" % INPUT_BUCKET_ENV, 404)
    annotations_bucket = os.environ.get(ANNOTATIONS_BUCKET_ENV)
    if annotations_bucket is None:
        logging.error("%s is not defined.", ANNOTATIONS_BUCKET_ENV)
        return make_response("%s is not defined" % ANNOTATIONS_BUCKET_ENV, 404)
    result = "Not supported"
    error_code = 501
    # parse URL path
    path_items = request.path.split("?")  # separate args
    path_items = path_items[0].split("/")
    if len(path_items) < 3:
        return make_response(result, error_code)
    if path_items[2].lower() == "list":
        return get_list_of_files(
            imagess_bucket,
            annotations_bucket,
            request.args.get("start"),
            request.args.get("end"),
            request.args.get("embed"),
        )
    elif path_items[2].lower() == "imagedata" and len(path_items) > 3:
        name = path_items[3]
        if name:
            image_name = parse.unquote(name)
            return get_image(imagess_bucket, image_name)
    elif path_items[2].lower() == "annotation" and len(path_items) > 3:
        name = path_items[3]
        if name:
            annotation_name = parse.unquote(name)
            return get_annotation(annotations_bucket, annotation_name)
    return make_response(result, error_code)


def handle_annotation(request):
    """Executes online image annotations.

    Handles GET and POST methods.
    The form in POST method can have image as URI  in the <image_uri> variable
    or base64 encoded image in <image> form variable.
    Optional variable is <features> which overrides a list of
    vision.Feature.Type(s) defined in the environment variable "FEATURES".

    In GET method the image is referenced by the URI in the <image_uri> variable.
    Optional variable is <features> which overrides a list of
    vision.Feature.Type(s) defined in the environment variable "FEATURES".
    Due to the request size limit, GET method can't submit the image.
    """

    features_env = os.environ.get(FEATURES_ENV, None)
    image_uri = None
    image_bin = None
    features_http = None
    # read variables from POST or GET request
    if request.method == "POST":
        content = request.form or request.json
        logging.info("Received content in POST: content=%s" % content)
        features_http = content.get("features")
        image_uri = content.get("image_uri")
        image_b64 = content.get("image")
        if image_b64:
            logging.debug("image_b64 size=%s" % len(image_b64))
            image_bin = image_b64.encode()
            logging.debug("Image size=%s" % len(image_bin))
            logging.info("Converted base64 encoded image from the form.")
        if image_bin is None and request.files and "image" in request.files:
            logging.info(
                "Reading image from attached file %s" % request.files["image"].filename
            )
            file_object = request.files.get("image")
            image_bin = file_object.read()
            logging.debug("image_bin size=%s" % len(image_bin))
    elif request.method == "GET":
        logging.info(
            "Received form in GET path=%s, args=%s" % (request.path, request.args)
        )
        image_uri = request.args.get("image_uri", None)
        features_http = request.args.get("features")
        if not image_uri:  # check if URI is encoded in the path
            path_items = request.path.split("?")  # separate args
            path_items = path_items[0].split("/", 2)
            if len(path_items) >= 3:
                image_uri = path_items[2]
    else:
        return make_response("Not supported", 501)
    # is image input p[resent?
    if image_uri is None and image_bin is None:
        return make_response("No image data", 412)
    # build a list of requested annotation features form environment variable
    features_list = []
    if features_env:
        logging.info("Env. features: %s", features_env)
        features_list = build_features_list(features_env)
    # override annotation features with the ones from the request if provided
    if features_http:
        if isinstance(features_http, list):
            features_http = ','.join(features_http)
        logging.info("Request features: %s", features_http)
        features_list = build_features_list(features_http)
    logging.info("Annotating for features: %s", features_list)
    result = None
    # call Vision image annotation API
    if image_uri:
        logging.info(f"Annotating image from URI {image_uri}")
        result = annotate_image_uri(image_uri, features_list)
    else:
        logging.info("Annotating uploaded image.")
        vision_image = vision.Image(content=image_bin)
        result = annotate_image(vision_image, features_list)
    if result:
        if result.find('"error"') > 0 and result.find('"code":') > 0:
            logging.error("Vision API returned error, check JSON result for details.")
            return make_response(result, 412)  # Vision API returned JSON with an error
        logging.info("Returning annotation result as JSON.")
        return make_response(result, 200)
    logging.error("Annotation result is None.")
    return make_response("Annotation result is None.", 500)


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
    # return display_gcs_http(request)

    # move this into the global section
    # log_level = os.environ.get("LOG_LEVEL", "WARNING")
    # logging.getLogger().setLevel(log_level)
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)
    logging.info(
        "REST API request path=%s, args=%s, form=%s",
        request.path,
        request.args,
        request.form,
    )
    response = None
    path_items = request.path.split("/")
    if len(path_items) >= 2:
        if path_items[1].lower() == "annotate":
            response = handle_annotation(request)
        elif path_items[1].lower() == "bucket" and request.method == "GET":
            response = handle_bucket(request)
    if not response:
        response = make_response("Not supported.", 501)
    # Set CORS headers for the main request
    response.headers["Access-Control-Allow-Origin"] = "*"
    logging.info("REST API response=%s", response.status_code)
    return response
