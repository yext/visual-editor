import { ThemeData } from "../types/themeData.ts";
import { Data } from "@measured/puck";
import { resolveVisualEditorData } from "../../utils/resolveVisualEditorData.ts";
import { jsonFromEscapedJsonString } from "./jsonFromEscapedJsonString.ts";

type VisualEditorData = {
  visualConfigurationData?: Data;
  themeData?: ThemeData;
};

export const parseConfigsFromDocument = (
  document: any,
  pageSet: string,
  siteId: number
): VisualEditorData => {
  if (document) {
    const resolvedData = resolveVisualEditorData(
      { document: document },
      pageSet,
      siteId
    );
    const visualConfigurationData = resolvedData.document.visualTemplate;
    const themes: Record<string, any>[] =
      resolvedData.document._site.pagesTheme;

    let themeDataString: string = "{}";
    if (themes?.length > 0) {
      themeDataString =
        siteId !== 0
          ? (themes.find(
              (theme) => Number(theme.themeConfiguration.siteId) === siteId
            )?.themeConfiguration.data ?? "{}")
          : themes[0].themeConfiguration.data; // siteId is not set on local data documents, so default to the first one
    }

    const themeData = jsonFromEscapedJsonString(themeDataString);

    return {
      visualConfigurationData: visualConfigurationData,
      themeData: themeData,
    };
  }
  return {};
};
