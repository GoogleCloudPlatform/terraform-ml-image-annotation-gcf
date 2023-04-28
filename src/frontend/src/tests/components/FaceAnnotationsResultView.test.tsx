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

import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FaceAnnotation } from "queries";
import FaceAnnotationsResultView from "components/results/FaceAnnotationsResultView";
import { vi } from "vitest";

describe("FaceAnnotationsResultView", () => {
  const mockFaceAnnotations: FaceAnnotation[] = [
    {
      boundingPoly: {
        vertices: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
        ],
        normalizedVertices: [],
      },
      fdBoundingPoly: {
        vertices: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
        ],
        normalizedVertices: [],
      },
      landmarks: [],
      rollAngle: 0,
      panAngle: 0,
      tiltAngle: 0,
      detectionConfidence: 0.95,
      landmarkingConfidence: 0.5,
      joyLikelihood: 0.5,
      sorrowLikelihood: 0.5,
      angerLikelihood: 0.5,
      surpriseLikelihood: 0.5,
      underExposedLikelihood: 0.5,
      blurredLikelihood: 0.5,
      headwearLikelihood: 0.5,
    },
    {
      boundingPoly: {
        vertices: [
          { x: 3, y: 3 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
          { x: 3, y: 4 },
        ],
        normalizedVertices: [],
      },
      fdBoundingPoly: {
        vertices: [
          { x: 3, y: 3 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
          { x: 3, y: 4 },
        ],
        normalizedVertices: [],
      },
      landmarks: [],
      rollAngle: 0,
      panAngle: 0,
      tiltAngle: 0,
      detectionConfidence: 0.85,
      landmarkingConfidence: 0.5,
      joyLikelihood: 0.5,
      sorrowLikelihood: 0.5,
      angerLikelihood: 0.5,
      surpriseLikelihood: 0.5,
      underExposedLikelihood: 0.5,
      blurredLikelihood: 0.5,
      headwearLikelihood: 0.5,
    },
  ];

  const mockOnIndexSelected = vi.fn().mockImplementation(() => {});

  test("renders 'No faces detected' when no annotations are provided", () => {
    const { getByText } = render(
      <FaceAnnotationsResultView annotations={[]} />
    );
    expect(getByText("No faces detected")).toBeInTheDocument();
  });

  test("renders a table with face annotations", () => {
    const { getByRole } = render(
      <FaceAnnotationsResultView annotations={mockFaceAnnotations} />
    );
    const table = getByRole("table");
    expect(table).toBeInTheDocument();
  });

  test("renders correct number of face rows", () => {
    const { getAllByRole } = render(
      <FaceAnnotationsResultView annotations={mockFaceAnnotations} />
    );

    // Get all rows
    const faceRows = getAllByRole("row");

    expect(faceRows.length).toEqual(mockFaceAnnotations.length);
  });

  test("calls onIndexSelected with index on mouse enter and with undefined on mouse leave", () => {
    const { getAllByRole } = render(
      <FaceAnnotationsResultView
        annotations={mockFaceAnnotations}
        onIndexSelected={mockOnIndexSelected}
      />
    );

    // Get all rows
    const faceRows = getAllByRole("row");
    fireEvent.mouseEnter(faceRows[0]);
    expect(mockOnIndexSelected).toHaveBeenCalledWith(0);
    fireEvent.mouseLeave(faceRows[0]);
    expect(mockOnIndexSelected).toHaveBeenCalledWith(undefined);
  });
});
