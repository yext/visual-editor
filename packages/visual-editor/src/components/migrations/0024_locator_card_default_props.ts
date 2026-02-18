import { Migration } from "../../utils/migrate.ts";

const DEFAULT_RESULT_CARD = {
  primaryHeading: {
    field: {
      selection: {
        value: "name",
      },
    },
    headingLevel: 3,
  },
  secondaryHeading: {
    field: {
      selection: {
        value: "name",
      },
    },
    variant: "base",
    liveVisibility: false,
  },
  tertiaryHeading: {
    field: {
      selection: {
        value: "name",
      },
    },
    variant: "base",
    liveVisibility: false,
  },
  icons: false,
  hours: {
    field: {
      selection: {
        value: "hours",
      },
    },
    table: {
      startOfWeek: "today",
      collapseDays: false,
      showAdditionalHoursText: false,
    },
    liveVisibility: true,
  },
  address: {
    showGetDirectionsLink: true,
    liveVisibility: true,
  },
  phone: {
    field: {
      selection: {
        value: "mainPhone",
      },
    },
    phoneFormat: "domestic",
    includePhoneHyperlink: true,
    liveVisibility: true,
  },
  email: {
    field: {
      selection: {
        value: "emails",
      },
    },
    liveVisibility: false,
  },
  services: {
    field: {
      selection: {
        value: "services",
      },
    },
    liveVisibility: false,
  },
  primaryCTA: {
    label: "Visit Page",
    variant: "primary",
    liveVisibility: true,
  },
  secondaryCTA: {
    label: "Call to Action",
    link: "#",
    variant: "secondary",
    liveVisibility: false,
  },
  image: {
    field: {
      selection: {
        value: "headshot",
      },
    },
    liveVisibility: false,
  },
};

export const locatorCardDefaultProps: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      const existingResultCard = props.resultCard || {};
      return {
        ...props,
        resultCard: {
          ...DEFAULT_RESULT_CARD,
          ...existingResultCard,
          // Deep merge nested objects
          primaryHeading: {
            ...DEFAULT_RESULT_CARD.primaryHeading,
            ...existingResultCard.primaryHeading,
          },
          secondaryHeading: {
            ...DEFAULT_RESULT_CARD.secondaryHeading,
            ...existingResultCard.secondaryHeading,
          },
          tertiaryHeading: {
            ...DEFAULT_RESULT_CARD.tertiaryHeading,
            ...existingResultCard.tertiaryHeading,
          },
          hours: {
            ...DEFAULT_RESULT_CARD.hours,
            ...existingResultCard.hours,
            table: {
              ...DEFAULT_RESULT_CARD.hours.table,
              ...(existingResultCard.hours && existingResultCard.hours.table),
            },
          },
          address: {
            ...DEFAULT_RESULT_CARD.address,
            ...existingResultCard.address,
          },
          phone: {
            ...DEFAULT_RESULT_CARD.phone,
            ...existingResultCard.phone,
          },
          email: {
            ...DEFAULT_RESULT_CARD.email,
            ...existingResultCard.email,
          },
          services: {
            ...DEFAULT_RESULT_CARD.services,
            ...existingResultCard.services,
          },
          primaryCTA: {
            ...DEFAULT_RESULT_CARD.primaryCTA,
            ...existingResultCard.primaryCTA,
          },
          secondaryCTA: {
            ...DEFAULT_RESULT_CARD.secondaryCTA,
            ...existingResultCard.secondaryCTA,
          },
          image: {
            ...DEFAULT_RESULT_CARD.image,
            ...existingResultCard.image,
          },
        },
      };
    },
  },
};
