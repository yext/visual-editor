export type DevLoggerPrefix =
  | "TEMPLATE_METADATA"
  | "PUCK_CONFIG"
  | "SAVE_STATE"
  | "THEME_SAVE_STATE"
  | "VISUAL_CONFIGURATION_DATA"
  | "THEME_DATA"
  | "THEME_HISTORIES"
  | "DOCUMENT"
  | "PUCK_INDEX"
  | "PUCK_HISTORY"
  | "PUCK_INITIAL_HISTORY"
  | "THEME_VALUES_TO_APPLY";

export class DevLogger {
  private static enabled: boolean;

  constructor(enabled: boolean = false) {
    DevLogger.enabled = enabled;
    if (!DevLogger.enabled) {
      return;
    }

    console.log("[DEBUG] xYextDebug enabled");
  }

  enable = (enabled: boolean) => {
    DevLogger.enabled = enabled;

    if (!DevLogger.enabled) {
      return;
    }

    console.log("[DEBUG] xYextDebug enabled");
  };

  logData = (devLoggerPrefix: DevLoggerPrefix, payload: any) => {
    if (!DevLogger.enabled) {
      return;
    }

    console.log("[DEBUG]", devLoggerPrefix, "-", payload);
  };

  logFunc = (functionName: string) => {
    if (!DevLogger.enabled) {
      return;
    }

    console.log("[DEBUG] -->", functionName, "called");
  };

  log = (text: string) => {
    if (!DevLogger.enabled) {
      return;
    }

    console.log("[DEBUG]", text);
  };
}
