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
import "@testing-library/jest-dom";
import ObjectDetectionResultView from "components/results/ObjectDetectionResultView";
import { vi } from "vitest";
import { LocalizedObjectAnnotation, Poly } from "queries";

describe("ObjectDetectionResultView", () => {
  const samplePoly: Poly = {
    vertices: [{ x: 0, y: 0 }],
    normalizedVertices: [{ x: 0, y: 0 }],
  };

  const annotations: LocalizedObjectAnnotation[] = [
    {
      name: "Dog",
      mid: "mid1",
      score: 0.9,
      boundingPoly: samplePoly,
      languageCode: "en",
    },
    {
      name: "Cat",
      mid: "mid2",
      score: 0.8,
      boundingPoly: samplePoly,
      languageCode: "en",
    },
    {
      name: "Bird",
      mid: "mid3",
      score: 0.7,
      boundingPoly: samplePoly,
      languageCode: "en",
    },
  ];

  it("displays no objects detected message", () => {
    const { getByText } = render(
      <ObjectDetectionResultView annotations={[]} showTopResult={false} />
    );
    expect(getByText("No objects detected.")).toBeInTheDocument();
  });

  it("displays highest confidence result as top result", () => {
    const { getByText } = render(
      <ObjectDetectionResultView
        annotations={annotations}
        showTopResult={true}
      />
    );
    expect(
      getByText("Image is classified as 'Dog' with 90% confidence.")
    ).toBeInTheDocument();
  });

  it("renders object detections in a table", () => {
    const { getAllByRole } = render(
      <ObjectDetectionResultView
        annotations={annotations}
        showTopResult={false}
      />
    );
    expect(getAllByRole("row").length == annotations.length).toBeTruthy;
  });

  it("triggers onIndexSelected when row is hovered", () => {
    const handleIndexSelected = vi.fn().mockImplementation(() => {});

    const { getAllByRole } = render(
      <ObjectDetectionResultView
        annotations={annotations}
        showTopResult={false}
        onIndexSelected={handleIndexSelected}
      />
    );
    const rows = getAllByRole("row");
    fireEvent.mouseEnter(rows[0]);
    expect(handleIndexSelected).toHaveBeenCalledWith(0);
    fireEvent.mouseLeave(rows[0]);
    expect(handleIndexSelected).toHaveBeenCalledWith(undefined);
  });
});
