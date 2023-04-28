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

import React, { useState } from "react";
import clsx from "clsx";
import { ImageSource } from "components/selection/UnifiedImageSelector";

interface Props {
  onChange: (imageSource: ImageSource) => void;
}

const OPTION_TO_LABEL_MAP = {
  "File upload": ImageSource.Upload,
  "Image URL": ImageSource.URL,
  "Cloud storage": ImageSource.CloudStorage,
};

export default ({ onChange }: Props) => {
  const [selectedOptions, setSelectedFeature] = useState<ImageSource>(
    Object.values(OPTION_TO_LABEL_MAP)[0]
  );

  const handleSelection = (newSelection: ImageSource) => {
    if (newSelection !== null) {
      setSelectedFeature(newSelection);
      onChange(newSelection);
    }
  };

  return (
    <div className="btn-group">
      {Object.entries(OPTION_TO_LABEL_MAP).map(([label, value]) => (
        <button
          data-testid={`button-${value}`}
          key={value}
          onClick={() => handleSelection(value)}
          aria-label={label}
          className={clsx(
            "btn",
            selectedOptions === value
              ? "btn-primary border-primary-focus"
              : "bg-gray-200 border-gray-400 text-gray-500 hover:border-primary hover:bg-primary hover:bg-opacity-25"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
