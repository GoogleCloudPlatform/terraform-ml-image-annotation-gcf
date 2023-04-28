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

import { ImageAnnotationResult } from "queries";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ResultContainer from "components/ResultsContainer";

const mockImageUrl = "http://example.com/image.jpg";
const mockResult: ImageAnnotationResult = {
  faceAnnotations: [
    {
      boundingPoly: {
        vertices: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 },
        ],
        normalizedVertices: [],
      },
      fdBoundingPoly: {
        vertices: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 },
        ],
        normalizedVertices: [],
      },
      landmarks: [],
      rollAngle: 0,
      panAngle: 0,
      tiltAngle: 0,
      detectionConfidence: 0.8,
      landmarkingConfidence: 0.8,
      joyLikelihood: 3,
      sorrowLikelihood: 1,
      angerLikelihood: 1,
      surpriseLikelihood: 1,
      underExposedLikelihood: 1,
      blurredLikelihood: 1,
      headwearLikelihood: 1,
    },
  ],
  labelAnnotations: [
    {
      mid: "mock_mid",
      description: "mock_description",
      score: 0.9,
      locale: "en",
      confidence: 0.8,
      topicality: 0.7,
      properties: [],
    },
  ],
  safeSearchAnnotation: {
    adult: 1,
    spoof: 1,
    medical: 1,
    violence: 1,
    racy: 1,
  },
  imagePropertiesAnnotation: {
    dominantColors: {
      colors: [
        {
          color: { red: 255, green: 255, blue: 255 },
          score: 0.5,
          pixelFraction: 0.5,
        },
      ],
    },
  },
  localizedObjectAnnotations: [
    {
      name: "mock_object",
      mid: "mock_mid",
      score: 0.8,
      boundingPoly: {
        vertices: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 },
        ],
        normalizedVertices: [],
      },
      languageCode: "en",
    },
  ],
};

test("ResultContainer renders and switches tabs correctly", async () => {
  const { getAllByRole, getByTestId } = render(
    <ResultContainer imageUrl={mockImageUrl} result={mockResult} />
  );

  const tabButtons = getAllByRole("tab-button");
  expect(tabButtons).toHaveLength(5);

  // Test tab switching
  for (let tabIndex = 0; tabIndex < tabButtons.length; tabIndex++) {
    userEvent.click(tabButtons[tabIndex]);

    // Wait for the component to re-render with the updated content
    await waitFor(() => {
      const tabContent = getByTestId(`tab-content-${tabIndex}`);
      expect(tabContent).toBeInTheDocument();
    });
  }
});
