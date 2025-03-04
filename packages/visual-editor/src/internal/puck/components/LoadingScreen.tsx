import { Progress } from "../ui/Progress.tsx";
import React from "react";
import "../ui/puck.css";
import "../../../components/editor/index.css";

export type LoadingScreenProps = {
  progress: number;
};

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="ve-flex ve-h-screen ve-loading-wrapper ve-w-screen ve-flex-col ve-items-center ve-justify-center">
      <Progress className="ve-w-1/3 ve-loading-progress" value={progress} />
      <div>Loading Visual Editor...</div>
    </div>
  );
}
