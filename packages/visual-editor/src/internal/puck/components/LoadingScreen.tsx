import { Progress } from "../ui/Progress.tsx";
import React from "react";
import "../ui/puck.css";
import "../../../components/editor/index.css";

export type LoadingScreenProps = {
  progress: number;
};

export function LoadingScreen({ progress }: LoadingScreenProps) {
  // This ensures that the progress bar never goes backwards.
  const [maxProgress, setMaxProgress] = React.useState(0);
  React.useEffect(() => {
    if (progress > maxProgress) {
      setMaxProgress(progress);
    }
  }, [progress, maxProgress]);

  return (
    <div className="ve-flex ve-h-screen ve-loading-wrapper ve-w-screen ve-flex-col ve-items-center ve-justify-center">
      <Progress className="ve-w-1/3 ve-loading-progress" value={maxProgress} />
      <div>Loading Visual Editor...</div>
    </div>
  );
}
