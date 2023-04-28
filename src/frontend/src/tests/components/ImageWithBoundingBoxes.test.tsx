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

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageWithBoundingBoxes from "components/ImageWithBoundingBoxes";
import { FaceAnnotation } from "queries";

const imageUrl = "http://example.com/image.jpg";

describe("ImageWithBoundingBoxes", () => {
  test("renders bounding boxes for objectAnnotations", () => {
    // Prepare test data
    const objectAnnotations = [
      {
        mid: "/m/0jbk",
        name: "object",
        score: 0.9,
        languageCode: "en",
        boundingPoly: {
          vertices: [
            { x: 10, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 60 },
            { x: 10, y: 60 },
          ],
          normalizedVertices: [],
        },
      },
    ];

    const { getAllByTestId } = render(
      <ImageWithBoundingBoxes
        imageUrl={imageUrl}
        objectAnnotations={objectAnnotations}
      />
    );

    // Check if the bounding box is rendered
    const boundingBoxes = getAllByTestId("bounding-box");
    expect(boundingBoxes.length).toBe(1);
  });

  test("renders bounding boxes for faceAnnotations", () => {
    // Prepare test data
    const faceAnnotations: FaceAnnotation[] = [
      {
        boundingPoly: {
          vertices: [],
          normalizedVertices: [],
        },
        fdBoundingPoly: {
          vertices: [
            { x: 15, y: 25 },
            { x: 35, y: 25 },
            { x: 35, y: 65 },
            { x: 15, y: 65 },
          ],
          normalizedVertices: [],
        },
        landmarks: [], // Add your landmark data if needed
        rollAngle: 0,
        panAngle: 0,
        tiltAngle: 0,
        detectionConfidence: 0.9,
        landmarkingConfidence: 0.9,
        joyLikelihood: 0,
        sorrowLikelihood: 0,
        angerLikelihood: 0,
        surpriseLikelihood: 0,
        underExposedLikelihood: 0,
        blurredLikelihood: 0,
        headwearLikelihood: 0,
      },
    ];

    const { getAllByTestId } = render(
      <ImageWithBoundingBoxes
        imageUrl={imageUrl}
        faceAnnotations={faceAnnotations}
      />
    );

    // Check if the bounding box is rendered
    const boundingBoxes = getAllByTestId("bounding-box");
    expect(boundingBoxes.length).toBe(1);
  });

  test("renders the image correctly", () => {
    const { getByTestId } = render(
      <ImageWithBoundingBoxes imageUrl={imageUrl} />
    );

    const imageContainer = getByTestId("image-container");
    expect(imageContainer).toHaveStyle({
      backgroundImage: `url(${imageUrl})`,
    });
  });
});
