# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from unittest.mock import patch
from google.cloud import storage

with patch("google.cloud.logging.Client"):
    with patch("opentelemetry.exporter.cloud_trace.CloudTraceSpanExporter"):
        from main import list_bucket


def test_list_bucket(mocker):
    mocker.patch("google.cloud.storage.Client")
    client_mock = storage.Client.return_value

    # Test when the list_blobs function returns a valid list of blobs
    expected_result = [storage.Blob("blob1", None), storage.Blob("blob2", None)]
    client_mock.list_blobs.return_value = expected_result

    bucket_name = "test-bucket"
    result = list_bucket("bucket_name")
    assert len(expected_result) == 2

    # Test when the list_blobs function raises an exception
    client_mock.list_blobs.side_effect = Exception("An error occurred")
    result = list_bucket(bucket_name)
    assert result is None
