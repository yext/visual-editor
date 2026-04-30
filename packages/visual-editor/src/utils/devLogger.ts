export type DevLoggerPrefix =
  | "TEMPLATE_METADATA"
  | "ENTITY_FIELDS"
  | "PUCK_CONFIG"
  | "LAYOUT_SAVE_STATE"
  | "THEME_SAVE_STATE"
  | "LAYOUT_DATA"
  | "RESOLVED_LAYOUT_DATA"
  | "PASTED_DATA"
  | "THEME_DATA"
  | "THEME_HISTORIES"
  | "DOCUMENT"
  | "PUCK_INDEX"
  | "PUCK_HISTORY"
  | "PUCK_INITIAL_HISTORY"
  | "THEME_VALUES_TO_APPLY";

type PendingLogEntry =
  | {
      kind: "data";
      prefix: DevLoggerPrefix;
      payload: any;
    }
  | {
      kind: "func";
      functionName: string;
    }
  | {
      kind: "text";
      text: string;
    };

export class DevLogger {
  private static enabled = false;
  private static pendingLogs: PendingLogEntry[] = [];
  private static readonly maxPendingLogs = 100;

  constructor(enabled: boolean = false) {
    if (enabled) {
      this.enable(true);
    }
  }

  enable = (enabled: boolean) => {
    DevLogger.enabled = enabled;

    if (!DevLogger.enabled) {
      return;
    }

    console.log("[DEBUG] xYextDebug enabled");
    DevLogger.pendingLogs.forEach((entry) => {
      switch (entry.kind) {
        case "data":
          console.log("[DEBUG]", entry.prefix, "-", entry.payload);
          break;
        case "func":
          console.log("[DEBUG] -->", entry.functionName, "called");
          break;
        case "text":
          console.log("[DEBUG]", entry.text);
          break;
      }
    });
    DevLogger.pendingLogs = [];
  };

  logData = (devLoggerPrefix: DevLoggerPrefix, payload: any) => {
    if (!DevLogger.enabled) {
      DevLogger.bufferLog({
        kind: "data",
        prefix: devLoggerPrefix,
        payload,
      });
      return;
    }

    console.log("[DEBUG]", devLoggerPrefix, "-", payload);
  };

  logFunc = (functionName: string) => {
    if (!DevLogger.enabled) {
      DevLogger.bufferLog({
        kind: "func",
        functionName,
      });
      return;
    }

    console.log("[DEBUG] -->", functionName, "called");
  };

  log = (text: string) => {
    if (!DevLogger.enabled) {
      DevLogger.bufferLog({
        kind: "text",
        text,
      });
      return;
    }

    console.log("[DEBUG]", text);
  };

  private static bufferLog = (entry: PendingLogEntry) => {
    DevLogger.pendingLogs.push(entry);
    if (DevLogger.pendingLogs.length > DevLogger.maxPendingLogs) {
      DevLogger.pendingLogs.shift();
    }
  };
}
