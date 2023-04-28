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

from typing import Dict, List
from unittest.mock import patch
from google.cloud import vision

with patch("google.cloud.logging.Client"):
    with patch("opentelemetry.exporter.cloud_trace.CloudTraceSpanExporter"):
        from main import (
            build_features_list,
            get_all_vision_features,
            get_feature_by_name,
            read_vision_image_from_gcs,
        )


def test_read_vision_image_from_gcs(mocker):
    # Given
    mocker.patch("google.cloud.storage.Client")
    mocker.patch("google.cloud.vision.Image")

    bucket_name = "test-bucket"
    file_name = "test-image.jpg"

    # When
    image = read_vision_image_from_gcs(bucket_name, file_name)

    # Then
    assert image is not None


def test_get_all_vision_features():
    # When
    features = get_all_vision_features()

    # Then
    assert isinstance(features, List)
    assert all(isinstance(feature, Dict) for feature in features)
    assert all(
        isinstance(feature["type_"], vision.Feature.Type) for feature in features
    )


def test_get_feature_by_name():
    # Given
    feature_name = "LABEL_DETECTION"

    # When
    feature = get_feature_by_name(feature_name)

    # Then
    assert isinstance(feature, vision.Feature.Type)

    # Given
    non_existent_feature_name = "NON_EXISTENT"

    # When
    non_existent_feature = get_feature_by_name(non_existent_feature_name)

    # Then
    assert non_existent_feature is None


def test_build_features_list():
    # Given
    feature_names = "LABEL_DETECTION, FACE_DETECTION"

    # When
    features_list = build_features_list(feature_names)

    # Then
    assert features_list == [
        {"type_": vision.Feature.Type.LABEL_DETECTION},
        {"type_": vision.Feature.Type.FACE_DETECTION},
    ]
