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

import clsx from "clsx";
import { LocalizedObjectAnnotation } from "queries";
import ConfidenceLabelRow from "components/results/ConfidenceLabelRow";
import Alert from "components/Alert";

interface Props {
  annotations: LocalizedObjectAnnotation[];
  showTopResult: boolean;
  onIndexSelected?: (index?: number) => void;
}

const ResultsTable = ({
  annotations,
  showTopResult,
  onIndexSelected,
}: Props) => {
  // Display message if no objects detected

  // Sort object detections by confidence
  const objectDetections = annotations.sort((a, b) =>
    a.score < b.score ? 1 : -1
  );

  const renderObjectDetections = () => {
    // Get highest confidence label and percentage
    const highestConfidence = objectDetections[0];
    const label = highestConfidence.name;
    const confidencePercentage = (highestConfidence.score * 100).toFixed(0);

    return (
      <div className="flex flex-col gap-4">
        {showTopResult && (
          <Alert
            mode="success"
            text={`Image is classified as '${label}' with ${confidencePercentage}% confidence.`}
          />
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {objectDetections.map(({ name, score }, index) => (
              <tr
                key={index}
                onMouseEnter={() => {
                  if (onIndexSelected) {
                    onIndexSelected(index);
                  }
                }}
                onMouseLeave={() => {
                  if (onIndexSelected) {
                    onIndexSelected(undefined);
                  }
                }}
              >
                <td>
                  <ConfidenceLabelRow
                    index={index}
                    label={name}
                    confidence={score}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-md font-medium">
        The Vision API can detect and extract multiple objects in an image with
        Object Localization. Each result identifies information about the
        object, the position of the object, and rectangular bounds for the
        region of the image that contains the object.
      </span>
      {annotations.length === 0 ? (
        <div
          className={clsx(
            "bg-blue-200 text-blue-800 p-4 rounded", // Alert styling
            "flex items-center", // Flexbox alignment
            "text-sm" // Text size
          )}
        >
          No objects detected.
        </div>
      ) : (
        renderObjectDetections()
      )}
    </div>
  );
};

export default ResultsTable;
