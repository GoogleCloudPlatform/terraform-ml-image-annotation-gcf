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
import { SafeSearchAnnotation } from "queries";

const CONFIDENCE_LEVELS_MAP: {
  [key: string]: { label: string; confidencePercent: number };
} = {
  "0": { label: "UNKNOWN", confidencePercent: 0 },
  "1": { label: "VERY UNLIKELY", confidencePercent: 0 },
  "2": { label: "UNLIKELY", confidencePercent: (1 / 4) * 100 },
  "3": { label: "POSSIBLE", confidencePercent: (2 / 4) * 100 },
  "4": { label: "LIKELY", confidencePercent: (3 / 4) * 100 },
  "5": { label: "VERY LIKELY", confidencePercent: (4 / 4) * 100 },
};

const ConfidenceBar = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div className="h-2 bg-gray-200 rounded">
    <div
      data-testid="confidence-bar"
      className={clsx("h-2 bg-accent rounded", className)}
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const LabelRow = ({
  label,
  confidence,
}: {
  label: string;
  confidence: number;
}) => {
  const confidenceLabel: string =
    CONFIDENCE_LEVELS_MAP[confidence.toString()]["label"];
  const confidencePercent: number =
    CONFIDENCE_LEVELS_MAP[confidence.toString()]["confidencePercent"];

  return (
    <tr>
      <td className="text-right h-12 border border-neutral-300 p-4">
        <div className="flex justify-between">
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-xs font-medium">{confidenceLabel}</span>
        </div>
        <ConfidenceBar value={confidencePercent} className="mt-1" />
      </td>
    </tr>
  );
};

export default ({ annotation }: { annotation: SafeSearchAnnotation }) => {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-md font-medium">
        SafeSearch Detection detects explicit content such as adult content or
        violent content within an image. This feature uses five categories
        (adult, spoof, medical, violence, and racy) and returns the likelihood
        that each is present in a given image.
      </span>
      <table className="w-full table-fixed">
        <tbody>
          <LabelRow label="Adult" confidence={annotation.adult} />
          <LabelRow label="Spoof" confidence={annotation.spoof} />
          <LabelRow label="Medical" confidence={annotation.medical} />
          <LabelRow label="Violence" confidence={annotation.violence} />
          <LabelRow label="Racy" confidence={annotation.racy} />
        </tbody>
      </table>
    </div>
  );
};
