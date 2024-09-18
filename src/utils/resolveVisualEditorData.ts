type VisualConfiguration = {
  pageSet: string;
  data: string;
};

type Layout = {
  visualConfiguration?: VisualConfiguration;
};

const defaultData = JSON.stringify({
  root: {},
  content: [],
  zones: {},
});

export function resolveVisualEditorData(
  data: any,
  pageSetName: string | undefined
): string {
  if (!pageSetName) {
    throw new Error(
      "Unable to parse puck data, page set name must be defined in config."
    );
  }

  const { document } = data;
  const entityConfigurations: VisualConfiguration[] =
    document.visualConfigurations ?? [];
  const entityLayoutConfigurations: Layout[] = document.pagesLayouts ?? [];
  const siteLayoutConfigurations: Layout[] = document._site?.defaultLayouts;

  // check base entity
  for (const entityConfiguration of entityConfigurations) {
    if (entityConfiguration.pageSet === pageSetName) {
      const pageSet = JSON.parse(
        validateOrDefault(entityConfiguration.data, pageSetName)
      );
      return {
        ...data,
        document: {
          ...document,
          pageSet,
        },
      };
    }
  }
  // check layouts referenced by the base entity
  for (const entityLayout of entityLayoutConfigurations) {
    if (entityLayout.visualConfiguration?.pageSet === pageSetName) {
      const pageSet = JSON.parse(
        validateOrDefault(entityLayout.visualConfiguration.data, pageSetName)
      );
      return {
        ...data,
        document: {
          ...document,
          pageSet,
        },
      };
    }
  }
  if (siteLayoutConfigurations) {
    // check layouts referenced by the site entity
    for (const siteLayout of siteLayoutConfigurations) {
      if (siteLayout.visualConfiguration?.pageSet === pageSetName) {
        const pageSet = JSON.parse(
          validateOrDefault(siteLayout.visualConfiguration.data, pageSetName)
        );
        return {
          ...data,
          document: {
            ...document,
            pageSet,
          },
        };
      }
    }
  }

  console.warn(`Unable to find puck data for page set: ${pageSetName}`);
  const pageSet = JSON.parse(defaultData);
  return {
    ...data,
    document: {
      ...document,
      pageSet,
    },
  };
}

function validateOrDefault(puckData: string, pageSetName: string): string {
  if (!puckData || puckData.length < 1) {
    console.warn(`Missing visual editor data for page set: ${pageSetName}`);
    return defaultData;
  }

  try {
    JSON.parse(puckData); // check if the puckData is valid JSON
    // eslint-disable-next-line
  } catch (e) {
    console.warn(`Invalid visual editor data for page set: ${pageSetName}`);
    return defaultData;
  }

  return puckData;
}
