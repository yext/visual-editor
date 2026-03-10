/**
 * Non-authoritative demo starter.
 * Follow rules in `generation-requirements.md`, `text-fields.md`, and `image-fields.md` if this example differs.
 */
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  Image,
} from "@yext/visual-editor";
import { Box, Text } from "@chakra-ui/react";
import { Link, ImageType, ComplexImageType } from "@yext/pages-components";

export type ExampleBannerSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  bannerText: {
    text: YextEntityField<TranslatableString>;
    fontSize: number;
    fontColor: string; // hex color
    fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
  };
  cta: {
    label: string;
    link: string;
  };
};

const ExampleBannerFields: Fields<ExampleBannerSectionProps> = {
  logoImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Logo Image",
    filter: {
      types: ["type.image"],
    },
  }),
  bannerText: {
    label: "Banner",
    type: "object",
    objectFields: {
      text: YextEntityFieldSelector<any, TranslatableString>({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: { label: "Font Size", type: "number" },
      fontColor: { label: "Font Color", type: "text" },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        options: [
          { label: "Thin", value: 100 },
          { label: "Extra Light", value: 200 },
          { label: "Light", value: 300 },
          { label: "Regular", value: 400 },
          { label: "Medium", value: 500 },
          { label: "Semi Bold", value: 600 },
          { label: "Bold", value: 700 },
          { label: "Extra Bold", value: 800 },
          { label: "Black", value: 900 },
        ],
      },
      textTransform: {
        label: "Text Transform",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  },
  cta: {
    label: "Call To Action",
    type: "object",
    objectFields: {
      label: {
        label: "Label",
        type: "text",
      },
      link: { label: "Link", type: "text" },
    },
  },
};

export const ExampleBannerComponent: PuckComponent<
  ExampleBannerSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  // Start image resolution step - do this for each image field
  const resolvedLogoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );
  // stop image resolution step

  // Start text resolution step - do this for each text field
  const resolvedBannerText: string =
    resolveComponentData(props.bannerText.text, locale, streamDocument) || "";
  // End text resolution step

  return (
    <Box bg="#FFFFFF">
      {resolvedLogoImage && <Image image={resolvedLogoImage} />}
      <Box bg="#ffffff28" borderRadius={"16px"}>
        <Text
          fontSize={`${props.bannerText.fontSize}px`}
          color={props.bannerText.fontColor}
          fontWeight={props.bannerText.fontWeight}
          textTransform={props.bannerText.textTransform}
        >
          {resolvedBannerText}
        </Text>
      </Box>
      <Link
        cta={{
          link: props.cta.link,
          linkType: "URL",
        }}
      >
        {props.cta.label}
      </Link>
    </Box>
  );
};

export const ExampleBanner: ComponentConfig<ExampleBannerSectionProps> = {
  label: "Example Banner",
  fields: ExampleBannerFields,
  defaultProps: {
    logoImage: {
      field: "",
      constantValue: {
        url: "https://www.yext.com/wp-content/uploads/2020/11/Yext_Logo_RGB_Blue.svg",
        width: 300,
        height: 72,
      },
      constantValueEnabled: true,
    },
    bannerText: {
      text: {
        field: "",
        constantValue: {
          en: "Banner Text from Input HTML",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      fontColor: "#000000",
      fontSize: 16,
      fontWeight: 400,
      textTransform: "normal",
    },
    cta: {
      label: "Learn More",
      link: "https://www.yext.com/",
    },
  },
  render: ExampleBannerComponent,
};
