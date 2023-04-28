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

import { render, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Color, ImagePropertiesAnnotation } from "queries";
import ImagePropertiesTable, {
  ColorRow,
} from "components/results/ImagePropertiesResultView";

describe("ColorRow", () => {
  test("renders correctly", () => {
    const testColor: Color = {
      red: 255,
      green: 0,
      blue: 0,
    };
    const pixelFraction = 0.2;
    const index = 0;

    const { getByText } = render(
      <ColorRow index={index} color={testColor} pixelFraction={pixelFraction} />
    );

    expect(getByText("RGB = (255, 0, 0)")).toBeInTheDocument();
    expect(getByText("Pixel fraction = 20%")).toBeInTheDocument();
  });
});

describe("ImagePropertiesTable", () => {
  test("renders table with correct colors", () => {
    const testAnnotation: ImagePropertiesAnnotation = {
      dominantColors: {
        colors: [
          {
            color: { red: 255, green: 0, blue: 0 },
            score: 0.9,
            pixelFraction: 0.6,
          },
          {
            color: { red: 0, green: 255, blue: 0 },
            score: 0.5,
            pixelFraction: 0.3,
          },
        ],
      },
    };

    const { getAllByRole } = render(
      <ImagePropertiesTable annotation={testAnnotation} />
    );
    const rows = getAllByRole("row");
    expect(rows.length).toEqual(2);

    const firstRow = within(rows[0]);
    expect(firstRow.getByText("RGB = (255, 0, 0)")).toBeInTheDocument();
    expect(firstRow.getByText("Pixel fraction = 60%")).toBeInTheDocument();

    const secondRow = within(rows[1]);
    expect(secondRow.getByText("RGB = (0, 255, 0)")).toBeInTheDocument();
    expect(secondRow.getByText("30%")).toBeInTheDocument();
  });
});
