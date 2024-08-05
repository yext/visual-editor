type VisualConfiguration = {
  template: string;
  data: string;
};

type PagesLayout = {
  c_visualConfiguration?: VisualConfiguration;
};

type VisualLayout = {
  c_visualConfiguration?: VisualConfiguration;
};

const defaultData = JSON.stringify({
  root: {},
  content: [],
  zones: {},
});

export function resolveVisualEditorData(
  entityConfigurations: VisualConfiguration[],
  entityLayoutConfigurations: PagesLayout[],
  siteLayoutConfigurations: VisualLayout[],
  templateName: string | undefined
): string {
  if (!templateName) {
    throw new Error(
      "Unable to parse puck data, template name must be defined in config."
    );
  }
  // check base entity
  for (const entityConfiguration of entityConfigurations) {
    if (entityConfiguration.template === templateName) {
      return validateOrDefault(entityConfiguration.data, templateName);
    }
  }
  // check layouts referenced by the base entity
  for (const entityLayout of entityLayoutConfigurations) {
    if (entityLayout.c_visualConfiguration?.template === templateName) {
      return validateOrDefault(
        entityLayout.c_visualConfiguration.data,
        templateName
      );
    }
  }
  // check layouts referenced by the site entity
  for (const siteLayout of siteLayoutConfigurations) {
    if (siteLayout.c_visualConfiguration?.template === templateName) {
      return validateOrDefault(
        siteLayout.c_visualConfiguration.data,
        templateName
      );
    }
  }

  console.warn(`Unable to find puck data for template: ${templateName}`);
  return defaultData;
}

function validateOrDefault(puckData: string, templateName: string): string {
  if (!puckData || puckData.length < 1) {
    console.warn(`Missing visual editor data for template: ${templateName}`);
    return defaultData;
  }

  try {
    JSON.parse(puckData); // check if the puckData is valid JSON
  } catch (e) {
    console.warn(`Invalid visual editor data for template: ${templateName}`);
    return defaultData;
  }

  return puckData;
}
