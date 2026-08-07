import { Migration } from "../../utils/migrate.ts";

type ImageProps = { id: string } & Record<string, any>;

const addDefaultImageFillType = (props: ImageProps): ImageProps => ({
  ...props,
  styles: {
    ...props.styles,
    imageFillType: props.styles?.imageFillType ?? "fill",
  },
});

export const headerFooterImageFillTypeMigration: Migration = {
  ImageSlot: {
    action: "updated",
    propTransformation: addDefaultImageFillType,
  },
  FooterLogoSlot: {
    action: "updated",
    propTransformation: addDefaultImageFillType,
  },
  FooterUtilityImagesSlot: {
    action: "updated",
    propTransformation: addDefaultImageFillType,
  },
};
