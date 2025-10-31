import { useTranslation } from "react-i18next";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  Image,
  msg,
  pt,
  imgSizesHelper,
} from "@yext/visual-editor";
import { updateFields } from "../../pageSections/HeroSection";
import {
  imageDefaultProps,
  ImageWrapperFields,
  ImageWrapperProps,
} from "./Image.tsx";

export interface HeroImageProps extends ImageWrapperProps {
  /** @internal from the parent Hero Section Component */
  variant?: "classic" | "compact" | "immersive" | "spotlight";
}

const HeroImageComponent: PuckComponent<HeroImageProps> = ({
  data,
  styles,
  className,
}: HeroImageProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedImage = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  );

  if (!resolvedImage) {
    return <></>;
  }

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={data.image.field}
      constantValueEnabled={data.image.constantValueEnabled}
      fullHeight={true}
    >
      <Image
        image={resolvedImage}
        aspectRatio={styles.aspectRatio}
        width={undefined}
        className={className || "max-w-full rounded-image-borderRadius w-full"}
        sizes={imgSizesHelper({
          base: "calc(100vw - 32px)",
          md: "calc(maxWidth / 2)",
        })}
      />
    </EntityField>
  );
};

export const HeroImage: ComponentConfig<{ props: HeroImageProps }> = {
  label: msg("components.heroImage", "Hero Image"),
  fields: ImageWrapperFields,
  defaultProps: imageDefaultProps,
  resolveFields: (data) => {
    let fields = ImageWrapperFields;

    switch (data.props.variant ?? "classic") {
      case "compact": {
        fields = updateFields(fields, ["styles.objectFields.width"], undefined);
        // compact should also remove the props removed by classic
      }
      case "classic": {
        fields = updateFields(
          fields,
          ["styles.objectFields.aspectRatio.options"],
          // @ts-expect-error ts(2339) objectFields exists
          fields.styles.objectFields.aspectRatio.options.filter(
            (option: { label: string; value: string }) =>
              !["4:1", "3:1", "2:1", "9:16"].includes(option.label)
          )
        );
        break;
      }
    }
    return fields;
  },
  render: (props) => <HeroImageComponent {...props} />,
};
