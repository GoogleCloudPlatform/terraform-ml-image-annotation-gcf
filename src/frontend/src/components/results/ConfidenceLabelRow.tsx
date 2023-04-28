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

export default ({
  index,
  label,
  confidence,
}: {
  index: number;
  label: string;
  confidence: number;
}) => {
  const confidencePercent = confidence * 100;

  return (
    <div className="text-right h-12 border border-neutral-300 p-4">
      <div className={"flex justify-between items-start"}>
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-xs font-medium">
          {index === 0 ? "Confidence = " : null}
          {confidence.toFixed(2)}
        </span>
      </div>
      <div className={"h-2 bg-gray-200 rounded overflow-hidden mt-1"}>
        <div
          data-testid="confidence-bar"
          className={"bg-green-600 h-full"}
          style={{ width: `${confidencePercent}%` }}
        ></div>
      </div>
    </div>
  );
};
