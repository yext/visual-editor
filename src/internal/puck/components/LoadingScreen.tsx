import { Progress } from "../ui/Progress.tsx";
import React from "react";

export type LoadingScreenProps = {
  progress: number;
};

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="ve-flex ve-h-screen ve-w-screen ve-flex-col ve-items-center ve-justify-center puck-css">
      <Progress className="ve-w-1/3" value={progress} />
      <div>Loading Visual Editor...</div>
    </div>
  );
}
