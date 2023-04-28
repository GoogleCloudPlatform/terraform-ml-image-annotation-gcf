# Infrastructure for image annotation with ML and GCF

Sample infrastructure.

### Tagline

Sample infrastructure tagline.

### Detailed

Sample infrastructure detailed description.

### Architecture

1. Cloud Functions
2. Vision API
3. Cloud Storage

## Documentation

- [Architecture Diagram](todo)

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Inputs

| Name                            | Description                                                          | Type     | Default                                                 | Required |
| ------------------------------- | -------------------------------------------------------------------- | -------- | ------------------------------------------------------- | :------: |
| gcf_annotation_features         | Requested annotation features.                                       | `string` | `"FACE_DETECTION,PRODUCT_SEARCH,SAFE_SEARCH_DETECTION"` |    no    |
| gcf_http_ingress_type_index     | Ingres type index.                                                   | `number` | `0`                                                     |    no    |
| gcf_location                    | GCF deployment location/region.                                      | `string` | `"us-west4"`                                            |    no    |
| gcf_log_level                   | Set logging level for cloud functions.                               | `string` | `""`                                                    |    no    |
| gcf_max_instance_count          | MAX number of GCF instances                                          | `number` | `10`                                                    |    no    |
| gcf_require_http_authentication | Require authentication. Manage authorized users with Cloud IAM.      | `bool`   | `false`                                                 |    no    |
| gcf_timeout_seconds             | GCF execution timeout                                                | `number` | `120`                                                   |    no    |
| project_id                      | GCP project ID.                                                      | `string` | n/a                                                     |   yes    |
| time_to_enable_apis             | Time to enable APIs, approximate estimate is 5 minutes, can be more. | `string` | `"420s"`                                                |    no    |

## Outputs

| Name                   | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| vision_annotations_gcs | Output GCS bucket name.                                     |
| vision_entrypoint_url  | The URL for requesting online prediction with HTTP request. |
| vision_input_gcs       | Input GCS bucket name.                                      |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
