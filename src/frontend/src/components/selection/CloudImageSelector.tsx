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

import { getImageInfo, CloudImageInfo } from "queries";
import { useState } from "react";
import { useQuery } from "react-query";
import * as React from "react";
import clsx from "clsx";
import Alert from "components/Alert";

const rowsPerPage = 5;

export const StickyHeadTable = ({
  selectedValue,
  listInfos,
  isLoading,
  onInfoSelected,
  onRefreshClicked,
}: {
  selectedValue?: CloudImageInfo;
  listInfos: CloudImageInfo[];
  isLoading: Boolean;
  onInfoSelected: (info: CloudImageInfo) => void;
  onRefreshClicked: () => void;
}) => {
  const [page, setPage] = React.useState(0);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return <Alert mode="loading" text="Loading images from Cloud Storage" />;
  }

  const startIndex = page * rowsPerPage;
  const endIndex = page * rowsPerPage + rowsPerPage;
  const infoSlice = listInfos.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col w-full min-w-md">
      <table className="table">
        <thead>
          <tr>
            <th key="imageId" className={clsx("px-4 py-2", "text-left")}>
              Select an image below
            </th>
          </tr>
        </thead>
        <tbody>
          {infoSlice.map((info, index) => (
            <tr
              key={index}
              className={clsx("cursor-pointer")}
              onClick={() => onInfoSelected(info)}
            >
              <td
                className={clsx(
                  "px-4 py-4",
                  "text-left",
                  selectedValue?.annotation === info.annotation &&
                    "bg-green-500",
                  "hover:bg-green-100"
                )}
              >
                {info.imageId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-end mt-3 gap-4">
        <button className="btn btn-secondary btn-sm" onClick={onRefreshClicked}>
          Refresh
        </button>
        <button
          name="Previous"
          className="btn btn-primary btn-sm"
          disabled={page === 0}
          onClick={() => handleChangePage(null, page - 1)}
        >
          Previous
        </button>
        <span>
          Items {startIndex} to {endIndex}
        </span>
        <button
          className="btn btn-primary btn-sm"
          disabled={listInfos.length <= (page + 1) * rowsPerPage}
          onClick={() => handleChangePage(null, page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ({
  onImageInfoSelected,
}: {
  onImageInfoSelected: (info: CloudImageInfo) => void;
}) => {
  const [selectedImageInfo, setSelectedImageInfo] = useState<CloudImageInfo>();
  const getImageInfoQuery = useQuery<CloudImageInfo[], Error>(
    ["getImageInfo"],
    () => {
      return getImageInfo().then((infos) =>
        infos.filter((info) => info.annotation != null)
      );
    },
    { refetchOnWindowFocus: false }
  );

  console.log(getImageInfoQuery);
  return (
    <StickyHeadTable
      selectedValue={selectedImageInfo}
      listInfos={getImageInfoQuery.data ?? []}
      isLoading={getImageInfoQuery.isLoading || getImageInfoQuery.isFetching}
      onInfoSelected={(info: CloudImageInfo) => {
        setSelectedImageInfo(info);
        onImageInfoSelected(info);
      }}
      onRefreshClicked={() => {
        getImageInfoQuery.refetch();
      }}
    />
  );
};
