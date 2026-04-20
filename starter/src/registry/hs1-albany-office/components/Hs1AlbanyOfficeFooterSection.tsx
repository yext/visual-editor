import type { ComponentProps } from "react";
import { Link as PagesLink } from "@yext/pages-components";
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
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import type { IconType } from "react-icons";

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

type LinkItem = {
  label: string;
  link: string;
};

export type Hs1AlbanyOfficeFooterSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  brandName: StyledTextProps;
  socialLinks: LinkItem[];
  legalLinks: LinkItem[];
};

const fontWeightOptions = [
  { label: "Thin", value: 100 },
  { label: "Extra Light", value: 200 },
  { label: "Light", value: 300 },
  { label: "Regular", value: 400 },
  { label: "Medium", value: 500 },
  { label: "Semi Bold", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Extra Bold", value: 800 },
  { label: "Black", value: 900 },
] as const;

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const createStyledTextObjectFields = () => ({
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
    options: [...fontWeightOptions],
  },
  textTransform: {
    label: "Text Transform",
    type: "select" as const,
    options: [...textTransformOptions],
  },
});

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const createLinkItemFields = () => ({
  label: {
    label: "Label",
    type: "text" as const,
  },
  link: {
    label: "Link",
    type: "text" as const,
  },
});

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const socialIconByLabel: Record<string, IconType> = {
  facebook: FaFacebookF,
  twitter: FaTwitter,
  youtube: FaYoutube,
};

const Hs1AlbanyOfficeFooterSectionFields: Fields<Hs1AlbanyOfficeFooterSectionProps> =
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
    brandName: {
      label: "Brand Name",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    socialLinks: {
      label: "Social Links",
      type: "array",
      arrayFields: createLinkItemFields(),
      defaultItemProps: {
        label: "Facebook",
        link: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
      },
    },
    legalLinks: {
      label: "Legal Links",
      type: "array",
      arrayFields: createLinkItemFields(),
      defaultItemProps: {
        label: "Site Map",
        link: "https://www.ofc-albany.com/sitemap",
      },
    },
  };

export const Hs1AlbanyOfficeFooterSectionComponent: PuckComponent<
  Hs1AlbanyOfficeFooterSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale = (streamDocument.locale as string) ?? "en";
  const logoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );
  const brandName = resolveStyledText(props.brandName, locale, streamDocument);

  return (
    <footer className="bg-white font-['Montserrat','Open_Sans',sans-serif]">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-[#efefef] pb-6 lg:flex-row">
          <Link
            href="https://www.ofc-albany.com"
            className="flex items-center gap-3"
          >
            {logoImage ? (
              <div className="h-[78px] w-[120px] shrink-0">
                <Image
                  image={logoImage}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
            <span
              style={{
                fontSize: `${props.brandName.fontSize}px`,
                color: props.brandName.fontColor,
                fontWeight: props.brandName.fontWeight,
                textTransform: cssTextTransform(props.brandName.textTransform),
              }}
            >
              {brandName}
            </span>
          </Link>
          <ul className="flex items-center gap-3">
            {props.socialLinks.map((item) => {
              const Icon =
                socialIconByLabel[item.label.toLowerCase()] ?? FaFacebookF;

              return (
                <li key={`${item.label}-${item.link}`}>
                  <Link
                    href={item.link}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d3a335] text-[#d3a335] transition-colors hover:bg-[#d3a335] hover:text-white"
                  >
                    <Icon className="text-sm" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <ul className="mt-5 flex flex-col items-center justify-center gap-3 text-center text-[10px] uppercase tracking-[0.08em] text-[#d3a335] lg:flex-row">
          {props.legalLinks.map((item) => (
            <li key={`${item.label}-${item.link}`}>
              <Link href={item.link} className="hover:text-[#b88c24]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export const Hs1AlbanyOfficeFooterSection: ComponentConfig<Hs1AlbanyOfficeFooterSectionProps> =
  {
    label: "Hs1 Albany Office Footer Section",
    fields: Hs1AlbanyOfficeFooterSectionFields,
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
      brandName: createStyledTextDefault("Sunny Smiles", 20, "#4a4a4a", 400),
      socialLinks: [
        {
          label: "Facebook",
          link: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
        },
        {
          label: "Twitter",
          link: "https://twitter.com/InternetMatrix",
        },
        {
          label: "Youtube",
          link: "https://www.youtube.com/user/webmarketingimatrix",
        },
      ],
      legalLinks: [
        {
          label: "Copyright © 2026 MH Sub I, LLC dba Officite",
          link: "//www.henryscheinone.com/products/officite",
        },
        {
          label: "Admin Log In",
          link: "https://secure.officite.com",
        },
        {
          label: "Site Map",
          link: "https://www.ofc-albany.com/sitemap",
        },
      ],
    },
    render: Hs1AlbanyOfficeFooterSectionComponent,
  };
