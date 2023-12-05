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

# Set up BigQuery resources
# # Create the BigQuery dataset
resource "google_bigquery_dataset" "ds_edw" {
  project                    = module.project-services.project_id
  dataset_id                 = "thelook"
  friendly_name              = "My EDW Dataset"
  description                = "My EDW Dataset with tables"
  location                   = var.region
  labels                     = var.labels
  delete_contents_on_destroy = var.force_destroy

  depends_on = [time_sleep.wait_after_apis]
}

## Need to update
# # Create a table for the data
resource "google_bigquery_table" "tbl_edw_products" {
  dataset_id          = google_bigquery_dataset.ds_edw.dataset_id
  table_id            = "products"
  project             = module.project-services.project_id
  deletion_protection = var.deletion_protection

  schema = file("${path.module}/src/schema/products_schema.json")
  labels = var.labels
}

# # Add Sample Queries
resource "google_bigquery_routine" "sp_sample_queries" {
  project      = module.project-services.project_id
  dataset_id   = google_bigquery_dataset.ds_edw.dataset_id
  routine_id   = "sp_sample_queries"
  routine_type = "PROCEDURE"
  language     = "SQL"
  definition_body = templatefile("${path.module}/src/sql/sp_sample_queries.sql", {
    project_id = module.project-services.project_id,
    dataset_id = google_bigquery_dataset.ds_edw.dataset_id
    }
  )

  depends_on = [
    google_bigquery_table.tbl_edw_inventory_items,
    google_bigquery_table.tbl_edw_order_items,
  ]
}
