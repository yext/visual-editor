import { useState } from "react";
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

export type Hs1LagunaHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoTitle: StyledTextProps;
  logoDescription: StyledTextProps;
  menuLabel: StyledTextProps;
  homeLink: LinkItem;
  offerCta: LinkItem;
  primaryLinks: LinkItem[];
  patientEducationLink: LinkItem;
  patientEducationLinks: LinkItem[];
};

const styledTextFields = (label: string) =>
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
          { label: "Normal", value: "normal" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) satisfies Fields<{ value: StyledTextProps }>["value"];

const linkArrayField = (label: string) =>
  ({
    label,
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Link",
      link: "#",
    },
    getItemSummary: (item: LinkItem) => item.label,
  }) satisfies Fields<{ value: LinkItem[] }>["value"];

const linkObjectFields = {
  label: { label: "Label", type: "text" },
  link: { label: "Link", type: "text" },
} satisfies Fields<LinkItem>;

const Hs1LagunaHeaderSectionFields: Fields<Hs1LagunaHeaderSectionProps> = {
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
  logoDescription: styledTextFields("Logo Description"),
  menuLabel: styledTextFields("Menu Label"),
  homeLink: {
    label: "Home Link",
    type: "object",
    objectFields: linkObjectFields,
  },
  offerCta: {
    label: "Offer Call To Action",
    type: "object",
    objectFields: linkObjectFields,
  },
  primaryLinks: linkArrayField("Primary Links"),
  patientEducationLink: {
    label: "Patient Education Link",
    type: "object",
    objectFields: linkObjectFields,
  },
  patientEducationLinks: linkArrayField("Patient Education Links"),
};

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

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
      textTransform:
        value.textTransform === "normal" ? undefined : value.textTransform,
      fontFamily: "Roboto, Arial, Helvetica, sans-serif",
    }}
  >
    {text}
  </span>
);

export const Hs1LagunaHeaderSectionComponent: PuckComponent<
  Hs1LagunaHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale =
    typeof streamDocument.locale === "string" ? streamDocument.locale : "en";
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const resolvedLogoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );
  const logoTitle = resolveStyledText(props.logoTitle, locale, streamDocument);
  const logoDescription = resolveStyledText(
    props.logoDescription,
    locale,
    streamDocument,
  );
  const menuLabel = resolveStyledText(props.menuLabel, locale, streamDocument);
  const mainPhone =
    typeof streamDocument.mainPhone === "string"
      ? streamDocument.mainPhone
      : "(877) 393-3348";

  return (
    <section className="relative z-40 h-0">
      <div className="absolute left-0 right-0 top-0 z-50 border-b border-[#4f4f4f] bg-white/95">
        <div className="mx-auto flex min-h-[50px] max-w-[1440px] items-center justify-between px-[14px] md:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[#4f4f4f]"
          >
            <span
              aria-hidden="true"
              className="text-[26px] leading-none text-[#4f4f4f]"
            >
              ≡
            </span>
            {renderStyledText(props.menuLabel, menuLabel, "leading-none")}
          </button>

          <div className="hidden items-center gap-3 md:flex">
            {props.offerCta.link ? (
              <Link
                cta={{ link: props.offerCta.link, linkType: "URL" }}
                className="rounded-none border border-[#ac5745] bg-[#ac5745] px-5 py-2 text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8f4638]"
              >
                {props.offerCta.label}
              </Link>
            ) : (
              <span className="rounded-none border border-[#ac5745] bg-[#ac5745] px-5 py-2 text-[13px] font-bold uppercase tracking-[0.08em] text-white">
                {props.offerCta.label}
              </span>
            )}

            <Link
              cta={{ link: `tel:${mainPhone}`, linkType: "PHONE" }}
              className="font-['Roboto',Arial,Helvetica,sans-serif] text-[20px] font-bold leading-none text-black md:text-[25px]"
            >
              {mainPhone}
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[38px] z-40 w-[220px] -translate-x-1/2 md:w-[240px]">
        <div className="pointer-events-auto flex justify-center">
          <Link
            cta={{ link: props.homeLink.link, linkType: "URL" }}
            className="flex flex-col items-center text-center no-underline"
          >
            {resolvedLogoImage ? (
              <div className="mb-[7px] flex justify-center">
                <Image image={resolvedLogoImage} className="h-auto w-[98px]" />
              </div>
            ) : null}
            <div className="flex flex-col items-center">
              {renderStyledText(
                props.logoTitle,
                logoTitle,
                "m-0 leading-[1.12] text-white",
              )}
              {renderStyledText(
                props.logoDescription,
                logoDescription,
                "m-0 mt-[3px] leading-[1.125] text-white",
              )}
            </div>
          </Link>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] flex bg-black/35">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="min-w-0 flex-1 border-0 bg-transparent p-0"
          />
          <div className="h-full w-[80vw] max-w-[320px] overflow-y-auto bg-[#f3f3f3] shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
              <span className="text-sm text-black/40">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="border-0 bg-transparent px-2 py-1 text-black/40"
              >
                ×
              </button>
            </div>

            <nav className="px-0 py-5">
              <ul className="m-0 list-none p-0">
                {props.primaryLinks.map((item) => (
                  <li
                    key={`${item.label}-${item.link}`}
                    className="border-b border-black/10"
                  >
                    <Link
                      cta={{ link: item.link, linkType: "URL" }}
                      className="block px-5 py-3 text-[14px] leading-5 text-black/70 no-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                <li className="border-b border-black/10">
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => setSubmenuOpen((open) => !open)}
                      className="w-[50px] border-0 border-r border-black/10 bg-transparent text-black/40"
                    >
                      {submenuOpen ? "−" : "+"}
                    </button>
                    <Link
                      cta={{
                        link: props.patientEducationLink.link,
                        linkType: "URL",
                      }}
                      className="flex-1 px-5 py-3 text-[14px] leading-5 text-black/70 no-underline"
                    >
                      {props.patientEducationLink.label}
                    </Link>
                  </div>

                  {submenuOpen ? (
                    <ul className="m-0 list-none bg-black/5 p-0">
                      {props.patientEducationLinks.map((item) => (
                        <li
                          key={`${item.label}-${item.link}`}
                          className="border-t border-black/10"
                        >
                          <Link
                            cta={{ link: item.link, linkType: "URL" }}
                            className="block px-5 py-3 text-[14px] leading-5 text-black/70 no-underline"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export const Hs1LagunaHeaderSection: ComponentConfig<Hs1LagunaHeaderSectionProps> =
  {
    label: "Sunny Smiles Header",
    fields: Hs1LagunaHeaderSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/98x100_80/webmgr/1o/s/5/whitetoothlogo1.png.webp?3888a828772d97a4896e13f9cbd10ce2",
          width: 98,
          height: 100,
        },
        constantValueEnabled: true,
      },
      logoTitle: {
        text: {
          field: "",
          constantValue: {
            en: "Sunny Smiles",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 25,
        fontColor: "#ffffff",
        fontWeight: 700,
        textTransform: "normal",
      },
      logoDescription: {
        text: {
          field: "",
          constantValue: {
            en: "Dental",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#ffffff",
        fontWeight: 700,
        textTransform: "normal",
      },
      menuLabel: {
        text: {
          field: "",
          constantValue: {
            en: "Menu",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 15,
        fontColor: "#4f4f4f",
        fontWeight: 700,
        textTransform: "uppercase",
      },
      homeLink: {
        label: "Home",
        link: "https://www.ofc-laguna.com",
      },
      offerCta: {
        label: "Exclusive Offer",
        link: "",
      },
      primaryLinks: [
        { label: "Home", link: "https://www.ofc-laguna.com" },
        { label: "Staff", link: "https://www.ofc-laguna.com/staff" },
        { label: "Office", link: "https://www.ofc-laguna.com/our-locations" },
        {
          label: "Services",
          link: "https://www.ofc-laguna.com/dental-services",
        },
        {
          label: "New Patients",
          link: "https://www.ofc-laguna.com/new-patients",
        },
        { label: "Contact Us", link: "https://www.ofc-laguna.com/contact" },
        {
          label: "Appointment Request",
          link: "https://www.ofc-laguna.com/appointment",
        },
        {
          label: "Testimonials",
          link: "https://www.ofc-laguna.com/testimonials",
        },
        { label: "Smile Gallery", link: "https://www.ofc-laguna.com/gallery" },
        { label: "Blog", link: "https://www.ofc-laguna.com/blog" },
      ],
      patientEducationLink: {
        label: "Patient Education",
        link: "https://www.ofc-laguna.com/articles/premium_education",
      },
      patientEducationLinks: [
        {
          label: "Educational Videos",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47361",
        },
        {
          label: "Cosmetic & General Dentistry",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47362",
        },
        {
          label: "Emergency Care",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47363",
        },
        {
          label: "Endodontics",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47364",
        },
        {
          label: "Implant Dentistry",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47365",
        },
        {
          label: "Oral Health",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47366",
        },
        {
          label: "Oral Hygiene",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47367",
        },
        {
          label: "Oral Surgery",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47368",
        },
        {
          label: "Orthodontics",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47369",
        },
        {
          label: "Pediatric Dentistry",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47370",
        },
        {
          label: "Periodontal Therapy",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47371",
        },
        {
          label: "Technology",
          link: "https://www.ofc-laguna.com/articles/premium_education/category/47372",
        },
      ],
    },
    render: Hs1LagunaHeaderSectionComponent,
  };
