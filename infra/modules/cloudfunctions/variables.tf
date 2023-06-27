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


variable "gcf_location" {
  description = "GCF deployment region"
  type        = string
}

variable "input-bucket" {
  description = "Input bucket name"
  type        = string
}

variable "annotations-bucket" {
  description = "Annotations bucket name"
  type        = string
}

variable "gcr_invoker_members" {
  type        = list(string)
  description = "IAM members."
  default     = ["allUsers"]
}

variable "gcr_role_invoker" {
  type        = string
  description = "IAM role GCR invoker."
  default     = "roles/run.invoker"
}

variable "gcf_max_instance_count" {
  type        = number
  description = "MAX number of GCF instances"
}

variable "gcf_timeout_seconds" {
  type        = number
  description = "GCF execution timeout"
}

variable "gcf_http_ingress_type_index" {
  type        = number
  description = "Ingres type index."
}

variable "gcf_http_ingress_types_list" {
  type        = list(any)
  description = "Ingres type values"
  default = ["ALLOW_ALL",
    "ALLOW_INTERNAL_ONLY",
  "ALLOW_INTERNAL_AND_GCLB"]
}


variable "gcf_require_http_authentication" {
  type        = bool
  description = "Create HTTP API with public, unauthorized access."
}

variable "gcf_annotation_features" {
  type        = string
  description = "Requested annotation features."
}

variable "gcf_log_level" {
  type        = string
  description = "Set logging level for cloud functions."
}

variable "labels" {
  description = "A map of key/value label pairs to assign to the resources."
  type        = map(string)
}