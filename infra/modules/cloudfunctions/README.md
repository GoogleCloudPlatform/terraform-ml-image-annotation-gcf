# cloudfunctions module

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| annotations-bucket | Annotations bucket name | `string` | n/a | yes |
| gcf\_annotation\_features | Requested annotation features. | `string` | n/a | yes |
| gcf\_http\_ingress\_type\_index | Ingres type index. | `number` | n/a | yes |
| gcf\_http\_ingress\_types\_list | Ingres type values | `list(any)` | <pre>[<br>  "ALLOW_ALL",<br>  "ALLOW_INTERNAL_ONLY",<br>  "ALLOW_INTERNAL_AND_GCLB"<br>]</pre> | no |
| gcf\_location | GCF deployment region | `string` | n/a | yes |
| gcf\_log\_level | Set logging level for cloud functions. | `string` | n/a | yes |
| gcf\_max\_instance\_count | MAX number of GCF instances | `number` | n/a | yes |
| gcf\_require\_http\_authentication | Create HTTP API with public, unauthorized access. | `bool` | n/a | yes |
| gcf\_timeout\_seconds | GCF execution timeout | `number` | n/a | yes |
| gcr\_invoker\_members | IAM members. | `list(string)` | <pre>[<br>  "allUsers"<br>]</pre> | no |
| gcr\_role\_invoker | IAM role GCR invoker. | `string` | `"roles/run.invoker"` | no |
| input-bucket | Input bucket name | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| function\_uri | Cloud Function URI and ingress parameters. |
| gcf\_sa | Cloud Functions SA. |
| gcs\_account | Cloud StorageS SA. |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
