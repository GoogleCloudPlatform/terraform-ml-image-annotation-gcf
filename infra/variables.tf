/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

variable "project_id" {
  description = "GCP project ID."
  type        = string
  validation {
    condition     = var.project_id != ""
    error_message = "Error: project_id is required"
  }
}

variable "time_to_enable_apis" {
  description = "Time to enable APIs, approximate estimate is 5 minutes, can be more."
  type        = string
  default     = "420s"
}

variable "gcf_location" {
  description = "GCF deployment location/region."
  type        = string
  default     = "us-west4" #us-central1
}

variable "gcf_max_instance_count" {
  type        = number
  description = "MAX number of GCF instances"
  default     = 10
}

variable "gcf_timeout_seconds" {
  type        = number
  description = "GCF execution timeout"
  default     = 120
}

variable "gcf_http_ingress_type_index" {
  type        = number
  description = "Ingres type index."
  default     = 0 # should be 1 or 2 in production environments
  # Index values map into:[ALLOW_ALL ALLOW_INTERNAL_ONLY ALLOW_INTERNAL_AND_GCLB]
}

variable "gcf_require_http_authentication" {
  type        = bool
  description = "Require authentication. Manage authorized users with Cloud IAM."
  default     = false # should be true in production environments
}

variable "gcf_annotation_features" {
  type        = string
  description = "Requested annotation features."
  default     = "FACE_DETECTION,PRODUCT_SEARCH,SAFE_SEARCH_DETECTION"
  # options: CROP_HINTS,DOCUMENT_TEXT_DETECTION,FACE_DETECTION,IMAGE_PROPERTIES,LABEL_DETECTION,
  #           LANDMARK_DETECTION,LOGO_DETECTION,OBJECT_LOCALIZATION,PRODUCT_SEARCH,SAFE_SEARCH_DETECTION,
  #           TEXT_DETECTION,WEB_DETECTION
}

variable "gcf_log_level" {
  type        = string
  description = "Set logging level for cloud functions."
  default     = ""
  # options are empty string or python logging level: NOTSET, DEBUG,INFO, WARNING, ERROR, CRITICAL
}


variable "labels" {
  description = "A map of key/value label pairs to assign to the resources."
  type        = map(string)

  default = {
    app = "terraform-ml-image-annotation-gcf"
  }
}
