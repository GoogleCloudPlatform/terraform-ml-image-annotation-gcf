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

import {
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

type AlertProps = {
  mode: "info" | "success" | "error" | "loading";
  text: string;
  className?: string;
};

export default ({ mode, text, className }: AlertProps) => {
  let icon;

  switch (mode) {
    case "info":
      icon = <InformationCircleIcon className="w-8 h-8" />;
      break;
    case "loading":
      icon = <ClockIcon className="w-8 h-8" />;
      break;
    case "success":
      icon = <CheckCircleIcon className="w-8 h-8" />;
      break;
    case "error":
      icon = <XCircleIcon className="w-8 h-8" />;
      break;
    default:
      icon = null;
  }

  return (
    <div
      className={clsx(
        className,
        "flex items-center px-4 py-3 rounded",
        "items-center",
        "gap-4",
        {
          "bg-blue-100 border border-blue-400 text-blue-700":
            mode === "info" || mode === "loading",
          "bg-green-100 border border-green-400 text-green-700":
            mode === "success",
          "bg-red-100 border border-red-400 text-red-700": mode === "error",
        }
      )}
      role="alert"
    >
      {icon}
      <span className="block sm:inline">{text}</span>
    </div>
  );
};
