# storage module

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| gcf\_location | GCS deployment region. | `string` | n/a | yes |
| labels | A map of key/value label pairs to assign to the resources. | `map(string)` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| gcs\_annotations | Output GCS bucket name. |
| gcs\_input | Input GCS bucket name. |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
