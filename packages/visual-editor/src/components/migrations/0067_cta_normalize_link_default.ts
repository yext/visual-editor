import { Migration } from "../../utils/migrate.ts";

const applyNormalizeLinkDefault = (value: any) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  return {
    ...value,
    normalizeLink: value.normalizeLink ?? true,
  };
};

const mapLinks = (links: any) =>
  Array.isArray(links) ? links.map(applyNormalizeLinkDefault) : links;

const applyCtaNormalizeLinkDefault = (
  props: { id: string } & Record<string, any>
) => {
  const data = props.data ?? {};

  return {
    ...props,
    data: {
      ...data,
      normalizeLink: data.normalizeLink ?? true,
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
      resultCard: props.resultCard
        ? {
            ...props.resultCard,
            primaryCTA: applyNormalizeLinkDefault(props.resultCard.primaryCTA),
            secondaryCTA: applyNormalizeLinkDefault(
              props.resultCard.secondaryCTA
            ),
          }
        : props.resultCard,
    }),
  },
};
