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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BoundingBox } from "components/ImageWithBoundingBoxes";

describe("BoundingBox", () => {
  test("renders a bounding box with the correct styles", () => {
    // Prepare test data
    const box = {
      vertices: [
        { x: 10, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 60 },
        { x: 10, y: 60 },
      ],
      normalizedVertices: [],
    };

    const props = {
      index: 0,
      box,
      imageWidth: 100,
      imageHeight: 100,
      selectedIndex: 0,
    };

    render(<BoundingBox {...props} />);

    const boundingBox = screen.getByTestId("bounding-box");
    expect(boundingBox).toHaveStyle({
      top: "20%",
      left: "10%",
      width: "20%",
      height: "40%",
    });
  });
});
