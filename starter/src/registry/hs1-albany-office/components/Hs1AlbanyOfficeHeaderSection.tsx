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

export type Hs1AlbanyOfficeHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  brandName: StyledTextProps;
  moreLabel: StyledTextProps;
  primaryLinks: LinkItem[];
  secondaryLinks: LinkItem[];
  educationParentLink: LinkItem;
  educationLinks: LinkItem[];
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

const renderStyledText = (
  value: StyledTextProps,
  text: string,
  className?: string,
) => (
  <span
    className={className}
    style={{
      fontSize: `${value.fontSize}px`,
      color: value.fontColor,
      fontWeight: value.fontWeight,
      textTransform: cssTextTransform(value.textTransform),
    }}
  >
    {text}
  </span>
);

const HeaderLink = ({
  item,
  className,
}: {
  item: LinkItem;
  className?: string;
}) => (
  <Link href={item.link} className={className}>
    {item.label}
  </Link>
);

const Hs1AlbanyOfficeHeaderSectionFields: Fields<Hs1AlbanyOfficeHeaderSectionProps> =
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
    moreLabel: {
      label: "More Label",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    primaryLinks: {
      label: "Primary Links",
      type: "array",
      arrayFields: createLinkItemFields(),
      defaultItemProps: {
        label: "Home",
        link: "https://www.ofc-albany.com",
      },
    },
    secondaryLinks: {
      label: "Secondary Links",
      type: "array",
      arrayFields: createLinkItemFields(),
      defaultItemProps: {
        label: "Contact Us",
        link: "https://www.ofc-albany.com/contact",
      },
    },
    educationParentLink: {
      label: "Education Parent Link",
      type: "object",
      objectFields: createLinkItemFields(),
    },
    educationLinks: {
      label: "Education Links",
      type: "array",
      arrayFields: createLinkItemFields(),
      defaultItemProps: {
        label: "Educational Videos",
        link: "https://www.ofc-albany.com/articles/premium_education/category/47361",
      },
    },
  };

export const Hs1AlbanyOfficeHeaderSectionComponent: PuckComponent<
  Hs1AlbanyOfficeHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale = (streamDocument.locale as string) ?? "en";
  const logoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );
  const brandName = resolveStyledText(props.brandName, locale, streamDocument);
  const moreLabel = resolveStyledText(props.moreLabel, locale, streamDocument);
  const mainPhone = String(streamDocument.mainPhone ?? "");

  return (
    <header className="sticky top-0 z-40 bg-white font-['Montserrat','Open_Sans',sans-serif]">
      <div className="border-b border-[#efefef] lg:block">
        <div className="mx-auto hidden max-w-[1200px] items-center gap-8 px-6 lg:flex">
          <Link
            href="https://www.ofc-albany.com"
            className="flex min-w-[180px] items-center gap-3 py-[10px]"
          >
            {logoImage ? (
              <div className="h-[62px] w-[95px] shrink-0">
                <Image
                  image={logoImage}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
            {renderStyledText(props.brandName, brandName, "leading-none")}
          </Link>
          <nav className="flex min-w-0 flex-1 items-center justify-center">
            <ul className="flex items-center gap-5 text-[11px] font-medium uppercase tracking-[0.08em] text-black">
              {props.primaryLinks.map((item) => (
                <li key={`${item.label}-${item.link}`}>
                  <HeaderLink
                    item={item}
                    className="transition-colors hover:text-[#d3a335]"
                  />
                </li>
              ))}
              <li className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 uppercase transition-colors hover:text-[#d3a335]"
                >
                  {renderStyledText(props.moreLabel, moreLabel)}
                  <span className="text-[10px]">▾</span>
                </button>
                <div className="invisible absolute right-0 top-full z-20 mt-5 w-[320px] border border-[#e8e2d6] bg-white p-5 opacity-0 shadow-[0_18px_48px_rgba(0,0,0,0.12)] transition-all group-hover:visible group-hover:opacity-100">
                  <ul className="space-y-3 border-b border-[#eee4cf] pb-4 text-[12px] uppercase tracking-[0.08em] text-[#4a4a4a]">
                    {props.secondaryLinks.map((item) => (
                      <li key={`${item.label}-${item.link}`}>
                        <HeaderLink
                          item={item}
                          className="transition-colors hover:text-[#d3a335]"
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <HeaderLink
                      item={props.educationParentLink}
                      className="text-[12px] uppercase tracking-[0.08em] text-[#4a4a4a] transition-colors hover:text-[#d3a335]"
                    />
                    <ul className="mt-3 space-y-2 text-[11px] tracking-[0.06em] text-[#6d6d6d]">
                      {props.educationLinks.map((item) => (
                        <li key={`${item.label}-${item.link}`}>
                          <HeaderLink
                            item={item}
                            className="transition-colors hover:text-[#d3a335]"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
          <div className="py-5 text-right">
            <Link
              cta={{
                link: mainPhone,
                linkType: "PHONE",
              }}
              className="text-[28px] font-medium leading-none text-[#d3a335]"
            >
              {mainPhone}
            </Link>
          </div>
        </div>
        <details className="group bg-black text-white lg:hidden">
          <summary className="mx-auto flex max-w-[1200px] list-none items-center justify-between px-4 py-3">
            <span className="text-xl">☰</span>
            <Link
              href="https://www.ofc-albany.com"
              className="flex items-center gap-2 text-center"
            >
              {logoImage ? (
                <div className="h-[38px] w-[58px] shrink-0">
                  <Image
                    image={logoImage}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : null}
              {renderStyledText(props.brandName, brandName)}
            </Link>
            <Link
              cta={{
                link: mainPhone,
                linkType: "PHONE",
              }}
              className="text-lg text-[#d3a335]"
            >
              ☎
            </Link>
          </summary>
          <div className="border-t border-white/10 px-4 pb-5 pt-3">
            <ul className="space-y-3 text-sm uppercase tracking-[0.08em]">
              {props.primaryLinks.map((item) => (
                <li key={`${item.label}-${item.link}-mobile`}>
                  <HeaderLink item={item} className="block py-1" />
                </li>
              ))}
              {props.secondaryLinks.map((item) => (
                <li key={`${item.label}-${item.link}-secondary-mobile`}>
                  <HeaderLink item={item} className="block py-1" />
                </li>
              ))}
              <li className="border-t border-white/10 pt-3">
                <HeaderLink
                  item={props.educationParentLink}
                  className="block py-1"
                />
                <ul className="mt-2 space-y-2 pl-3 text-[12px] text-white/75">
                  {props.educationLinks.map((item) => (
                    <li key={`${item.label}-${item.link}-education-mobile`}>
                      <HeaderLink item={item} className="block py-1" />
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </header>
  );
};

export const Hs1AlbanyOfficeHeaderSection: ComponentConfig<Hs1AlbanyOfficeHeaderSectionProps> =
  {
    label: "Hs1 Albany Office Header Section",
    fields: Hs1AlbanyOfficeHeaderSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/450x292_80/webmgr/1o/u/o/brooklyn/sunnysmileslogo.png.webp?60c03c38fcebb177765418932264c8d5",
          width: 120,
          height: 78,
        },
        constantValueEnabled: true,
      },
      brandName: createStyledTextDefault("Sunny Smiles", 20, "#4a4a4a", 400),
      moreLabel: createStyledTextDefault(
        "More",
        11,
        "#000000",
        500,
        "uppercase",
      ),
      primaryLinks: [
        { label: "Home", link: "https://www.ofc-albany.com" },
        { label: "Staff", link: "https://www.ofc-albany.com/staff" },
        {
          label: "Office",
          link: "https://www.ofc-albany.com/our-locations",
        },
        {
          label: "Services",
          link: "https://www.ofc-albany.com/dental-services",
        },
        {
          label: "New Patients",
          link: "https://www.ofc-albany.com/new-patients",
        },
      ],
      secondaryLinks: [
        { label: "Contact Us", link: "https://www.ofc-albany.com/contact" },
        {
          label: "Appointment Request",
          link: "https://www.ofc-albany.com/appointment",
        },
        {
          label: "Testimonials",
          link: "https://www.ofc-albany.com/testimonials",
        },
        { label: "Smile Gallery", link: "https://www.ofc-albany.com/gallery" },
        { label: "Blog", link: "https://www.ofc-albany.com/blog" },
      ],
      educationParentLink: {
        label: "Patient Education",
        link: "https://www.ofc-albany.com/articles/premium_education",
      },
      educationLinks: [
        {
          label: "Educational Videos",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47361",
        },
        {
          label: "Cosmetic & General Dentistry",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47362",
        },
        {
          label: "Emergency Care",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47363",
        },
        {
          label: "Endodontics",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47364",
        },
        {
          label: "Implant Dentistry",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47365",
        },
        {
          label: "Oral Health",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47366",
        },
        {
          label: "Oral Hygiene",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47367",
        },
        {
          label: "Oral Surgery",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47368",
        },
        {
          label: "Orthodontics",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47369",
        },
        {
          label: "Pediatric Dentistry",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47370",
        },
        {
          label: "Periodontal Therapy",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47371",
        },
        {
          label: "Technology",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47372",
        },
      ],
    },
    render: Hs1AlbanyOfficeHeaderSectionComponent,
  };
