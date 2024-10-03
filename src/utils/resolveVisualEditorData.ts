type VisualConfiguration = {
  pageSet: string;
  data: string;
  siteId: number;
};

type PagesLayout = {
  visualConfiguration?: VisualConfiguration;
};

type VisualLayout = {
  visualConfiguration?: VisualConfiguration;
};

const defaultData = JSON.stringify({
  root: {},
  content: [],
  zones: {},
});

export function resolveVisualEditorData(
  data: any,
  pageSet: string | undefined
): string {
  if (!pageSet) {
    throw new Error(
      "Unable to parse puck data, template name must be defined in config."
    );
  }

  const { document } = data;
  const entityConfigurations: VisualConfiguration[] =
    document.visualConfigurations ?? [];
  const entityLayoutConfigurations: PagesLayout[] = document.pageLayouts ?? [];
  const siteLayoutConfigurations: VisualLayout[] =
    document._site?.defaultLayouts;

  // check base entity
  for (const entityConfiguration of entityConfigurations) {
    if (entityConfiguration.pageSet === pageSet) {
      const visualTemplate = JSON.parse(
        validateOrDefault(entityConfiguration.data, pageSet)
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
    if (entityLayout.visualConfiguration?.pageSet === pageSet) {
      const visualTemplate = JSON.parse(
        validateOrDefault(entityLayout.visualConfiguration.data, pageSet)
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
      if (siteLayout.visualConfiguration?.pageSet === pageSet) {
        const visualTemplate = JSON.parse(
          validateOrDefault(siteLayout.visualConfiguration.data, pageSet)
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

  console.warn(`Unable to find puck data for pageSet: ${pageSet}`);
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
