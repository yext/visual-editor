export type DevLoggerPrefix =
  | "TEMPLATE_METADATA"
  | "PUCK_CONFIG"
  | "SAVE_STATE"
  | "THEME_SAVE_STATE"
  | "VISUAL_CONFIGURATION_DATA"
  | "THEME_DATA"
  | "THEME_INITIAL_HISTORY"
  | "DOCUMENT"
  | "PUCK_INDEX"
  | "PUCK_HISTORY"
  | "PUCK_INITIAL_HISTORY"
  | "THEME_VALUES_TO_APPLY";

export class DevLogger {
  constructor(private enabled: boolean = false) {
    if (!this.enabled) {
      return;
    }

    console.log("[DEBUG] xYextDebug enabled");
  }

  enable = (enabled: boolean) => {
    this.enabled = enabled;

    if (!this.enabled) {
      return;
    }

    console.log("[DEBUG] xYextDebug enabled");
  };

  logData = (devLoggerPrefix: DevLoggerPrefix, payload: any) => {
    if (!this.enabled) {
      return;
    }

    console.log("[DEBUG]", devLoggerPrefix, "-", payload);
  };

  logFunc = (functionName: string) => {
    if (!this.enabled) {
      return;
    }

    console.log("[DEBUG] -->", functionName, "called");
  };

  log = (text: string) => {
    if (!this.enabled) {
      return;
    }

    console.log("[DEBUG]", text);
  };
}
