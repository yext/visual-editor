import { Migration } from "../../utils/migrate.ts";
import { isNonNormalizableLinkType } from "../../utils/normalizeLink.ts";

const applyNormalizeLinkDefault = (value: any) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  const shouldNormalizeByDefault = !isNonNormalizableLinkType(value.linkType);

  return {
    ...value,
    normalizeLink: shouldNormalizeByDefault
      ? (value.normalizeLink ?? true)
      : false,
  };
};

const mapLinks = (links: any) => {
  return Array.isArray(links) ? links.map(applyNormalizeLinkDefault) : links;
};

const normalizeLocatorResultCard = (resultCard: any) => {
  if (Array.isArray(resultCard)) {
    return resultCard.map((item) => ({
      ...item,
      props: item?.props
        ? {
            ...item.props,
            primaryCTA: applyNormalizeLinkDefault(item.props.primaryCTA),
            secondaryCTA: applyNormalizeLinkDefault(item.props.secondaryCTA),
          }
        : item?.props,
    }));
  }

  if (resultCard && typeof resultCard === "object") {
    return {
      ...resultCard,
      primaryCTA: applyNormalizeLinkDefault(resultCard.primaryCTA),
      secondaryCTA: applyNormalizeLinkDefault(resultCard.secondaryCTA),
    };
  }

  return resultCard;
};

const applyCtaNormalizeLinkDefault = (
  props: { id: string } & Record<string, any>
) => {
  const data = props.data ?? {};
  const actionType = data.actionType ?? "link";
  const entityField = data.entityField;
  const constantCta =
    entityField?.constantValueEnabled && entityField?.constantValue
      ? entityField.constantValue
      : undefined;
  const shouldNormalizeByDefault =
    actionType === "button"
      ? false
      : !isNonNormalizableLinkType(constantCta?.linkType);

  return {
    ...props,
    data: {
      ...data,
      normalizeLink: shouldNormalizeByDefault
        ? (data.normalizeLink ?? true)
        : false,
    },
  };
};

export const ctaNormalizeLinkDefault: Migration = {
  CTAWrapper: {
    action: "updated",
    propTransformation: applyCtaNormalizeLinkDefault,
  },
  CTASlot: {
    action: "updated",
    propTransformation: applyCtaNormalizeLinkDefault,
  },
  HeaderLinks: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      data: {
        ...props.data,
        links: mapLinks(props.data?.links),
        collapsedLinks: mapLinks(props.data?.collapsedLinks),
      },
    }),
  },
  FooterLinksSlot: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      data: {
        ...props.data,
        links: mapLinks(props.data?.links),
      },
    }),
  },
  FooterExpandedLinkSectionSlot: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      data: {
        ...props.data,
        links: mapLinks(props.data?.links),
      },
    }),
  },
  FooterExpandedLinksWrapper: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      data: {
        ...props.data,
        sections: Array.isArray(props.data?.sections)
          ? props.data.sections.map((section: any) => ({
              ...section,
              links: mapLinks(section?.links),
            }))
          : props.data?.sections,
      },
    }),
  },
  CTAGroup: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      buttons: Array.isArray(props.buttons)
        ? props.buttons.map((button: any) => applyNormalizeLinkDefault(button))
        : props.buttons,
    }),
  },
  Locator: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      resultCard: normalizeLocatorResultCard(props.resultCard),
    }),
  },
};
