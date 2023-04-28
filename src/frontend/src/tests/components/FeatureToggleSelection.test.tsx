/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fireEvent, render } from "@testing-library/react";
import FeatureSelector, {
  FEATURES,
} from "components/selection/FeatureToggleSelection";
import "@testing-library/jest-dom";

import {
  OBJECT_LOCALIZATION,
  LABEL_DETECTION,
  IMAGE_PROPERTIES,
  SAFE_SEARCH_DETECTION,
  FACE_DETECTION,
} from "AppConstants";

import { vi } from "vitest";

test("should render all features", () => {
  const { getByText } = render(<FeatureSelector onChange={() => {}} />);

  FEATURES.forEach(({ label }) => {
    expect(getByText(label)).toBeInTheDocument();
  });
});

test("should call onChange with the correct features on button click", () => {
  const onChangeMock = vi.fn().mockImplementation(() => {});

  const { getByText } = render(<FeatureSelector onChange={onChangeMock} />);

  // All selected
  expect(onChangeMock).toHaveBeenCalledWith([
    OBJECT_LOCALIZATION,
    LABEL_DETECTION,
    IMAGE_PROPERTIES,
    SAFE_SEARCH_DETECTION,
    FACE_DETECTION,
  ]);

  // Deselect LABEL_DETECTION
  const labelDetectionFeature = FEATURES.find(
    (feature) => feature.value === LABEL_DETECTION
  );
  fireEvent.click(getByText(labelDetectionFeature!.label));
  expect(onChangeMock).toHaveBeenCalledWith([
    OBJECT_LOCALIZATION,
    IMAGE_PROPERTIES,
    SAFE_SEARCH_DETECTION,
    FACE_DETECTION,
  ]);
});
