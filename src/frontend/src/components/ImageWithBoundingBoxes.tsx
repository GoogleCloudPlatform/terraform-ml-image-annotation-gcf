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

import React, { useEffect, useState } from "react";
import { FaceAnnotation, LocalizedObjectAnnotation, Poly } from "queries";
import clsx from "clsx";

export const BoundingBox = ({
  index,
  box,
  selectedIndex,
  imageWidth,
  imageHeight,
}: {
  index: number;
  box: Poly;
  imageWidth: number;
  imageHeight: number;
  selectedIndex?: number;
}) => {
  let percentX: number;
  let percentY: number;
  let percentWidth: number;
  let percentHeight: number;

  if (box.vertices.length == 4) {
    percentX = box.vertices[0].x / imageWidth;
    percentY = box.vertices[0].y / imageHeight;
    percentWidth = (box.vertices[2].x - box.vertices[0].x) / imageWidth;
    percentHeight = (box.vertices[2].y - box.vertices[0].y) / imageHeight;
  } else if (box.normalizedVertices.length == 4) {
    percentX = box.normalizedVertices[0].x;
    percentY = box.normalizedVertices[0].y;
    percentWidth = box.normalizedVertices[2].x - box.normalizedVertices[0].x;
    percentHeight = box.normalizedVertices[2].y - box.normalizedVertices[0].y;
  } else {
    return null;
  }

  return (
    <div
      data-testid="bounding-box"
      className={clsx(
        "absolute border-solid border-green-500",
        index === selectedIndex ? "border-4" : "border-2"
      )}
      style={{
        top: `${percentY * 100}%`,
        left: `${percentX * 100}%`,
        width: `${percentWidth * 100}%`,
        height: `${percentHeight * 100}%`,
      }}
    />
  );
};

const ImageWithBoundingBoxes = ({
  imageUrl,
  objectAnnotations,
  faceAnnotations,
  selectedIndex,
}: {
  imageUrl: string;
  objectAnnotations?: LocalizedObjectAnnotation[];
  faceAnnotations?: FaceAnnotation[];
  selectedIndex?: number;
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageSize({ width: image.width, height: image.height });
    };
    image.src = imageUrl;
  }, [imageUrl]);

  let boundingBoxElements: React.ReactNode[] = [];

  if (objectAnnotations != null) {
    boundingBoxElements = objectAnnotations.map((annotation, index) => {
      const box = annotation.boundingPoly;

      return (
        <BoundingBox
          key={index}
          index={index}
          box={box}
          selectedIndex={selectedIndex}
          imageWidth={imageSize.width}
          imageHeight={imageSize.height}
        />
      );
    });
  } else if (faceAnnotations != null) {
    boundingBoxElements = faceAnnotations.map((annotation, index) => {
      const box = annotation.fdBoundingPoly;

      return (
        <BoundingBox
          key={index}
          index={index}
          box={box}
          selectedIndex={selectedIndex}
          imageWidth={imageSize.width}
          imageHeight={imageSize.height}
        />
      );
    });
  }
  const aspectRatio = imageSize.width / imageSize.height || 0;
  const boxClasses = clsx(
    "w-full",
    "relative",
    "bg-no-repeat",
    "bg-contain",
    "bg-center",
    "object-cover"
    // Add custom classes or other conditional classes here
  );

  return (
    <div
      data-testid="image-container"
      className={boxClasses}
      style={{
        paddingTop: "0%",
        backgroundImage: `url(${imageUrl})`,
        aspectRatio: aspectRatio,
      }}
    >
      {boundingBoxElements}
    </div>
  );
};

export default ImageWithBoundingBoxes;
