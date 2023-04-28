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
import { useEffect, useState } from "react";
import CloudImageInfoSelector from "components/selection/CloudImageSelector";
import { CloudImageInfo as CloudImageInfo } from "queries";

export enum ImageSource {
  Upload,
  URL,
  CloudStorage,
}

type ImageSelectorProps = {
  isLoading: boolean;
  imageSource: ImageSource;
  handleFileChange: (file: File | null) => void;
  handleAnnotateByUri: (uri: string) => void;
  handleAnnotateByImageInfo: (info: CloudImageInfo) => void;
};

const AnnotateByUri = ({
  imageUri,
  isButtonDisabled,
  onImageUriChanged,
  onConfirmClicked,
}: {
  imageUri: string;
  isButtonDisabled: boolean;
  onImageUriChanged: (text: string) => void;
  onConfirmClicked?: () => void;
}) => {
  return (
    <div className="flex items-end space-x-4">
      <div className="flex-1 flex-col items-baseline space-y-2">
        <label className="font-extralight">Paste an image URL</label>
        <input
          data-testid="image-uri-input"
          value={imageUri}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onImageUriChanged(event.target.value);
          }}
          className="w-full mb-2 input input-bordered"
          onKeyUp={(event) => {
            if (event.key === "Enter" && onConfirmClicked != null) {
              onConfirmClicked();
            }
          }}
        />
      </div>
      <button
        onClick={() => {
          if (onConfirmClicked != null) {
            onConfirmClicked();
          }
        }}
        className={clsx(
          "btn",
          "btn-primary",
          isButtonDisabled && "btn-disabled cursor-not-allowed"
        )}
        disabled={isButtonDisabled}
      >
        Annotate
      </button>
    </div>
  );
};

export const UnifiedImageSelector = ({
  isLoading,
  imageSource,
  handleFileChange,
  handleAnnotateByUri,
  handleAnnotateByImageInfo,
}: ImageSelectorProps) => {
  const [imageUri, setImageUri] = useState("");

  const renderUpload = () => (
    <div data-testid="upload" className="flex flex-col items-start">
      <div className="flex-1 flex-col items-baseline space-y-2">
        <label className="font-extralight">Choose a file</label>
        <input
          data-testid="image-file-input"
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files && files.length > 0) {
              handleFileChange(files[0]);
            }
          }}
          className="w-full file-input input-bordered max-w-md"
        />
      </div>
    </div>
  );

  const renderURL = () => (
    <div data-testid="uri">
      <AnnotateByUri
        imageUri={imageUri}
        onImageUriChanged={(text) => setImageUri(text)}
        isButtonDisabled={imageUri.length == 0 || isLoading}
        onConfirmClicked={() => handleAnnotateByUri(imageUri)}
      />
    </div>
  );

  const renderCloudStorage = () => (
    <div data-testid="cloud-storage">
      <CloudImageInfoSelector onImageInfoSelected={handleAnnotateByImageInfo} />
    </div>
  );

  // Fetch info on init
  useEffect(() => {
    console.log(`UnifiedImageSelector init: imageSource = ${imageSource}`);
  }, []);

  useEffect(() => {
    console.log(`UnifiedImageSelector:imageSource changed to ${imageSource}`);
  }, [imageSource]);

  switch (imageSource) {
    case ImageSource.Upload:
      return renderUpload();
    case ImageSource.URL:
      return renderURL();
    case ImageSource.CloudStorage:
      return renderCloudStorage();
    default:
      return null;
  }
};
