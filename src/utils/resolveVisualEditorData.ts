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
  data: any,
  templateName: string | undefined
): string {
  if (!templateName) {
    throw new Error(
      "Unable to parse puck data, template name must be defined in config."
    );
  }

  const { document } = data;
  const entityConfigurations: VisualConfiguration[] =
    document.c_visualConfigurations ?? [];
  const entityLayoutConfigurations: PagesLayout[] =
    document.c_pages_layouts ?? [];
  const siteLayoutConfigurations: VisualLayout[] =
    document._site?.c_visualLayouts;

  // check base entity
  for (const entityConfiguration of entityConfigurations) {
    if (entityConfiguration.template === templateName) {
      const visualTemplate = JSON.parse(
        validateOrDefault(entityConfiguration.data, templateName)
      );
      return {
        ...data,
        document: {
          ...document,
          visualTemplate,
        },
      };
    }
  }
  // check layouts referenced by the base entity
  for (const entityLayout of entityLayoutConfigurations) {
    if (entityLayout.c_visualConfiguration?.template === templateName) {
      const visualTemplate = JSON.parse(
        validateOrDefault(entityLayout.c_visualConfiguration.data, templateName)
      );
      return {
        ...data,
        document: {
          ...document,
          visualTemplate,
        },
      };
    }
  }
  if (siteLayoutConfigurations) {
    // check layouts referenced by the site entity
    for (const siteLayout of siteLayoutConfigurations) {
      if (siteLayout.c_visualConfiguration?.template === templateName) {
        const visualTemplate = JSON.parse(
          validateOrDefault(siteLayout.c_visualConfiguration.data, templateName)
        );
        return {
          ...data,
          document: {
            ...document,
            visualTemplate,
          },
        };
      }
    }
  }

  console.warn(`Unable to find puck data for template: ${templateName}`);
  const visualTemplate = JSON.parse(defaultData);
  return {
    ...data,
    document: {
      ...document,
      visualTemplate,
    },
  };
}

function validateOrDefault(puckData: string, templateName: string): string {
  if (!puckData || puckData.length < 1) {
    console.warn(`Missing visual editor data for template: ${templateName}`);
    return defaultData;
  }

  try {
    JSON.parse(puckData); // check if the puckData is valid JSON
    // eslint-disable-next-line
  } catch (e) {
    console.warn(`Invalid visual editor data for template: ${templateName}`);
    return defaultData;
  }

  return puckData;
}
