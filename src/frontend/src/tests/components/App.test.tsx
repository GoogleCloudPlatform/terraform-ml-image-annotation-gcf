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

import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import App from "App";
import { ImageSource } from "components/selection/UnifiedImageSelector";

describe("App", () => {
  test("renders title", async () => {
    const { findByText } = render(<App />);
    expect(await findByText("Annotate Image")).toBeInTheDocument();
  });

  test("renders image source options", async () => {
    const { findByTestId } = render(<App />);

    // Check if image source options are available
    expect(
      await findByTestId(`button-${ImageSource.Upload}`)
    ).toBeInTheDocument();
    expect(
      await findByTestId(`button-${ImageSource.CloudStorage}`)
    ).toBeInTheDocument();
    expect(await findByTestId(`button-${ImageSource.URL}`)).toBeInTheDocument();
  });

  test("renders feature selection", async () => {
    const { getByTestId, queryByTestId } = render(<App />);
    // Find the ImageSourceToggleSelection buttons
    const uploadButton = getByTestId(`button-${ImageSource.Upload}`);
    const urlButton = getByTestId(`button-${ImageSource.URL}`);
    const cloudStorageButton = getByTestId(
      `button-${ImageSource.CloudStorage}`
    );

    // Click on the "URL" button and check if the featureSelection appears
    userEvent.click(urlButton);
    await waitFor(() => {
      const featureSelection = getByTestId("image-feature-selection");
      expect(featureSelection).toBeInTheDocument();
    });

    // Click on the "Upload" button and check if the featureSelection does not appear
    userEvent.click(cloudStorageButton);
    await waitFor(() => {
      const featureSelection = queryByTestId("image-feature-selection");
      expect(featureSelection).not.toBeInTheDocument();
    });

    // Click on the "Upload" button and check if the featureSelection appears
    userEvent.click(uploadButton);
    await waitFor(() => {
      const featureSelection = getByTestId("image-feature-selection");
      expect(featureSelection).toBeInTheDocument();
    });
  });
});
