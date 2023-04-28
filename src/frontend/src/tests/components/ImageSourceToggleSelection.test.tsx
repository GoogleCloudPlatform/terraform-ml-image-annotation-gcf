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

import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { ImageSource } from "components/selection/UnifiedImageSelector";
import { vi } from "vitest";
import ImageSourceToggleSelection from "components/selection/ImageSourceToggleSelection";

describe("ImageSelector", () => {
  test("renders and selects correct options", () => {
    const onChange = vi.fn().mockImplementation(() => {});
    const { getAllByRole } = render(
      <ImageSourceToggleSelection onChange={onChange} />
    );
    const buttons = getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onChange).toHaveBeenLastCalledWith(ImageSource.Upload);
    expect(buttons[0]).toHaveClass("btn-primary");
    expect(buttons[1]).not.toHaveClass("btn-primary");
    expect(buttons[2]).not.toHaveClass("btn-primary");

    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenLastCalledWith(ImageSource.URL);
    expect(buttons[0]).not.toHaveClass("btn-primary");
    expect(buttons[1]).toHaveClass("btn-primary");
    expect(buttons[2]).not.toHaveClass("btn-primary");

    fireEvent.click(buttons[2]);
    expect(onChange).toHaveBeenLastCalledWith(ImageSource.CloudStorage);
    expect(buttons[0]).not.toHaveClass("btn-primary");
    expect(buttons[1]).not.toHaveClass("btn-primary");
    expect(buttons[2]).toHaveClass("btn-primary");
  });
});
