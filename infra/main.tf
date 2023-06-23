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

data "google_project" "project" {
  depends_on = [
    google_project_service.enabled
  ]
  project_id = var.project_id
}

resource "google_project_service_identity" "eventarc" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "eventarc.googleapis.com"

  depends_on = [
    google_project_service.enabled
  ]
}

resource "google_project_iam_member" "eventarc_sa_role" {
  project = data.google_project.project.project_id
  role    = "roles/eventarc.serviceAgent"
  member  = "serviceAccount:${google_project_service_identity.eventarc.email}"
}


resource "null_resource" "previous_time" {}

# gate resource creation until APIs are enabled, using approximate timeout
# if terraform reports an error, run "apply" again
resource "time_sleep" "wait_for_apis" {
  depends_on = [
    null_resource.previous_time,
    google_project_service.enabled,
    google_project_iam_member.eventarc_sa_role
  ]

  create_duration = var.time_to_enable_apis
}

data "google_compute_zones" "cz_available" {
  depends_on = [
    google_project_service.enabled
  ]
  project = var.project_id
  region  = var.gcf_location
}

# Service Account for GCS, generates/publishes bucket events.
data "google_storage_project_service_account" "gcs_account" {
  depends_on = [time_sleep.wait_for_apis]
}

data "google_compute_default_service_account" "default" {
  depends_on = [time_sleep.wait_for_apis]
}

module "storage" {
  source = "./modules/storage"
  depends_on = [
    data.google_project.project,
    time_sleep.wait_for_apis,                                # this prevents errors in the initial apply due to APIs not being ready
    data.google_compute_default_service_account.default,     # gate until this exists, created by the API
    data.google_storage_project_service_account.gcs_account, # gate until this exists, created by the API
    data.google_compute_zones.cz_available
  ]

  gcf_location = var.gcf_location

}

module "cloudfunctions" {
  source     = "./modules/cloudfunctions"
  depends_on = [time_sleep.wait_for_apis]

  gcf_location           = var.gcf_location
  gcf_max_instance_count = var.gcf_max_instance_count
  gcf_timeout_seconds    = var.gcf_timeout_seconds

  input-bucket       = module.storage.gcs_input
  annotations-bucket = module.storage.gcs_annotations

  gcf_http_ingress_type_index     = var.gcf_http_ingress_type_index
  gcf_require_http_authentication = var.gcf_require_http_authentication

  gcf_annotation_features = var.gcf_annotation_features
  gcf_log_level           = var.gcf_log_level
}
