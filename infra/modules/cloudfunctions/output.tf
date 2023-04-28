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

output "function_uri" {
  description = "Cloud Function URI and ingress parameters."
  value = [
    google_cloudfunctions2_function.annotate_http.service_config[0].uri,
    "ingressIndex:${var.gcf_http_ingress_type_index}",
    "ingressValue:${var.gcf_http_ingress_types_list[var.gcf_http_ingress_type_index]}",
    "isAuthenticated:${var.gcf_require_http_authentication} ",
  ]
}

output "gcf_sa" {
  description = "Cloud Functions SA."
  value       = "GCF SA=${google_service_account.gcf_sa.email}"
}

output "gcs_account" {
  description = "Cloud StorageS SA."
  value       = "GCF SA=${data.google_storage_project_service_account.gcs_account.email_address}"
}
