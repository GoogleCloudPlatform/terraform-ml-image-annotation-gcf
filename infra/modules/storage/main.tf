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

data "google_project" "project" {}

# input bucket for images
resource "google_storage_bucket" "vision-input" {
  name                        = "vision-input-${data.google_project.project.number}"
  location                    = var.gcf_location
  uniform_bucket_level_access = true
  force_destroy               = true
  labels                      = var.labels
}

# output bucket for prediction JSON files
resource "google_storage_bucket" "vision-annotations" {
  name                        = "vision-annotations-${data.google_project.project.number}"
  location                    = var.gcf_location
  uniform_bucket_level_access = true
  force_destroy               = true
  labels                      = var.labels
}
