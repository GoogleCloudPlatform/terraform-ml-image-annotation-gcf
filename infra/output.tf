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

output "vision_entrypoint_url" {
  description = "The URL for requesting online prediction with HTTP request."
  value       = module.cloudfunctions.function_uri
}

output "vision_input_gcs" {
  description = "Input GCS bucket name."
  value       = "gs://${module.storage.gcs_input}"
}

output "vision_annotations_gcs" {
  description = "Output GCS bucket name."
  value       = "gs://${module.storage.gcs_annotations}"
}

output "neos_walkthrough_url" {
  description = "Neos Tutorial URL"
  value       = "https://console.cloud.google.com/products/solutions/deployments?walkthrough_id=solutions-in-console--image-processing--image-processing-gcf_tour"
}
