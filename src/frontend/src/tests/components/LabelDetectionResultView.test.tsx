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

import { test } from "vitest";
import { render, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Annotation } from "queries";
import AnnotationsTable from "components/results/LabelDetectionResultView";

const sampleAnnotations: Annotation[] = [
  {
    mid: "1",
    description: "dog",
    score: 0.9,
    locale: "en",
    confidence: 0.9,
    topicality: 0.9,
    properties: [],
  },
  {
    mid: "2",
    description: "cat",
    score: 0.8,
    locale: "en",
    confidence: 0.8,
    topicality: 0.8,
    properties: [],
  },
];

test("renders info when no annotations are present", async () => {
  const { getByText } = render(<AnnotationsTable annotations={[]} />);
  expect(getByText("No labels detected.")).toBeInTheDocument();
});

test("renders a sorted table with given annotations", async () => {
  const { container, getByText } = render(
    <AnnotationsTable annotations={sampleAnnotations} />
  );
  const table = container.querySelector("table");
  expect(table).toBeInTheDocument();
  expect(within(table!).getByText("dog")).toBeInTheDocument();
  expect(within(table!).getByText("cat")).toBeInTheDocument();
  expect(within(table!).getByText("Confidence = 0.90")).toBeInTheDocument();
  expect(within(table!).getByText("0.80")).toBeInTheDocument();
});
