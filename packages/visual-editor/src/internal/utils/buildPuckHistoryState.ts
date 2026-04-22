import { AppState, Data } from "@puckeditor/core";

export const buildPuckHistoryState = (
  data: Data,
  ui?: AppState["ui"] | null
) => {
  if (ui == null) {
    return { data };
  }

  return { data, ui };
};
