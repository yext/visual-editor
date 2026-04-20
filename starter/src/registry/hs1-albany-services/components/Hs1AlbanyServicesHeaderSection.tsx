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

type HeaderLink = {
  label: string;
  link: string;
};

type HeaderDropdownLink = {
  label: string;
  link: string;
  childLinks: HeaderLink[];
};

export type Hs1AlbanyServicesHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoTitle: StyledTextProps;
  primaryLinks: HeaderLink[];
  moreLabel: string;
  moreLinks: HeaderDropdownLink[];
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

const defaultPrimaryLink = {
  label: "Home",
  link: "https://www.ofc-albany.com",
};

const defaultChildLink = {
  label: "Cosmetic & General Dentistry",
  link: "https://www.ofc-albany.com/articles/premium_education/category/47361",
};

const defaultDropdownLink = {
  label: "Contact Us",
  link: "https://www.ofc-albany.com/contact",
  childLinks: [] as HeaderLink[],
};

export const Hs1AlbanyServicesHeaderSectionFields: Fields<Hs1AlbanyServicesHeaderSectionProps> =
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
    primaryLinks: {
      label: "Primary Links",
      type: "array",
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
      defaultItemProps: defaultPrimaryLink,
    },
    moreLabel: { label: "More Label", type: "text" },
    moreLinks: {
      label: "More Links",
      type: "array",
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
        childLinks: {
          label: "Child Links",
          type: "array",
          arrayFields: {
            label: { label: "Label", type: "text" },
            link: { label: "Link", type: "text" },
          },
          defaultItemProps: defaultChildLink,
        },
      },
      defaultItemProps: defaultDropdownLink,
    },
  };

const renderPhone = (phone?: string) => {
  if (!phone) {
    return "(877) 393-3348";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

const renderNavLink = (item: HeaderLink, itemKey: string) => (
  <li key={itemKey} className="relative">
    <Link
      href={item.link}
      className="block px-3 py-2 text-[15px] font-normal text-[#555555] transition-colors duration-150 hover:text-[#d3a335]"
    >
      {item.label}
    </Link>
  </li>
);

export const Hs1AlbanyServicesHeaderSectionComponent: PuckComponent<
  Hs1AlbanyServicesHeaderSectionProps
> = ({ logoImage, logoTitle, primaryLinks, moreLabel, moreLinks }) => {
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
  const displayPhone = renderPhone(streamDocument.mainPhone);
  const phoneHref = displayPhone.replace(/[^\d+]/g, "");

  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-[1170px] flex-col gap-6 px-6 py-[18px] lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-center justify-center lg:w-[330px] lg:justify-start">
          <Link
            href="https://www.ofc-albany.com"
            className="flex items-center gap-4 no-underline"
          >
            {resolvedLogoImage && (
              <div className="w-[124px] shrink-0">
                <Image image={resolvedLogoImage} className="h-full w-full" />
              </div>
            )}
            <p
              className="m-0 max-w-[190px] leading-[0.95]"
              style={{
                fontFamily: "'Montserrat', 'Open Sans', sans-serif",
                fontSize: `${logoTitle.fontSize}px`,
                color: logoTitle.fontColor,
                fontWeight: logoTitle.fontWeight,
                textTransform: logoTextTransform,
                letterSpacing: "1px",
              }}
            >
              {resolvedLogoTitle}
            </p>
          </Link>
        </div>

        <nav className="flex-1">
          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-2 gap-y-1 p-0">
            {primaryLinks.map((item, index) =>
              renderNavLink(item, `${item.label}-${index}`),
            )}
            <li className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 text-[15px] font-normal text-[#555555] transition-colors duration-150 group-hover:text-[#d3a335]"
              >
                <span>{moreLabel}</span>
                <span className="text-[11px]">▼</span>
              </button>
              <div className="left-0 top-full z-20 hidden min-w-[255px] bg-white py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] group-hover:block lg:absolute">
                <ul className="m-0 list-none p-0">
                  {moreLinks.map((item, index) => (
                    <li
                      key={`${item.label}-${index}`}
                      className="group/submenu relative"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={item.link}
                          className="block px-5 py-2 text-[14px] font-normal text-[#555555] transition-colors duration-150 hover:bg-[#f7f7f7] hover:text-[#d3a335]"
                        >
                          {item.label}
                        </Link>
                        {item.childLinks.length > 0 && (
                          <span className="pr-4 text-[11px] text-[#0384d7]">
                            ▶
                          </span>
                        )}
                      </div>
                      {item.childLinks.length > 0 && (
                        <div className="right-0 top-0 hidden min-w-[270px] bg-white py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] lg:absolute lg:translate-x-full group-hover/submenu:block">
                          <ul className="m-0 list-none p-0">
                            {item.childLinks.map((childItem, childIndex) => (
                              <li key={`${childItem.label}-${childIndex}`}>
                                <Link
                                  href={childItem.link}
                                  className="block px-5 py-2 text-[14px] font-normal text-[#555555] transition-colors duration-150 hover:bg-[#f7f7f7] hover:text-[#d3a335]"
                                >
                                  {childItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        <div className="flex justify-center lg:w-[260px] lg:justify-end">
          <Link
            href={`tel:${phoneHref}`}
            className="no-underline"
            style={{
              fontFamily: "'Montserrat', 'Open Sans', sans-serif",
              fontSize: "27px",
              fontWeight: 500,
              color: "#d3a335",
              lineHeight: "1.2",
            }}
          >
            {displayPhone}
          </Link>
        </div>
      </div>
    </header>
  );
};

export const Hs1AlbanyServicesHeaderSection: ComponentConfig<Hs1AlbanyServicesHeaderSectionProps> =
  {
    label: "HS1 Albany Services Header Section",
    fields: Hs1AlbanyServicesHeaderSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/450x292_80/webmgr/1o/u/o/brooklyn/sunnysmileslogo.png.webp?60c03c38fcebb177765418932264c8d5",
          width: 450,
          height: 292,
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
        fontSize: 28,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "uppercase",
      },
      primaryLinks: [
        { label: "Home", link: "https://www.ofc-albany.com" },
        { label: "Staff", link: "https://www.ofc-albany.com/staff" },
        { label: "Office", link: "https://www.ofc-albany.com/our-locations" },
        {
          label: "Services",
          link: "https://www.ofc-albany.com/dental-services",
        },
        {
          label: "New Patients",
          link: "https://www.ofc-albany.com/new-patients",
        },
      ],
      moreLabel: "More",
      moreLinks: [
        {
          label: "Contact Us",
          link: "https://www.ofc-albany.com/contact",
          childLinks: [],
        },
        {
          label: "Appointment Request",
          link: "https://www.ofc-albany.com/appointment",
          childLinks: [],
        },
        {
          label: "Testimonials",
          link: "https://www.ofc-albany.com/testimonials",
          childLinks: [],
        },
        {
          label: "Smile Gallery",
          link: "https://www.ofc-albany.com/gallery",
          childLinks: [],
        },
        {
          label: "Blog",
          link: "https://www.ofc-albany.com/blog",
          childLinks: [],
        },
        {
          label: "Patient Education",
          link: "https://www.ofc-albany.com/articles/premium_education",
          childLinks: [
            {
              label: "Cosmetic & General Dentistry",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47361",
            },
            {
              label: "Emergency Care",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47362",
            },
            {
              label: "Endodontics",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47363",
            },
            {
              label: "Implant Dentistry",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47364",
            },
            {
              label: "Oral Health",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47365",
            },
            {
              label: "Oral Hygiene",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47366",
            },
            {
              label: "Oral Surgery",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47367",
            },
            {
              label: "Orthodontics",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47368",
            },
            {
              label: "Pediatric Dentistry",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47369",
            },
            {
              label: "Periodontal Health",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47370",
            },
            {
              label: "Restorative Dentistry",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47371",
            },
            {
              label: "TMD",
              link: "https://www.ofc-albany.com/articles/premium_education/category/47372",
            },
          ],
        },
      ],
    },
    render: Hs1AlbanyServicesHeaderSectionComponent,
  };
