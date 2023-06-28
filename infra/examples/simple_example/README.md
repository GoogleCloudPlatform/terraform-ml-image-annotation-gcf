# Simple Example

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| project\_id | GCP project for provisioning cloud resources. | `any` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| annotate\_gcs\_function\_name | The name of the cloud function that annotates an image triggered by a GCS event. |
| source\_code\_url | Source code URL |
| vision\_annotations\_gcs | Cloud Storage of the vision annotations |
| vision\_input\_gcs | Cloud Storage of the vision input |
| vision\_prediction\_url | The URL for requesting online prediction with HTTP request. |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
