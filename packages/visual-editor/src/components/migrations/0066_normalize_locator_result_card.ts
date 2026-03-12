import { Migration } from "../../utils/migrate.ts";
import { LocatorResultCardProps } from "../LocatorResultCard.tsx";
import {
  getLocatorEntityTypeSourceMap,
  isLocatorEntityType,
} from "../../utils/locatorEntityTypes.ts";

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

export const normalizeLocatorResultCard: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const currentResultCard = props.resultCard;
      if (typeof currentResultCard !== "object") {
        return props;
      }

      // only apply migration if resultCard has legacy shape
      const entityTypeSourceMap = getLocatorEntityTypeSourceMap(streamDocument);
      const entityTypes =
        Object.keys(entityTypeSourceMap).filter(isLocatorEntityType);

      return {
        ...props,
        resultCard: [
          {
            props: {
              ...DEFAULT_LOCATOR_RESULT_CARD_PROPS,
              ...(currentResultCard as Partial<LocatorResultCardProps>),
              entityType: entityTypes[0] ?? DEFAULT_ENTITY_TYPE,
            } as LocatorResultCardProps,
          },
        ],
      };
    },
  },
};
