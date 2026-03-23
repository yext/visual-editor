type DirectoryScenario = {
  description: string;
  create: (layoutVersion: number) => {
    document: Record<string, any>;
    layout: Record<string, any>;
  };
};

const testHours = {
  friday: {
    openIntervals: [{ end: "16:00", start: "10:00" }],
  },
  monday: {
    openIntervals: [{ end: "22:00", start: "10:00" }],
  },
  saturday: {
    openIntervals: [],
  },
  sunday: {
    openIntervals: [],
  },
  thursday: {
    openIntervals: [{ end: "18:00", start: "10:00" }],
  },
  tuesday: {
    openIntervals: [{ end: "20:00", start: "10:00" }],
  },
  wednesday: {
    openIntervals: [{ end: "18:00", start: "10:00" }],
  },
};

const createDirectoryChild = (
  index: number,
  options?: {
    includeHours?: boolean;
    includePhone?: boolean;
  }
) => {
  const includeHours = options?.includeHours ?? true;
  const includePhone = options?.includePhone ?? true;
  const streetNumber = 1000 + index;
  const suffix = `${index}`.padStart(3, "0");

  return {
    address: {
      city: "Arlington",
      countryCode: "US",
      line1: `${streetNumber} Wilson Blvd`,
      postalCode: `22${suffix}`,
      region: "VA",
    },
    ...(includePhone && {
      mainPhone: `+1202555${`${1000 + index}`.slice(-4)}`,
    }),
    ...(includeHours && {
      hours: testHours,
    }),
    name: `Galaxy Grill ${suffix}`,
    timezone: "America/New_York",
    slug: `arlington-${suffix}`,
  };
};

const cityDocument: Record<string, any> = {
  locale: "en",
  _site: {
    name: "Example Business",
  },
  __: {
    isPrimaryLocale: true,
  },
  _pageset: JSON.stringify({
    config: {
      urlTemplate: {
        primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
      },
    },
  }),
  dm_childEntityIds: ["8725530"],
  dm_directoryChildren: [
    createDirectoryChild(0),
    createDirectoryChild(1),
    createDirectoryChild(2, { includeHours: false }),
    createDirectoryChild(3, { includePhone: false }),
  ],
  name: "Arlington",
  meta: { entityType: { id: "dm_city", uid: 456 }, locale: "en" },
  dm_addressCountryDisplayName: "United States",
  dm_addressRegionDisplayName: "Virginia",
  dm_directoryManagerId: "63590-locations",
  dm_directoryParents_63590_locations: [
    { name: "Locations Directory", slug: "en/index.html" },
    {
      name: "US",
      slug: "en/us",
      dm_addressCountryDisplayName: "United States",
    },
    {
      name: "VA",
      slug: "us/va",
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    },
  ],
  slug: "us/va/arlington",
};

const version8Props = {
  data: {
    directoryRoot: "Directory Root",
  },
  styles: {
    backgroundColor: {
      bgColor: "bg-palette-primary-light",
      textColor: "text-black",
    },
    breadcrumbsBackgroundColor: {
      bgColor: "bg-palette-primary-light",
      textColor: "text-black",
    },
    cards: {
      backgroundColor: {
        bgColor: "bg-palette-primary-light",
        textColor: "text-black",
      },
      headingLevel: 3,
    },
  },
  liveVisibility: true,
};

const version40Props = {
  styles: {
    backgroundColor: {
      bgColor: "bg-palette-primary-dark",
      textColor: "text-white",
    },
  },
  slots: {
    TitleSlot: [
      {
        type: "HeadingTextSlot",
        props: {
          data: {
            text: {
              constantValue: {
                en: "[[name]]",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
              field: "",
            },
          },
          styles: { level: 2, align: "center" },
        },
      },
    ],
    SiteNameSlot: [
      {
        type: "HeadingTextSlot",
        props: {
          data: {
            text: {
              constantValue: {
                en: "",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
              field: "name",
            },
          },
          styles: { level: 4, align: "center" },
        },
      },
    ],
    BreadcrumbsSlot: [
      {
        type: "BreadcrumbsSlot",
        props: {
          data: {
            directoryRoot: {
              en: "Directory Root",
              hasLocalizedValue: "true",
            },
          },
          styles: {
            backgroundColor: {
              bgColor: "bg-palette-secondary-dark",
              textColor: "text-white",
            },
          },
          analytics: {
            scope: "directory",
          },
          liveVisibility: true,
        },
      },
    ],
    DirectoryGrid: [
      {
        type: "DirectoryGrid",
        props: {
          slots: {
            CardSlot: [],
          },
        },
      },
    ],
  },
};

const currentDirectoryProps = {
  styles: {
    backgroundColor: {
      bgColor: "bg-palette-primary-light",
      textColor: "text-black",
    },
  },
  slots: {
    TitleSlot: [
      {
        type: "HeadingTextSlot",
        props: {
          data: {
            text: {
              constantValue: { defaultValue: "" },
              constantValueEnabled: false,
              field: "name",
            },
          },
          styles: { level: 2, align: "center" },
        },
      },
    ],
    SiteNameSlot: [
      {
        type: "HeadingTextSlot",
        props: {
          data: {
            text: {
              constantValue: { defaultValue: "" },
              constantValueEnabled: true,
              field: "name",
            },
          },
          styles: { level: 4, align: "center" },
        },
      },
    ],
    BreadcrumbsSlot: [
      {
        type: "BreadcrumbsSlot",
        props: {
          data: {
            directoryRoot: { defaultValue: "Directory Root" },
            currentPage: {
              constantValue: { defaultValue: "[[name]]" },
              field: "name",
              constantValueEnabled: false,
            },
          },
          styles: {
            backgroundColor: {
              bgColor: "bg-palette-primary-light",
              textColor: "text-black",
            },
            showCurrentPage: true,
          },
          analytics: {
            scope: "directory",
          },
          liveVisibility: true,
        },
      },
    ],
    DirectoryGrid: [
      {
        type: "DirectoryGrid",
        props: {
          slots: {
            CardSlot: [],
          },
        },
      },
    ],
  },
  analytics: {
    scope: "directory",
  },
};

const buildLayout = (version: number, props: Record<string, any>) => ({
  root: {
    props: {
      version,
    },
  },
  content: [
    {
      type: "Directory",
      props,
    },
  ],
});

const buildDocumentWithLayout = (
  document: Record<string, any>,
  layout: Record<string, any>
) => ({
  ...structuredClone(document),
  __: {
    ...(document.__ ?? {}),
    layout: JSON.stringify(layout),
  },
});

const buildLargeCityDocument = (childCount: number) => {
  const document = structuredClone(cityDocument);
  document.dm_directoryChildren = Array.from({ length: childCount }, (_, index) =>
    createDirectoryChild(index, {
      includeHours: index % 4 !== 0,
      includePhone: index % 5 !== 0,
    })
  );
  document.dm_childEntityIds = document.dm_directoryChildren.map(
    (_child: Record<string, any>, index: number) => `child-${index}`
  );
  return document;
};

const scenarios: Record<string, DirectoryScenario> = {
  "directory-city-v8-preslot": {
    description: "Directory city layout using the older v8 props shape.",
    create: (layoutVersion) => {
      const layout = buildLayout(Math.min(layoutVersion, 8), structuredClone(version8Props));
      return {
        layout,
        document: buildDocumentWithLayout(cityDocument, layout),
      };
    },
  },
  "directory-city-v40-slotified": {
    description: "Slotified directory city layout using the v40 fixture shape.",
    create: (layoutVersion) => {
      const layout = buildLayout(
        Math.min(layoutVersion, 40),
        structuredClone(version40Props)
      );
      return {
        layout,
        document: buildDocumentWithLayout(cityDocument, layout),
      };
    },
  },
  "directory-city-current": {
    description: "Current directory city layout with a small child set.",
    create: (layoutVersion) => {
      const layout = buildLayout(layoutVersion, structuredClone(currentDirectoryProps));
      return {
        layout,
        document: buildDocumentWithLayout(cityDocument, layout),
      };
    },
  },
  "directory-city-current-100-children": {
    description:
      "Current directory city layout with 100 child profiles to amplify card materialization cost.",
    create: (layoutVersion) => {
      const layout = buildLayout(layoutVersion, structuredClone(currentDirectoryProps));
      return {
        layout,
        document: buildDocumentWithLayout(buildLargeCityDocument(100), layout),
      };
    },
  },
};

export const getDirectoryMemoryPresetNames = () => Object.keys(scenarios).sort();

export const getDirectoryMemoryPreset = (
  name: string,
  layoutVersion: number
) => {
  const scenario = scenarios[name];
  if (!scenario) {
    throw new Error(
      `Unknown preset "${name}". Available presets: ${getDirectoryMemoryPresetNames().join(", ")}`
    );
  }

  const created = scenario.create(layoutVersion);
  return {
    description: scenario.description,
    layout: structuredClone(created.layout),
    document: structuredClone(created.document),
  };
};
