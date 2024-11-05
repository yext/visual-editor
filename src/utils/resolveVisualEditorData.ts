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
): any {
  if (!pageSet) {
    throw new Error(
      "Unable to parse puck data, template name must be defined in config."
    );
  }

  const { document } = data;
  const siteId = document?.siteId;

  const entityConfigurations: VisualConfiguration[] =
    document.visualConfigurations ?? [];
  const entityLayoutConfigurations: PagesLayout[] = document.pageLayouts ?? [];
  const siteLayoutConfigurations: VisualLayout[] =
    document._site?.defaultLayouts;

  let visualTemplate: any;

  // check base entity
  for (const entityConfiguration of entityConfigurations) {
    if (
      entityConfiguration.pageSet === pageSet &&
      (!siteId || Number(entityConfiguration.siteId) === siteId)
    ) {
      visualTemplate = JSON.parse(
        validateOrDefault(entityConfiguration.data, pageSet)
      );
      break;
    }
  }

  // check layouts referenced by the base entity
  if (!visualTemplate) {
    for (const entityLayout of entityLayoutConfigurations) {
      if (
        entityLayout.visualConfiguration?.pageSet === pageSet &&
        (!siteId || Number(entityLayout.visualConfiguration.siteId) === siteId)
      ) {
        visualTemplate = JSON.parse(
          validateOrDefault(entityLayout.visualConfiguration.data, pageSet)
        );
        break;
      }
    }
  }

  // check layouts referenced by the site entity
  if (!visualTemplate && siteLayoutConfigurations) {
    for (const siteLayout of siteLayoutConfigurations) {
      if (
        siteLayout.visualConfiguration?.pageSet === pageSet &&
        (!siteId || Number(siteLayout.visualConfiguration.siteId) === siteId)
      ) {
        visualTemplate = JSON.parse(
          validateOrDefault(siteLayout.visualConfiguration.data, pageSet)
        );
        break;
      }
    }
  }

  // fallback to no visualTemplate data
  if (!visualTemplate) {
    console.warn(`Unable to find puck data for pageSet: ${pageSet}`);
    visualTemplate = JSON.parse(defaultData);
  }

  const updatedDocument = data;
  updatedDocument.document.visualTemplate = visualTemplate;

  // Handles previewing themes which is put on a custom property because we can't override _site fields
  const themeForPreview = document._customDataOverrides?.pagesTheme;
  if (themeForPreview) {
    if (!updatedDocument.document._site) {
      updatedDocument.document._site = {
        pagesTheme: themeForPreview,
      };
    } else {
      updatedDocument.document._site.pagesTheme = themeForPreview;
    }
  }

  return updatedDocument;
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
