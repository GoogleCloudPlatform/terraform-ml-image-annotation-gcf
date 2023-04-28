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

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import SafeSearchResultView from "components/results/SafeSearchResultView";

const mockAnnotation = {
  adult: 2,
  spoof: 1,
  medical: 4,
  violence: 3,
  racy: 5,
};

describe("SafeSearchResultView", () => {
  it("renders all label rows with correct annotation data", () => {
    const { getByText } = render(
      <SafeSearchResultView annotation={mockAnnotation} />
    );

    expect(getByText("UNLIKELY")).toBeInTheDocument();
    expect(getByText("VERY UNLIKELY")).toBeInTheDocument();
    expect(getByText("LIKELY")).toBeInTheDocument();
    expect(getByText("POSSIBLE")).toBeInTheDocument();
    expect(getByText("VERY LIKELY")).toBeInTheDocument();
  });
});
