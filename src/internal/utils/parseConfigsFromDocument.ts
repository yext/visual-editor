import { jsonFromEscapedJsonString } from "./jsonFromEscapedJsonString.ts";

type documentConfigs = {
  visualConfigurationData?: any;
  themeData?: any;
};

export const parseConfigsFromDocument = (document: any): documentConfigs => {
  if (document) {
    const themeString =
      document?._site?.pagesTheme?.[0]?.themeConfiguration?.data;
    const visualConfigString =
      document?.pageLayouts?.[0]?.visualConfiguration?.data;

    return {
      visualConfigurationData: visualConfigString
        ? jsonFromEscapedJsonString(visualConfigString)
        : undefined,
      themeData: themeString
        ? jsonFromEscapedJsonString(themeString)
        : undefined,
    };
  }
  return {};
};
