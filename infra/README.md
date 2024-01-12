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

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| enable\_apis | Whether or not to enable underlying apis in this solution. | `string` | `true` | no |
| gcf\_annotation\_features | Requested annotation features. | `string` | `"FACE_DETECTION,PRODUCT_SEARCH,SAFE_SEARCH_DETECTION"` | no |
| gcf\_http\_ingress\_type\_index | Ingres type index. | `number` | `0` | no |
| gcf\_log\_level | Set logging level for cloud functions. | `string` | `""` | no |
| gcf\_max\_instance\_count | MAX number of GCF instances | `number` | `10` | no |
| gcf\_require\_http\_authentication | Require authentication. Manage authorized users with Cloud IAM. | `bool` | `false` | no |
| gcf\_timeout\_seconds | GCF execution timeout | `number` | `120` | no |
| labels | A map of key/value label pairs to assign to the resources. | `map(string)` | <pre>{<br>  "app": "terraform-ml-image-annotation-gcf"<br>}</pre> | no |
| project\_id | GCP project ID. | `string` | n/a | yes |
| region | GCF deployment location/region. | `string` | `"us-west4"` | no |
| time\_to\_enable\_apis | Time to enable APIs, approximate estimate is 5 minutes, can be more. | `string` | `"30s"` | no |

## Outputs

| Name | Description |
|------|-------------|
| annotate\_gcs\_function\_name | The name of the cloud function that annotates an image triggered by a GCS event. |
| annotate\_http\_function\_name | The name of the cloud function that annotates an image triggered by an HTTP request. |
| neos\_walkthrough\_url | Neos Tutorial URL |
| source\_code\_url | The URL of the source code for Cloud Functions. |
| vision\_annotations\_gcs | Output GCS bucket name. |
| vision\_input\_gcs | Input GCS bucket name. |
| vision\_prediction\_url | The URL for requesting online prediction with HTTP request. |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
