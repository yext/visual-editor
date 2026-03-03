import { Migration } from "../../utils/migrate.ts";
import { LocatorResultCardProps } from "../LocatorResultCard.tsx";

const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_LOCATOR_RESULT_CARD_PROPS: LocatorResultCardProps = {
  entityType: DEFAULT_ENTITY_TYPE,
  primaryHeading: {
    field: { selection: { value: "name" } },
    constantValue: "",
    constantValueEnabled: false,
    headingLevel: 3,
  },
  secondaryHeading: {
    field: { selection: { value: "name" } },
    constantValue: "",
    constantValueEnabled: false,
    variant: "base",
    liveVisibility: false,
  },
  tertiaryHeading: {
    field: { selection: { value: "name" } },
    constantValue: "",
    constantValueEnabled: false,
    variant: "base",
    liveVisibility: false,
  },
  icons: true,
  hours: {
    field: { selection: { value: "hours" } },
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
    field: { selection: { value: "mainPhone" } },
    phoneFormat: "domestic",
    includePhoneHyperlink: true,
    liveVisibility: true,
  },
  email: {
    field: { selection: { value: "emails" } },
    liveVisibility: false,
  },
  services: {
    field: { selection: { value: "services" } },
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
    field: { selection: { value: "headshot" } },
    constantValue: {
      url: "",
      height: 0,
      width: 0,
    },
    constantValueEnabled: false,
    liveVisibility: false,
  },
};

const normalizeResultCardItem = (item: Record<string, any>) => {
  const itemEntityType = item?.props?.entityType ?? DEFAULT_ENTITY_TYPE;
  const rawProps = item?.props ?? item ?? {};

  return {
    props: {
      ...DEFAULT_LOCATOR_RESULT_CARD_PROPS,
      ...rawProps,
      entityType: itemEntityType,
    },
  };
};

export const normalizeLocatorResultCard: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      const currentResultCard = props.resultCard;

      if (Array.isArray(currentResultCard)) {
        return {
          ...props,
          resultCard: currentResultCard.map((item) =>
            normalizeResultCardItem(item)
          ),
        };
      }

      if (
        !currentResultCard ||
        typeof currentResultCard !== "object" ||
        Object.keys(currentResultCard).length === 0
      ) {
        return props;
      }

      return {
        ...props,
        resultCard: [normalizeResultCardItem(currentResultCard)],
      };
    },
  },
};
