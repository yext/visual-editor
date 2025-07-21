import { Progress } from "../ui/Progress.tsx";
import React from "react";
import "../ui/puck.css";
import "../../../editor/index.css";
import { pt } from "../../../utils/i18n/platform.ts";

export type LoadingScreenProps = {
  progress: number;
  platformLanguageIsSet: boolean;
};

export function LoadingScreen({
  progress,
  platformLanguageIsSet,
}: LoadingScreenProps) {
  return (
    <div className="ve-flex ve-h-screen ve-loading-wrapper ve-w-screen ve-flex-col ve-items-center ve-justify-center">
      <Progress className="ve-w-1/3 ve-loading-progress" value={progress} />
      {platformLanguageIsSet && (
        <div>{pt("loadingVE", "Loading Visual Editor...")}</div>
      )}
    </div>
  );
}
