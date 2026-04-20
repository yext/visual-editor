import type { ComponentProps } from "react";
import { Link as PagesLink } from "@yext/pages-components";
import {
  type ComponentConfig,
  type Fields,
  type PuckComponent,
} from "@puckeditor/core";
import {
  Image,
  type TranslatableAssetImage,
  type TranslatableString,
  resolveComponentData,
  useDocument,
  type YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { type ComplexImageType, type ImageType } from "@yext/pages-components";

const getSafeHref = (href?: string): string => {
  const trimmedHref = href?.trim();
  return trimmedHref ? trimmedHref : "#";
};

type PagesLinkProps = ComponentProps<typeof PagesLink>;

const Link = (props: PagesLinkProps) => {
  const safeProps = { ...props } as any;

  if ("cta" in safeProps && safeProps.cta) {
    safeProps.cta = {
      ...safeProps.cta,
      link: getSafeHref(safeProps.cta.link),
    };
  }

  if ("href" in safeProps) {
    safeProps.href = getSafeHref(safeProps.href);
  }

  return <PagesLink {...safeProps} />;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type SocialLink = {
  platform: "facebook" | "twitter" | "youtube";
  link: string;
};

export type Hs1AlbanyServicesFooterSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoTitle: StyledTextProps;
  socialLinks: SocialLink[];
};

const styledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: {
        types: ["type.string"],
      },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
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
      type: "select" as const,
      options: [
        { label: "Normal", value: "normal" },
        { label: "Uppercase", value: "uppercase" },
        { label: "Lowercase", value: "lowercase" },
        { label: "Capitalize", value: "capitalize" },
      ],
    },
  },
});

const renderIcon = (platform: SocialLink["platform"]) => {
  switch (platform) {
    case "facebook":
      return "f";
    case "twitter":
      return "t";
    case "youtube":
      return "▶";
    default:
      return "";
  }
};

export const Hs1AlbanyServicesFooterSectionFields: Fields<Hs1AlbanyServicesFooterSectionProps> =
  {
    logoImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Logo Image",
      filter: {
        types: ["type.image"],
      },
    }),
    logoTitle: styledTextFields("Logo Title"),
    socialLinks: {
      label: "Social Links",
      type: "array",
      arrayFields: {
        platform: {
          label: "Platform",
          type: "select",
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Twitter", value: "twitter" },
            { label: "Youtube", value: "youtube" },
          ],
        },
        link: { label: "Link", type: "text" },
      },
      defaultItemProps: {
        platform: "facebook",
        link: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
      },
    },
  };

export const Hs1AlbanyServicesFooterSectionComponent: PuckComponent<
  Hs1AlbanyServicesFooterSectionProps
> = ({ logoImage, logoTitle, socialLinks }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoImage = resolveComponentData(
    logoImage,
    locale,
    streamDocument,
  );
  const resolvedLogoTitle =
    resolveComponentData(logoTitle.text, locale, streamDocument) || "";
  const logoTextTransform =
    logoTitle.textTransform === "normal" ? undefined : logoTitle.textTransform;

  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-[1170px] flex-col gap-6 px-6 pb-3 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          {resolvedLogoImage && (
            <div className="w-[120px] shrink-0">
              <Image image={resolvedLogoImage} className="h-full w-full" />
            </div>
          )}
          <p
            className="m-0"
            style={{
              fontFamily: "'Montserrat', 'Open Sans', sans-serif",
              fontSize: `${logoTitle.fontSize}px`,
              color: logoTitle.fontColor,
              fontWeight: logoTitle.fontWeight,
              textTransform: logoTextTransform,
              letterSpacing: "1px",
              lineHeight: 1,
            }}
          >
            {resolvedLogoTitle}
          </p>
        </div>

        <div className="flex items-center gap-4 lg:justify-end">
          {socialLinks.map((item, index) => (
            <Link
              key={`${item.platform}-${index}`}
              href={item.link}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcb65f] text-[22px] font-bold text-white no-underline"
              style={{
                fontFamily:
                  item.platform === "youtube"
                    ? "'Nunito Sans', 'Open Sans', sans-serif"
                    : "'Montserrat', 'Open Sans', sans-serif",
              }}
            >
              {renderIcon(item.platform)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const Hs1AlbanyServicesFooterSection: ComponentConfig<Hs1AlbanyServicesFooterSectionProps> =
  {
    label: "HS1 Albany Services Footer Section",
    fields: Hs1AlbanyServicesFooterSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/120x78_80/webmgr/1o/u/o/brooklyn/sunnysmileslogo.png.webp?60c03c38fcebb177765418932264c8d5",
          width: 120,
          height: 78,
        },
        constantValueEnabled: true,
      },
      logoTitle: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "SUNNY SMILES",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 25,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "uppercase",
      },
      socialLinks: [
        {
          platform: "facebook",
          link: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
        },
        { platform: "twitter", link: "https://twitter.com/InternetMatrix" },
        {
          platform: "youtube",
          link: "https://www.youtube.com/user/webmarketingimatrix",
        },
      ],
    },
    render: Hs1AlbanyServicesFooterSectionComponent,
  };
