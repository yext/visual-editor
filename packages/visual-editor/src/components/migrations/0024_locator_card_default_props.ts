import { Migration } from "../../utils/migrate.ts";

const DEFAULT_RESULT_CARD = {
  primaryHeading: {
    field: "name",
    headingLevel: 3,
  },
  secondaryHeading: {
    field: "name",
    variant: "base",
  },
  tertiaryHeading: {
    field: "name",
    variant: "base",
  },
  icons: true,
  hours: {
    table: {
      startOfWeek: "today",
      collapseDays: false,
    },
    liveVisibility: true,
  },
  address: {
    showGetDirectionsLink: true,
    liveVisibility: true,
  },
  phone: {
    field: "mainPhone",
    phoneFormat: "domestic",
    includePhoneHyperlink: true,
    liveVisibility: true,
  },
  email: {
    field: "emails",
    liveVisibility: false,
  },
  services: {
    field: "services",
    liveVisibility: false,
  },
  primaryCTA: {
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
    field: "headshot",
    liveVisibility: false,
  },
};

// test

export const locatorCardDefaultProps: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        resultCard: {
          ...DEFAULT_RESULT_CARD,
          ...props.resultCard,
          // Deep merge nested objects
          primaryHeading: {
            ...DEFAULT_RESULT_CARD.primaryHeading,
            ...props.resultCard?.primaryHeading,
          },
          secondaryHeading: {
            ...DEFAULT_RESULT_CARD.secondaryHeading,
            ...props.resultCard?.secondaryHeading,
          },
          tertiaryHeading: {
            ...DEFAULT_RESULT_CARD.tertiaryHeading,
            ...props.resultCard?.tertiaryHeading,
          },
          hours: {
            ...DEFAULT_RESULT_CARD.hours,
            ...props.resultCard?.hours,
            table: {
              ...DEFAULT_RESULT_CARD.hours.table,
              ...props.resultCard?.hours?.table,
            },
          },
          address: {
            ...DEFAULT_RESULT_CARD.address,
            ...props.resultCard?.address,
          },
          phone: {
            ...DEFAULT_RESULT_CARD.phone,
            ...props.resultCard?.phone,
          },
          email: {
            ...DEFAULT_RESULT_CARD.email,
            ...props.resultCard?.email,
          },
          services: {
            ...DEFAULT_RESULT_CARD.services,
            ...props.resultCard?.services,
          },
          primaryCTA: {
            ...DEFAULT_RESULT_CARD.primaryCTA,
            ...props.resultCard?.primaryCTA,
          },
          secondaryCTA: {
            ...DEFAULT_RESULT_CARD.secondaryCTA,
            ...props.resultCard?.secondaryCTA,
          },
          image: {
            ...DEFAULT_RESULT_CARD.image,
            ...props.resultCard?.image,
          },
        },
      };
    },
  },
};
