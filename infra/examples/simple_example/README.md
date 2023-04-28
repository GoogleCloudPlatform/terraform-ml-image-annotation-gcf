# Simple Example

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| project\_id | GCP project for provisioning cloud resources. | `any` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| vision\_annotations\_gcs | Cloud Storage of the vision annotations |
| vision\_entrypoint\_url | The URL for requesting online prediction with HTTP request. |
| vision\_input\_gcs | Cloud Storage of the vision input |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
