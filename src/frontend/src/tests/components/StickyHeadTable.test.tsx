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
import "@testing-library/jest-dom";
import { StickyHeadTable } from "components/selection/CloudImageSelector";
import { CloudImageInfo } from "queries";
import { describe, expect, test, vi } from "vitest";

describe("StickyHeadTable", () => {
  const infos: CloudImageInfo[] = [
    { imageId: "Image 1", annotation: "annotation 1" },
    { imageId: "Image 2", annotation: "annotation 2" },
    { imageId: "Image 3", annotation: "annotation 3" },
    { imageId: "Image 4", annotation: "annotation 4" },
    { imageId: "Image 5", annotation: "annotation 5" },
    { imageId: "Image 6", annotation: "annotation 6" },
    { imageId: "Image 7", annotation: "annotation 7" },
    { imageId: "Image 8", annotation: "annotation 8" },
    { imageId: "Image 9", annotation: "annotation 9" },
    { imageId: "Image 10", annotation: "annotation 10" },
  ];

  test("renders loading state correctly", () => {
    const { queryByText, queryByRole } = render(
      <StickyHeadTable
        selectedValue={undefined}
        listInfos={[]}
        isLoading={true}
        onInfoSelected={() => {}}
        onRefreshClicked={() => {}}
      />
    );

    expect(queryByText("Loading images from Cloud Storage")).not.toBeNull();
  });

  test("renders table rows correctly", () => {
    const { queryByText, getByText, getAllByRole } = render(
      <StickyHeadTable
        selectedValue={infos[0]}
        listInfos={infos}
        isLoading={false}
        onInfoSelected={() => {}}
        onRefreshClicked={() => {}}
      />
    );

    expect(queryByText("Loading images from Cloud Storage")).toBeNull();
    expect(getByText("Image 1")).not.toBeNull();
    expect(getByText("Image 2")).not.toBeNull();
    expect(getAllByRole("row")).toHaveLength(6); // 1 header row + 5 data rows
  });

  test("calls onInfoSelected when row is clicked", () => {
    const mock = vi.fn().mockImplementation(() => {});

    const { getByText } = render(
      <StickyHeadTable
        selectedValue={infos[0]}
        listInfos={infos}
        isLoading={false}
        onInfoSelected={mock}
        onRefreshClicked={() => {}}
      />
    );

    fireEvent.click(getByText("Image 2"));
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(infos[1]);
  });

  test("previous/next buttons disabled when no items exist", () => {
    const { getByRole } = render(
      <StickyHeadTable
        selectedValue={undefined}
        listInfos={[]}
        isLoading={false}
        onInfoSelected={() => {}}
        onRefreshClicked={() => {}}
      />
    );

    // Previous button is disabled
    expect(getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(getByRole("button", { name: "Next" })).toBeDisabled();
  });

  test("changes pagination correctly", () => {
    const { getByRole } = render(
      <StickyHeadTable
        selectedValue={undefined}
        listInfos={infos}
        isLoading={false}
        onInfoSelected={() => {}}
        onRefreshClicked={() => {}}
      />
    );

    // Previous button is disabled
    expect(getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(getByRole("button", { name: "Next" })).not.toBeDisabled();

    // change page to 1
    fireEvent.click(getByRole("button", { name: "Next" }));
    expect(getByRole("row", { name: "Image 6" })).not.toBeFalsy();

    // change page to 0
    fireEvent.click(getByRole("button", { name: "Previous" }));
    expect(getByRole("row", { name: "Image 1" })).not.toBeFalsy();
  });
});
