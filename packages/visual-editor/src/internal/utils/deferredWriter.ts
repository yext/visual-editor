type CancelScheduledTask = () => void;

type ScheduleTask = (task: () => void) => CancelScheduledTask;

const scheduleDeferredTask: ScheduleTask = (task) => {
  const windowWithIdleCallbacks = window as Window &
    typeof globalThis & {
      cancelIdleCallback?: (id: number) => void;
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
    };

  if (typeof windowWithIdleCallbacks.requestIdleCallback === "function") {
    const idleCallbackId = windowWithIdleCallbacks.requestIdleCallback(
      () => task(),
      { timeout: 150 }
    );

    return () => windowWithIdleCallbacks.cancelIdleCallback?.(idleCallbackId);
  }

  const timeoutId = window.setTimeout(task, 150);
  return () => window.clearTimeout(timeoutId);
};

export const createDeferredWriter = <T>(
  writeValue: (value: T) => void,
  scheduleTask: ScheduleTask = scheduleDeferredTask
) => {
  let pendingValue: T | undefined;
  let hasPendingValue = false;
  let cancelPendingTask: CancelScheduledTask | undefined;

  const runPendingWrite = () => {
    cancelPendingTask = undefined;
    if (!hasPendingValue) {
      return;
    }

    const valueToWrite = pendingValue as T;
    pendingValue = undefined;
    hasPendingValue = false;
    writeValue(valueToWrite);
  };

  return {
    schedule(value: T) {
      pendingValue = value;
      hasPendingValue = true;
      cancelPendingTask?.();
      cancelPendingTask = scheduleTask(runPendingWrite);
    },
    flush() {
      cancelPendingTask?.();
      runPendingWrite();
    },
    cancel() {
      cancelPendingTask?.();
      cancelPendingTask = undefined;
      pendingValue = undefined;
      hasPendingValue = false;
    },
  };
};
