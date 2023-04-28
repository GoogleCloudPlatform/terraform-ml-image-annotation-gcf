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

import { ImagePropertiesAnnotation, Color } from "queries";

interface ColorRowProps {
  index: number;
  color: Color;
  pixelFraction: number;
}

export const ColorRow: React.FC<ColorRowProps> = ({
  index,
  color,
  pixelFraction,
}) => {
  const colorString = `${color.red},${color.green},${color.blue}`;
  const brightness =
    (color.red * 299 + color.green * 587 + color.blue * 114) / 1000;
  const maxBrightness = 200; // set max brightness for border color
  const borderColorString =
    brightness > maxBrightness ? "#BBBBBB" : `rgba(${colorString}, 0.8)`;

  return (
    <div className="text-right h-12 border p-4 border-neutral-300">
      <div className="flex justify-between">
        <span className="text-xs font-semibold">
          {`RGB = (${color.red}, ${color.green}, ${color.blue})`}
        </span>
        <span className="text-xs font-medium">
          {index === 0 ? "Pixel fraction = " : null}
          {(pixelFraction * 100).toFixed(0)}%
        </span>
      </div>
      <div
        className={"w-full h-5 bg-opacity-40 bg-neutral-300"}
        style={{ border: `1px solid ${borderColorString}` }} // Add a border
      >
        <div
          className={"h-full"}
          style={{
            backgroundColor: `rgb(${colorString})`,
            width: `${pixelFraction * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

interface ImagePropertiesTableProps {
  annotation: ImagePropertiesAnnotation;
}

const ImagePropertiesTable: React.FC<ImagePropertiesTableProps> = ({
  annotation,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-md font-medium">
        The Image Properties feature detects general attributes of the image,
        such as dominant color.
      </span>
      <table className="w-full">
        <tbody>
          {annotation.dominantColors.colors
            .sort((a, b) => b.pixelFraction - a.pixelFraction)
            .map(({ color, score, pixelFraction }, index) => (
              <tr key={index}>
                <td>
                  <ColorRow
                    index={index}
                    color={color}
                    pixelFraction={pixelFraction}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImagePropertiesTable;
