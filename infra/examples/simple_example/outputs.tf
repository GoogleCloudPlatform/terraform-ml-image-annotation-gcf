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

output "vision_annotations_gcs" {
  description = "Cloud Storage of the vision annotations"
  value       = module.simple.vision_annotations_gcs
}

output "vision_input_gcs" {
  description = "Cloud Storage of the vision input"
  value       = module.simple.vision_input_gcs
}

output "vision_entrypoint_url" {
  description = "The URL for requesting online prediction with HTTP request."
  value       = module.simple.vision_entrypoint_url
}

output "annotate_gcs_function_name" {
  description = "The name of the cloud function that annotates an image triggered by a GCS event."
  value       = module.simple.annotate_gcs_function_name
}
