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

import { useState } from "react";
import clsx from "clsx";
import ConfidenceLabelRow from "components/results/ConfidenceLabelRow";
import { FaceAnnotation } from "queries";
import Alert from "components/Alert";

export default ({
  annotations,
  onIndexSelected,
}: {
  annotations: FaceAnnotation[];
  onIndexSelected?: (index?: number) => void;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort rows by confidence
  const faces = annotations.sort(
    (a, b) => b.detectionConfidence - a.detectionConfidence
  );

  return (
    <div className="flex flex-col gap-4">
      <span className="text-md font-medium">
        Face Detection detects multiple faces within an image along with the
        associated key facial attributes such as emotional state or wearing
        headwear.
      </span>

      {annotations.length === 0 ? (
        <Alert mode="info" text="No faces detected" />
      ) : (
        <table className="w-full divide-y divide-neutral-200">
          <tbody className="bg-white divide-y divide-neutral-200">
            {faces.map(({ detectionConfidence }, index) => (
              <tr
                key={index}
                className={clsx("cursor-pointer", {
                  "bg-gray-100": hoveredIndex === index,
                })}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  if (onIndexSelected) {
                    onIndexSelected(index);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  if (onIndexSelected) {
                    onIndexSelected(undefined);
                  }
                }}
              >
                <td>
                  <ConfidenceLabelRow
                    index={index}
                    label={`Face ${index + 1}`}
                    confidence={detectionConfidence}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
