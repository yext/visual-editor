import { Migration } from "../../utils/migrate.ts";

type ImageProps = { id: string } & Record<string, any>;

const addDefaultImageFillType = (props: ImageProps): ImageProps => ({
  ...props,
  styles: {
    ...props.styles,
    imageFillType: props.styles?.imageFillType ?? "fill",
  },
});

export const imageFillTypeMigration: Migration = {
  ImageWrapper: {
    action: "updated",
    propTransformation: addDefaultImageFillType,
  },
  HeroImage: {
    action: "updated",
    propTransformation: addDefaultImageFillType,
  },
};
