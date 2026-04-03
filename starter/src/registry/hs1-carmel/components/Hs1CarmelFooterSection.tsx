import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";
import { Facebook, Instagram, Rss, Twitter, Youtube } from "lucide-react";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
};

type FooterLink = {
  label: string;
  link: string;
  icon: "rss" | "instagram" | "youtube" | "facebook" | "twitter";
};

export type Hs1CarmelFooterSectionProps = {
  backgroundImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoTitle: StyledTextProps;
  socialHeading: StyledTextProps;
  socialSubtitle: StyledTextProps;
  socialLinks: FooterLink[];
};

const createStyledTextField = (label: string) =>
  ({
    label,
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
          { label: "Normal", value: "none" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) satisfies Fields<Hs1CarmelFooterSectionProps>["logoTitle"];

const iconMap = {
  rss: Rss,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  twitter: Twitter,
} satisfies Record<FooterLink["icon"], typeof Rss>;

const Hs1CarmelFooterSectionFields: Fields<Hs1CarmelFooterSectionProps> = {
  backgroundImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Background Image",
    filter: {
      types: ["type.image"],
    },
  }),
  logoImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Logo Image",
    filter: {
      types: ["type.image"],
    },
  }),
  logoTitle: createStyledTextField("Logo Title"),
  socialHeading: createStyledTextField("Social Heading"),
  socialSubtitle: createStyledTextField("Social Subtitle"),
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      icon: {
        label: "Icon",
        type: "select",
        options: [
          { label: "RSS", value: "rss" },
          { label: "Instagram", value: "instagram" },
          { label: "YouTube", value: "youtube" },
          { label: "Facebook", value: "facebook" },
          { label: "Twitter", value: "twitter" },
        ],
      },
    },
    defaultItemProps: {
      label: "Social",
      link: "#",
      icon: "rss",
    },
    getItemSummary: (item: FooterLink) => item.label || "Social",
  },
};

export const Hs1CarmelFooterSectionComponent: PuckComponent<
  Hs1CarmelFooterSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBackground = resolveComponentData(
    props.backgroundImage,
    locale,
    streamDocument,
  );
  const resolvedLogo = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );
  const logoTitle =
    resolveComponentData(props.logoTitle.text, locale, streamDocument) || "";
  const socialHeading =
    resolveComponentData(props.socialHeading.text, locale, streamDocument) ||
    "";
  const socialSubtitle =
    resolveComponentData(props.socialSubtitle.text, locale, streamDocument) ||
    "";

  return (
    <section className="relative isolate overflow-hidden bg-[#04364E] text-white">
      <div className="absolute inset-0">
        {resolvedBackground && (
          <Image
            image={resolvedBackground}
            className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[#041f2d]/80" />
      </div>
      <div className="relative mx-auto grid max-w-[1140px] gap-12 px-4 py-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:px-6">
        <div className="flex items-center justify-center lg:justify-start">
          <div className="max-w-[17rem] text-center lg:text-left">
            {resolvedLogo && (
              <div className="mx-auto w-[12rem] lg:mx-0">
                <Image
                  image={resolvedLogo}
                  className="[&_img]:h-auto [&_img]:w-full [&_img]:object-contain"
                />
              </div>
            )}
            <p
              className="mt-4 font-['Poppins','Open_Sans',sans-serif]"
              style={{
                fontSize: `${props.logoTitle.fontSize}px`,
                color: props.logoTitle.fontColor,
                fontWeight: props.logoTitle.fontWeight,
                textTransform: props.logoTitle.textTransform,
              }}
            >
              {logoTitle}
            </p>
          </div>
        </div>
        <div className="text-center lg:text-right">
          <h3
            className="m-0 font-['Poppins','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.socialHeading.fontSize}px`,
              color: props.socialHeading.fontColor,
              fontWeight: props.socialHeading.fontWeight,
              textTransform: props.socialHeading.textTransform,
            }}
          >
            {socialHeading}
          </h3>
          <p
            className="mt-3 font-['Gothic_A1','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.socialSubtitle.fontSize}px`,
              color: props.socialSubtitle.fontColor,
              fontWeight: props.socialSubtitle.fontWeight,
              textTransform: props.socialSubtitle.textTransform,
            }}
          >
            {socialSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-end">
            {props.socialLinks.map((item) => {
              const Icon = iconMap[item.icon];

              return (
                <Link
                  key={`${item.label}-${item.link}`}
                  cta={{
                    link: item.link,
                    linkType: "URL",
                  }}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#212121] no-underline transition hover:bg-[#c1bcbc]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">{item.label}</span>
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1CarmelFooterSection: ComponentConfig<Hs1CarmelFooterSectionProps> =
  {
    label: "HS1 Carmel Footer Section",
    fields: Hs1CarmelFooterSectionFields,
    defaultProps: {
      backgroundImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/2048x1367_80/webmgr/1s/a/7/Sample-Images/52387318393_008419d7e0_k.jpg.webp?245679b6a08e141b79cd1adb05b548eb",
          width: 2048,
          height: 1367,
        },
        constantValueEnabled: true,
      },
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/250x162_80/webmgr/1s/a/7/whitetoothlandscapelogo.png.webp?1d33287e932278238b61732c96feb9fc",
          width: 250,
          height: 162,
        },
        constantValueEnabled: true,
      },
      logoTitle: {
        text: {
          field: "",
          constantValue: {
            en: "Round Valley Dental Center",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#FFFFFF",
        fontWeight: 700,
        textTransform: "uppercase",
      },
      socialHeading: {
        text: {
          field: "",
          constantValue: {
            en: "Stay Connected",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 26,
        fontColor: "#FFFFFF",
        fontWeight: 700,
        textTransform: "none",
      },
      socialSubtitle: {
        text: {
          field: "",
          constantValue: {
            en: "Follow us today for exclusive promotions",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#FFFFFF",
        fontWeight: 400,
        textTransform: "none",
      },
      socialLinks: [
        {
          label: "blog",
          link: "https://www.blog.com",
          icon: "rss",
        },
        {
          label: "Instagram",
          link: "//instagram.com/",
          icon: "instagram",
        },
        {
          label: "Youtube",
          link: "{SOCM.icon4pagelink}",
          icon: "youtube",
        },
        {
          label: "Facebook",
          link: "{SOCM.icon1pagelink}",
          icon: "facebook",
        },
        {
          label: "Twitter",
          link: "{SOCM.icon2pagelink}",
          icon: "twitter",
        },
      ],
    },
    render: Hs1CarmelFooterSectionComponent,
  };
