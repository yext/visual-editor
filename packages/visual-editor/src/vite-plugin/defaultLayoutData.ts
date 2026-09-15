const directoryDefaultLayout = {
  root: {
    props: {
      version: 76,
      title: {
        field: "",
        constantValue: { defaultValue: "PLACEHOLDER" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: { defaultValue: "PLACEHOLDER" },
        constantValueEnabled: true,
      },
    },
    type: "root",
  },
  content: [
    {
      type: "MainContent",
      props: {
        id: "MainContent-76dbbc2c-0ca1-479c-ac6b-5e6b4bd82be7",
        content: [
          {
            type: "Directory",
            props: {
              styles: {
                backgroundColor: {
                  selectedColor: "white",
                  contrastingColor: "black",
                },
                listBackgroundColor: {
                  selectedColor: "white",
                  contrastingColor: "black",
                },
              },
              slots: {
                TitleSlot: [
                  {
                    type: "HeadingTextSlot",
                    props: {
                      id: "HeadingTextSlot-1a871989-a34d-426c-b24a-a1888c1a46ea",
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
                      id: "HeadingTextSlot-9a120ff6-d494-4ec8-9ab8-e43017d77c03",
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
                      id: "BreadcrumbsSlot-13dba298-abd1-4f75-a7e9-b19779a4fc5b",
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
                          selectedColor: "white",
                          contrastingColor: "black",
                        },
                        showCurrentPage: true,
                      },
                      analytics: { scope: "directory" },
                      liveVisibility: true,
                    },
                  },
                ],
                DirectoryGrid: [
                  {
                    type: "DirectoryGrid",
                    props: {
                      id: "DirectoryGrid-dab8e202-600a-47da-b5c7-971df3f504fb",
                      styles: {
                        backgroundColor: {
                          selectedColor: "white",
                          contrastingColor: "black",
                        },
                      },
                      slots: { CardSlot: [] },
                    },
                  },
                ],
              },
              analytics: { scope: "directory" },
              id: "Directory-d21d6943-0a81-4a8e-b76b-cecb5b157c14",
            },
          },
        ],
      },
    },
  ],
  zones: {},
};

const locatorDefaultLayout = {
  root: {
    props: {
      version: 73,
      title: {
        field: "",
        constantValue: { defaultValue: "Find Locations" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: { defaultValue: "Find the right location for you." },
        constantValueEnabled: true,
      },
    },
  },
  content: [
    {
      type: "MainContent",
      props: {
        id: "MainContent-b6c58f1c-102d-46af-a58c-65751efa30da",
        content: [
          {
            type: "Locator",
            props: {
              pageHeading: {
                title: { defaultValue: "Find a Location" },
              },
              id: "Locator-2ae506f4-a3ee-46ea-b5f9-e4c3236243a7",
              mapStyle: "mapbox://styles/mapbox/streets-v12",
              locationStyles: [],
              filters: { openNowButton: false, showDistanceOptions: false },
              resultCard: [],
              distanceDisplay: "distanceFromUser",
            },
          },
        ],
      },
    },
  ],
  zones: {},
};

export const defaultLayoutData = {
  directory: JSON.stringify(directoryDefaultLayout),
  locator: JSON.stringify(locatorDefaultLayout),
};
