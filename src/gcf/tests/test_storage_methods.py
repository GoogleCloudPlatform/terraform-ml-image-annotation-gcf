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

with patch("google.cloud.logging.Client"):
    with patch("opentelemetry.exporter.cloud_trace.CloudTraceSpanExporter"):
        from main import image_filename_for_json, json_filename_for_image


def test_json_filename_for_image():
    # Given
    file_name = "image.png"

    # When
    result = json_filename_for_image(file_name)

    # Then
    assert result == "image.png.json"


def test_image_filename_for_json():
    # Given
    file_name = "annotation.json"

    # When
    result = image_filename_for_json(file_name)

    # Then
    assert result == "annotation"
