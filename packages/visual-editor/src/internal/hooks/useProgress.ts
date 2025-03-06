import { useMemo } from "react";

interface UseProgressProps {
  minProgress?: number;
  maxProgress?: number;
  completionCriteria: boolean[];
}

/**
 * A custom hook that calculates the progress as a percentage based on an array of boolean values.
 * It returns whether the process is loading (`isLoading`) and the progress percentage (`progress`).
 *
 * @param minProgress - The minimum value for progress (default is 0).
 * @param maxProgress - The maximum value for progress (default is 100).
 * @param completionCriteria - An array of boolean values representing the criteria for the loading process completion.
 *
 * @returns {Object} - { isLoading: boolean, progress: number }
 */
export const useProgress = ({
  minProgress = 0,
  maxProgress = 100,
  completionCriteria,
}: UseProgressProps) => {
  // Check if any value is false to determine if loading is true
  const isLoading = useMemo(
    () => completionCriteria.includes(false),
    [completionCriteria]
  );

  // Calculate the progress as the fraction of 'true' values, scaled from minProgress to maxProgress
  const progress = useMemo(() => {
    const trueCount = completionCriteria.filter(Boolean).length;
    const totalCount = completionCriteria.length;
    const fraction = totalCount > 0 ? trueCount / totalCount : 0;
    return Math.round(minProgress + fraction * (maxProgress - minProgress));
  }, [completionCriteria, minProgress, maxProgress]);

  return { isLoading, progress };
};
