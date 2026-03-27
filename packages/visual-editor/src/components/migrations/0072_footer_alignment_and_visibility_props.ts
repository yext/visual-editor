import { Migration } from "../../utils/migrate.ts";

const hasOwn = (obj: object, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const migrateLegacyAlignment = (
  props: { id: string } & Record<string, any>
): { id: string } & Record<string, any> => {
  const legacyAlignment = props.alignment;
  if (legacyAlignment === undefined) {
    return props;
  }

  const restProps = { ...props };
  delete restProps.alignment;

  return {
    ...restProps,
    desktopContentAlignment:
      restProps.desktopContentAlignment ?? legacyAlignment,
    mobileContentAlignment: restProps.mobileContentAlignment ?? legacyAlignment,
  };
};

const migrateSecondaryFooterSlot = (
  props: { id: string } & Record<string, any>
): { id: string } & Record<string, any> => {
  const currentStyles = props.styles ?? {};
  const legacyAlignment =
    currentStyles.linkPosition ?? currentStyles.linksPosition;
  const desktopContentAlignment =
    currentStyles.desktopContentAlignment ?? legacyAlignment;
  const mobileContentAlignment =
    currentStyles.mobileContentAlignment ?? legacyAlignment;

  const rest = { ...currentStyles };
  delete rest.linkPosition;
  delete rest.linksPosition;

  const currentData = props.data;
  const migratedData =
    currentData &&
    typeof currentData === "object" &&
    hasOwn(currentData, "show")
      ? (() => {
          const restData = { ...currentData };
          delete restData.show;
          return restData;
        })()
      : currentData;

  return {
    ...props,
    data: migratedData,
    styles: {
      ...rest,
      ...(desktopContentAlignment !== undefined
        ? { desktopContentAlignment }
        : {}),
      ...(mobileContentAlignment !== undefined
        ? { mobileContentAlignment }
        : {}),
      showLinks: true,
    },
  };
};

const migrateExpandedFooterSecondaryFooterShow = (
  props: { id: string } & Record<string, any>
): { id: string } & Record<string, any> => {
  const secondaryFooterSlot = props.slots?.SecondaryFooterSlot?.[0]?.props;
  const slotShow = secondaryFooterSlot?.data?.show;
  const primaryFooter = props.data?.primaryFooter;
  const primaryFooterStyles = props.styles?.primaryFooter;
  const desktopContentAlignment =
    primaryFooterStyles?.desktopContentAlignment ?? "left";
  const defaultMobileContentAlignment = primaryFooter?.expandedFooter
    ? "center"
    : "left";
  const mobileContentAlignment =
    primaryFooterStyles?.mobileContentAlignment ??
    defaultMobileContentAlignment;

  const migratedPrimaryLinksWrapperSlot = Array.isArray(
    props.slots?.PrimaryLinksWrapperSlot
  )
    ? props.slots.PrimaryLinksWrapperSlot.map((slot: Record<string, any>) => ({
        ...slot,
        props: {
          ...slot.props,
          desktopContentAlignment,
          mobileContentAlignment,
        },
      }))
    : props.slots?.PrimaryLinksWrapperSlot;

  const migratedExpandedLinksWrapperSlot = Array.isArray(
    props.slots?.ExpandedLinksWrapperSlot
  )
    ? props.slots.ExpandedLinksWrapperSlot.map((slot: Record<string, any>) => ({
        ...slot,
        props: {
          ...slot.props,
          desktopContentAlignment,
          mobileContentAlignment,
        },
      }))
    : props.slots?.ExpandedLinksWrapperSlot;

  return {
    ...props,
    data: {
      ...props.data,
      primaryFooter: {
        ...primaryFooter,
        showLogo: primaryFooter?.showLogo ?? true,
        showSocialLinks: primaryFooter?.showSocialLinks ?? true,
        showUtilityImages: primaryFooter?.showUtilityImages ?? true,
      },
      secondaryFooter: {
        ...props.data?.secondaryFooter,
        show: props.data?.secondaryFooter?.show ?? slotShow ?? true,
      },
    },
    styles: {
      ...props.styles,
      primaryFooter: {
        ...primaryFooterStyles,
        desktopContentAlignment,
        mobileContentAlignment,
      },
    },
    slots: {
      ...props.slots,
      PrimaryLinksWrapperSlot: migratedPrimaryLinksWrapperSlot,
      ExpandedLinksWrapperSlot: migratedExpandedLinksWrapperSlot,
    },
  };
};

export const footerAlignmentAndVisibilityPropsMigration: Migration = {
  FooterLinksSlot: {
    action: "updated",
    propTransformation: migrateLegacyAlignment,
  },
  CopyrightMessageSlot: {
    action: "updated",
    propTransformation: migrateLegacyAlignment,
  },
  ExpandedFooter: {
    action: "updated",
    propTransformation: migrateExpandedFooterSecondaryFooterShow,
  },
  SecondaryFooterSlot: {
    action: "updated",
    propTransformation: migrateSecondaryFooterSlot,
  },
};
