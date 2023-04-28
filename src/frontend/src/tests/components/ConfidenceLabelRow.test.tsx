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

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfidenceLabelRow from "components/results/ConfidenceLabelRow";

describe("ConfidenceComponent", () => {
  test("renders label, confidence, and progress bar", () => {
    const props = {
      index: 0,
      label: "Example",
      confidence: 0.85,
    };

    const { getByText, getByTestId } = render(
      <ConfidenceLabelRow {...props} />
    );

    const labelElement = getByText(props.label);
    const confidenceElement = getByText(
      `Confidence = ${props.confidence.toFixed(2)}`
    );
    const progressBarElement = getByTestId("confidence-bar");

    expect(labelElement).toBeInTheDocument();
    expect(confidenceElement).toBeInTheDocument();
    expect(progressBarElement).toBeInTheDocument();
    expect(progressBarElement).toHaveStyle(`width: ${props.confidence * 100}%`);
  });

  test('does not render "Confidence = " for non-zero index', () => {
    const props = {
      index: 1,
      label: "Example",
      confidence: 0.85,
    };

    const { getByText } = render(<ConfidenceLabelRow {...props} />);

    const confidenceElement = getByText(props.confidence.toFixed(2));
    expect(confidenceElement).toBeInTheDocument();
    expect(confidenceElement).not.toHaveTextContent("Confidence = ");
  });
});
