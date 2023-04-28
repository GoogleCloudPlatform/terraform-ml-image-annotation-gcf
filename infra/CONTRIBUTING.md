# Contributing

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement (CLA). You (or your employer) retain the copyright to your
contribution; this simply gives us permission to use and redistribute your
contributions as part of the project. Head over to
<https://cla.developers.google.com/> to see your current agreements on file or
to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code Reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Development

The following dependencies must be installed on the development system:

- [Docker Engine][docker-engine]
- [Google Cloud SDK][google-cloud-sdk]
- [make]

### Generating Documentation for Inputs and Outputs

The Inputs and Outputs tables in the READMEs of the root module,
submodules, and example modules are automatically generated based on
the `variables` and `outputs` of the respective modules. These tables
must be refreshed if the module interfaces are changed.

#### Execution

Run `make generate_docs` to generate new Inputs and Outputs tables.

### Integration Testing

Integration tests are used to verify the behavior of each stage in this repo.
Additions, changes, and fixes should be accompanied with tests.

The integration tests are run using the [Blueprint test][blueprint-test] framework. The framework is packaged within a Docker image for convenience.

The general strategy for these tests is to verify the behaviour of the
[example modules](./examples/), thus ensuring that the root module,
submodules, and example modules are all functionally correct.

#### Test Environment
The easiest way to test the module is in an isolated test project. The setup for such a project is defined in [test/setup](./test/setup/) directory.

To use this setup, you need a service account with these permissions (on a Folder or Organization):
- Project Creator
- Project Billing Manager

The project that the service account belongs to must have the following APIs enabled (the setup won't
create any resources on the service account's project):
- Cloud Resource Manager
- Cloud Billing
- Service Usage
- Identity and Access Management (IAM)

Export the Service Account credentials to your environment like so:

```
export SERVICE_ACCOUNT_JSON=$(< credentials.json)
```

You will also need to set a few environment variables:
```
export TF_VAR_org_id="your_org_id"
export TF_VAR_folder_id="your_folder_id"
export TF_VAR_billing_account="your_billing_account_id"
```

With these settings in place, you can prepare a test project using Docker:
```
make docker_test_prepare
```

#### Interactive Execution

1. Run `make docker_run` to start the testing Docker container in
   interactive mode.

1. Run `cd test/integration` to go to the integration test directory.

1. Run `cft test list --test-dir /workspace/test/integration` to list the available test.

1. Run `cft test run <TEST_NAME> --stage init --verbose` to initialize the working
   directory for the stage.

1. Run `cft test run <TEST_NAME> --stage apply --verbose` to apply the stage.

1. Run `cft test run <TEST_NAME> --stage verify --verbose ` to test the resources created in the current stage.

After iterating on `verify` stage, you can teardown resources.

1. Run `cft test run <TEST_NAME> --stage destroy --verbose ` to destroy the stage.

### Linting and Formatting

Many of the files in the repository can be linted or formatted to
maintain a standard of quality.

#### Execution

Run `make docker_test_lint`.

[docker-engine]: https://www.docker.com/products/docker-engine
[flake8]: https://flake8.pycqa.org/en/latest/
[fmt]: https://www.terraform.io/cli/commands/fmt
[gofmt]: https://golang.org/cmd/gofmt/
[google-cloud-sdk]: https://cloud.google.com/sdk/install
[hadolint]: https://github.com/hadolint/hadolint
[make]: https://en.wikipedia.org/wiki/Make_(software)
[shellcheck]: https://www.shellcheck.net/
[terraform-docs]: https://github.com/segmentio/terraform-docs
[terraform]: https://terraform.io/
[blueprint-test]: https://github.com/GoogleCloudPlatform/cloud-foundation-toolkit/tree/master/infra/blueprint-test
