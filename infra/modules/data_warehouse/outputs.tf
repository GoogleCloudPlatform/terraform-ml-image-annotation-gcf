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

output "ds_friendly_name" {
  value       = google_bigquery_dataset.ds_edw.friendly_name
  description = "Dataset name"
}

output "neos_tutorial_url" {
  value       = "https://console.cloud.google.com/products/solutions/deployments?walkthrough_id=panels--sic--data-warehouse_toc"
  description = "The URL to launch the in-console tutorial for the EDW solution"
}
