import { Migration } from "../../utils/migrate.ts";

const isRecord = (value: unknown): value is Record<string, any> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isLocalizedImageShape = (value: Record<string, any>) => {
  return value.hasLocalizedValue === "true" || "defaultValue" in value;
};

const normalizeFooterLogoImage = (image: unknown) => {
  if (!isRecord(image) || !isLocalizedImageShape(image)) {
    return image;
  }

  const { field, constantValue, constantValueEnabled, ...localizedImage } =
    image;

  return {
    field: typeof field === "string" ? field : "",
    constantValue: constantValue ?? localizedImage,
    constantValueEnabled: constantValueEnabled ?? true,
  };
};

type MigrationProps = { id: string } & Record<string, any>;

const normalizeFooterLogoSlotProps = (
  props: MigrationProps
): MigrationProps => {
  const image = props.data?.image;
  const normalizedImage = normalizeFooterLogoImage(image);

  if (normalizedImage === image) {
    return props;
  }

  return {
    ...props,
    data: {
      ...props.data,
      image: normalizedImage,
    },
  };
};

export const normalizeFooterLogoImageMigration: Migration = {
  ExpandedFooter: {
    action: "updated",
    propTransformation: (props) => {
      const logoSlot = props.slots?.LogoSlot;
      if (!Array.isArray(logoSlot)) {
        return props;
      }

      let changed = false;
      const normalizedLogoSlot = logoSlot.map((slot) => {
        if (slot?.type !== "FooterLogoSlot" || !isRecord(slot.props)) {
          return slot;
        }

        const normalizedProps = normalizeFooterLogoSlotProps(slot.props);
        if (normalizedProps === slot.props) {
          return slot;
        }

        changed = true;
        return {
          ...slot,
          props: normalizedProps,
        };
      });

      if (!changed) {
        return props;
      }

      return {
        ...props,
        slots: {
          ...props.slots,
          LogoSlot: normalizedLogoSlot,
        },
      };
    },
  },
  FooterLogoSlot: {
    action: "updated",
    propTransformation: normalizeFooterLogoSlotProps,
  },
};
