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

import { fireEvent, getByTestId, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ImageSource,
  UnifiedImageSelector,
} from "components/selection/UnifiedImageSelector";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

const queryClient = new QueryClient();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("UnifiedImageSelector", () => {
  const handleFileChangeMock = vi.fn().mockImplementation(() => {});
  const handleAnnotateByUriMock = vi.fn().mockImplementation(() => {});
  const handleAnnotateByImageInfoMock = vi.fn().mockImplementation(() => {});

  const TEST_IMAGE_URI = "https://example.com/image.jpg";

  const defaultProps = {
    isLoading: false,
    imageSource: ImageSource.Upload,
    handleFileChange: handleFileChangeMock,
    handleAnnotateByUri: handleAnnotateByUriMock,
    handleAnnotateByImageInfo: handleAnnotateByImageInfoMock,
  };

  test("renders upload mode", () => {
    const { getByTestId } = render(<UnifiedImageSelector {...defaultProps} />, {
      wrapper: Wrapper,
    });

    const input = getByTestId("upload") as HTMLInputElement;
  });

  test("renders URL mode", () => {
    const { getByTestId } = render(
      <UnifiedImageSelector {...defaultProps} imageSource={ImageSource.URL} />,
      { wrapper: Wrapper }
    );
    expect(getByTestId("uri")).toBeInTheDocument();
  });

  test("renders CloudStorage mode", () => {
    const { getByTestId } = render(
      <UnifiedImageSelector
        {...defaultProps}
        imageSource={ImageSource.CloudStorage}
      />,
      { wrapper: Wrapper }
    );

    expect(getByTestId("cloud-storage")).toBeInTheDocument();
  });

  test("handles file change in upload mode", () => {
    const { getByTestId } = render(<UnifiedImageSelector {...defaultProps} />);
    const input = getByTestId("image-file-input") as HTMLInputElement;

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(handleFileChangeMock).toHaveBeenCalledWith(file);
  });

  test("handles Annotate by URI in URL mode", () => {
    const { getByTestId, getByText } = render(
      <UnifiedImageSelector {...defaultProps} imageSource={ImageSource.URL} />,
      { wrapper: Wrapper }
    );
    const input = getByTestId("image-uri-input") as HTMLInputElement;
    const annotateBtn = getByText("Annotate");

    fireEvent.change(input, {
      target: { value: TEST_IMAGE_URI },
    });
    fireEvent.click(annotateBtn);

    expect(handleAnnotateByUriMock).toHaveBeenCalledWith(TEST_IMAGE_URI);
  });
});
