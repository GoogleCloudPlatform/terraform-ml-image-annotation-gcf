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

import { Annotation } from "queries";
import ConfidenceLabelRow from "components/results/ConfidenceLabelRow";
import clsx from "clsx";

interface AnnotationsProps {
  annotations: Annotation[];
}

const AlertInfo = () => (
  <div className="bg-blue-100 border border-blue-200 text-blue-800 p-4 rounded">
    <p className="ml-2">No labels detected.</p>
  </div>
);

export default function AnnotationsTable({ annotations }: AnnotationsProps) {
  if (annotations.length === 0) {
    return <AlertInfo />;
  }

  // Sort rows by confidence
  const rows = annotations.sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-4">
      <p className={clsx("text-md font-medium")}>
        The Vision API can detect and extract information about entities in an
        image, across a broad group of categories. Labels can identify general
        objects, locations, activities, animal species, products, and more.
      </p>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(({ description, score }, index) => (
              <tr key={index}>
                <td>
                  <ConfidenceLabelRow
                    index={index}
                    label={description}
                    confidence={score}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
