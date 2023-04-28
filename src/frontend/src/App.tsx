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

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";
import {
  annotateImageByCloudImageInfo,
  annotateImageByFile,
  annotateImageByUri,
  CloudImageInfo,
  getImageDataURL,
  ImageAnnotationResult,
} from "queries";
import ResultContainer from "components/ResultsContainer";
import {
  ImageSource,
  UnifiedImageSelector,
} from "components/selection/UnifiedImageSelector";
import FeatureToggleSelection from "components/selection/FeatureToggleSelection";
import ImageSourceToggleSelection from "components/selection/ImageSourceToggleSelection";
import clsx from "clsx";
import Alert from "components/Alert";

const ErrorAlert = ({ error }: { error: Error }) => (
  <Alert mode="error" text={error.message} />
);

const LoadingAlert = () => <Alert mode="loading" text="Getting annotations" />;

const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // The URL to the image to be displayed
  const [selectedFileUrl, setSelectedFileURL] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [imageSource, setImageSource] = useState<ImageSource>(
    ImageSource.Upload
  );

  const annotateImageByFileMutation = useMutation<
    ImageAnnotationResult,
    Error,
    File
  >((file: File) => {
    return annotateImageByFile(file, selectedFeatures);
  });

  const annotateImageByUriMutation = useMutation<
    ImageAnnotationResult,
    Error,
    string
  >((imageUri: string) => {
    return annotateImageByUri(imageUri, selectedFeatures);
  });

  const annotateImageByCloudImageMutation = useMutation<
    ImageAnnotationResult,
    Error,
    CloudImageInfo
  >((info: CloudImageInfo) => {
    return annotateImageByCloudImageInfo(info);
  });

  const handleFileChange = (file: File | null) => {
    console.log("handleFileChange");
    if (file != null) {
      setSelectedFile(file);

      // Reset upload results
      annotateImageByFileMutation.reset();
      annotateImageByUriMutation.reset();
      annotateImageByCloudImageMutation.reset();

      // Get the file url and save it to state
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result != null) {
          setSelectedFileURL(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      annotateImageByFileMutation.mutate(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAnnotateByUri = (uri: string) => {
    console.log("handleAnnotateByUri");

    if (uri.length > 0) {
      annotateImageByFileMutation.reset();
      annotateImageByUriMutation.reset();
      annotateImageByCloudImageMutation.reset();

      setSelectedFileURL(uri);
      annotateImageByUriMutation.mutate(uri);
    }
  };

  const handleCloudImageInfoSelected = (info: CloudImageInfo | null) => {
    console.log("handleCloudImageInfoSelected");
    if (info != null) {
      // Reset upload results
      annotateImageByFileMutation.reset();
      annotateImageByUriMutation.reset();
      annotateImageByCloudImageMutation.reset();

      // Get the image url
      setSelectedFileURL(getImageDataURL(info));

      annotateImageByCloudImageMutation.mutate(info);
    } else {
      setSelectedFile(null);
    }
  };

  // Redo annotation when features list changes
  useEffect(() => {
    console.log("selectedFeatures changed");
    switch (imageSource) {
      case ImageSource.Upload:
        handleFileChange(selectedFile);
        break;
      case ImageSource.URL:
        handleAnnotateByUri(selectedFileUrl);
        break;
      case ImageSource.CloudStorage:
        break;
    }
  }, [selectedFeatures]);

  // Clear results and file URL
  useEffect(() => {
    console.log("imageSource changed");
    setSelectedFileURL("");

    // Reset upload results
    annotateImageByFileMutation.reset();
    annotateImageByUriMutation.reset();
    annotateImageByCloudImageMutation.reset();
  }, [imageSource]);

  const handleImageSourceChange = (imageSource: ImageSource) => {
    setImageSource(imageSource);
  };

  let isLoading: boolean =
    annotateImageByFileMutation.isLoading ||
    annotateImageByUriMutation.isLoading ||
    annotateImageByCloudImageMutation.isLoading;
  let error: Error | null =
    annotateImageByFileMutation.error ||
    annotateImageByUriMutation.error ||
    annotateImageByCloudImageMutation.error;
  let annotationResult: ImageAnnotationResult | undefined =
    annotateImageByFileMutation.data ||
    annotateImageByUriMutation.data ||
    annotateImageByCloudImageMutation.data;

  const renderImageSourceSelection = () => {
    return (
      <div className={clsx("border-l-4 pl-4 border-blueGray-200", "space-y-2")}>
        <h6 className="text-lg">Image source</h6>
        <p className="text-base">Choose the image you want to annotate</p>
        <div className="grid grid-col-1 md:grid-cols-2 gap-4">
          <ImageSourceToggleSelection onChange={handleImageSourceChange} />
          <UnifiedImageSelector
            isLoading={isLoading}
            imageSource={imageSource}
            handleFileChange={handleFileChange}
            handleAnnotateByUri={handleAnnotateByUri}
            handleAnnotateByImageInfo={handleCloudImageInfoSelected}
          />
        </div>
      </div>
    );
  };

  const renderImageFeatureSelection = () => {
    return (
      <div
        data-testid="image-feature-selection"
        className={clsx("border-l-4 pl-4 border-blueGray-200", "space-y-2")}
      >
        <h6 className="text-lg">Features</h6>
        <p className="text-base">
          Choose the image features you want to detect
        </p>
        <FeatureToggleSelection
          onChange={(features) => {
            setSelectedFeatures(features);
          }}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 bg-gray-50 py-4">
      <span className="text-2xl mb-2">Annotate Image</span>
      <div className="space-y-8">
        {renderImageSourceSelection()}
        {imageSource != ImageSource.CloudStorage
          ? renderImageFeatureSelection()
          : null}
        {error || isLoading || annotationResult ? (
          <>
            <div
              className={clsx(
                "border-l-4 pl-4 border-blueGray-200",
                "space-y-2"
              )}
            >
              <span className="text-2xl">Results</span>
              {error && <ErrorAlert error={error} />}
              {isLoading && <LoadingAlert />}
              {annotationResult != null && selectedFileUrl != null ? (
                <ResultContainer
                  imageUrl={selectedFileUrl}
                  result={annotationResult}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

export default () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};
