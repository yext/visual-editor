import { AppState, Config, Data } from "@puckeditor/core";

/** Restores saved layout history while letting the current config define categories. */
export const buildPuckHistoryState = (
  data: Data,
  ui?: AppState["ui"] | null,
  categories?: Config["categories"]
): { data: Data; ui?: AppState["ui"] } => {
  if (ui == null) {
    return { data };
  }

  // Puck snapshots component categories in history, but the current config
  // must provide them when newly added sections are loaded.
  return {
    data,
    ui: {
      ...ui,
      componentList: Object.fromEntries(
        Object.entries(categories ?? {}).map(([name, category]) => [
          name,
          {
            title: category.title,
            components: category.components,
            visible: category.visible,
            expanded:
              ui.componentList?.[name]?.expanded ?? category.defaultExpanded,
          },
        ])
      ),
    },
  };
};
