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

import { useState, useEffect } from "react";
import clsx from "clsx";

import {
  OBJECT_LOCALIZATION,
  LABEL_DETECTION,
  IMAGE_PROPERTIES,
  SAFE_SEARCH_DETECTION,
  FACE_DETECTION,
} from "AppConstants";

interface Props {
  onChange: (features: string[]) => void;
}

export const FEATURES = [
  {
    value: OBJECT_LOCALIZATION,
    label: "Object localization",
  },
  {
    value: LABEL_DETECTION,
    label: "Label detection",
  },
  { value: IMAGE_PROPERTIES, label: "Image properties" },
  {
    value: SAFE_SEARCH_DETECTION,
    label: "Safe-search detection",
  },
  { value: FACE_DETECTION, label: "Face detection" },
];

const FeatureSelector = ({ onChange }: Props) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    OBJECT_LOCALIZATION,
    LABEL_DETECTION,
    IMAGE_PROPERTIES,
    SAFE_SEARCH_DETECTION,
    FACE_DETECTION,
  ]);

  useEffect(() => {
    onChange(selectedFeatures);
  }, [selectedFeatures]);

  const handleFeatureSelection = (
    event: React.MouseEvent<HTMLButtonElement>,
    newSelection: string[]
  ) => {
    setSelectedFeatures(newSelection);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FEATURES.map(({ value, label }) => (
        <button
          key={value}
          value={value}
          className={clsx(
            "transition-colors duration-150",
            "border p-2",
            selectedFeatures.includes(value)
              ? `border-solid border-secondary text-secondary`
              : "border-dashed border-neutral-300 text-neutral-500 hover:border-secondary-focus hover:text-secondary-focus"
          )}
          onClick={(e) => {
            e.preventDefault();
            handleFeatureSelection(
              e,
              selectedFeatures.includes(value)
                ? selectedFeatures.filter((item) => item !== value)
                : [...selectedFeatures, value]
            );
          }}
        >
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default FeatureSelector;
