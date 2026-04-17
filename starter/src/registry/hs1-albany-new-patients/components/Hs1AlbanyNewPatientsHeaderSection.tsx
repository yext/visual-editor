import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { Link } from "../../shared/SafeLink";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { useState } from "react";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type NavItem = {
  label: string;
  link: string;
};

export type Hs1AlbanyNewPatientsHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoLink: string;
  brandName: StyledTextProps;
  primaryLinks: NavItem[];
  moreLinks: NavItem[];
  patientEducationLinks: NavItem[];
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

const getTextTransformStyle = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const createStyledTextField = (label: string) => ({
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
      options: [...fontWeightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...textTransformOptions],
    },
  },
});

const navItemFields = {
  label: { label: "Label", type: "text" as const },
  link: { label: "Link", type: "text" as const },
};

const formatPhone = (phone: string | undefined) => {
  if (!phone) {
    return "(877) 393-3348";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

const MenuItem = ({
  item,
  className,
}: {
  item: NavItem;
  className: string;
}) => (
  <Link cta={{ link: item.link, linkType: "URL" }} className={className}>
    {item.label}
  </Link>
);

export const Hs1AlbanyNewPatientsHeaderSectionFields: Fields<Hs1AlbanyNewPatientsHeaderSectionProps> =
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
    logoLink: {
      label: "Logo Link",
      type: "text",
    },
    brandName: createStyledTextField("Brand Name"),
    primaryLinks: {
      label: "Primary Links",
      type: "array",
      arrayFields: navItemFields,
      defaultItemProps: {
        label: "Home",
        link: "https://www.ofc-albany.com",
      },
      getItemSummary: (item) => item.label,
    },
    moreLinks: {
      label: "More Links",
      type: "array",
      arrayFields: navItemFields,
      defaultItemProps: {
        label: "Contact Us",
        link: "https://www.ofc-albany.com/contact",
      },
      getItemSummary: (item) => item.label,
    },
    patientEducationLinks: {
      label: "Patient Education Links",
      type: "array",
      arrayFields: navItemFields,
      defaultItemProps: {
        label: "Educational Videos",
        link: "https://www.ofc-albany.com/articles/premium_education/category/47361",
      },
      getItemSummary: (item) => item.label,
    },
  };

export const Hs1AlbanyNewPatientsHeaderSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsHeaderSectionProps
> = ({
  logoImage,
  logoLink,
  brandName,
  primaryLinks,
  moreLinks,
  patientEducationLinks,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPatientEducationOpen, setIsPatientEducationOpen] = useState(false);
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoImage = resolveComponentData(
    logoImage,
    locale,
    streamDocument,
  );
  const resolvedBrandName =
    resolveComponentData(brandName.text, locale, streamDocument) || "";
  const phone = formatPhone(streamDocument.mainPhone);

  return (
    <section className="sticky top-0 z-40 bg-white text-[#4a4a4a] shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="mx-auto hidden max-w-[1170px] grid-cols-[minmax(0,160px)_minmax(0,1fr)_auto] items-center px-[15px] md:grid">
        <div className="py-[10px]">
          <Link
            cta={{ link: logoLink, linkType: "URL" }}
            className="flex items-center gap-3 no-underline"
          >
            {resolvedLogoImage ? (
              <div className="w-[130px]">
                <Image
                  image={resolvedLogoImage}
                  className="h-auto w-full object-contain"
                />
              </div>
            ) : null}
            <span
              className="sr-only"
              style={{
                fontSize: `${brandName.fontSize}px`,
                color: brandName.fontColor,
                fontWeight: brandName.fontWeight,
                textTransform: getTextTransformStyle(brandName.textTransform),
              }}
            >
              {resolvedBrandName}
            </span>
          </Link>
        </div>

        <nav className="flex justify-end py-[20px]">
          <ul className="flex items-center gap-5 font-['Lato','Arial',sans-serif] text-[10px] font-normal uppercase tracking-[0.2px] text-[#4a4a4a] lg:gap-6 lg:text-[11px]">
            {primaryLinks.map((item) => (
              <li key={`${item.label}-${item.link}`}>
                <MenuItem
                  item={item}
                  className="text-[#4a4a4a] no-underline transition-colors hover:text-[#d3a335]"
                />
              </li>
            ))}
            <li className="group relative">
              <button
                type="button"
                className="font-['Lato','Arial',sans-serif] text-[10px] uppercase text-[#4a4a4a] transition-colors hover:text-[#d3a335] lg:text-[11px]"
              >
                More
              </button>
              <div className="invisible absolute right-0 top-full z-20 mt-4 min-w-[240px] border border-[#e6e6e6] bg-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all group-hover:visible group-hover:opacity-100">
                <ul className="py-2">
                  {moreLinks.map((item) => {
                    if (item.label !== "Patient Education") {
                      return (
                        <li key={`${item.label}-${item.link}`}>
                          <MenuItem
                            item={item}
                            className="block px-4 py-2 text-left text-[12px] normal-case text-[#4a4a4a] no-underline transition-colors hover:bg-[#f7f7f7] hover:text-[#d3a335]"
                          />
                        </li>
                      );
                    }

                    return (
                      <li
                        key={`${item.label}-${item.link}`}
                        className="group/patient relative"
                      >
                        <MenuItem
                          item={item}
                          className="block px-4 py-2 text-left text-[12px] normal-case text-[#4a4a4a] no-underline transition-colors hover:bg-[#f7f7f7] hover:text-[#d3a335]"
                        />
                        <div className="invisible absolute left-full top-0 z-20 min-w-[280px] border border-[#e6e6e6] bg-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all group-hover/patient:visible group-hover/patient:opacity-100">
                          <ul className="py-2">
                            {patientEducationLinks.map((subItem) => (
                              <li key={`${subItem.label}-${subItem.link}`}>
                                <MenuItem
                                  item={subItem}
                                  className="block px-4 py-2 text-left text-[12px] normal-case text-[#4a4a4a] no-underline transition-colors hover:bg-[#f7f7f7] hover:text-[#d3a335]"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        <div className="py-[20px] text-right">
          <a
            href={`tel:${phone}`}
            className="font-['Montserrat','Open_Sans',sans-serif] text-[28px] font-medium text-[#d3a335] no-underline"
          >
            {phone}
          </a>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between bg-[#4a4a4a] px-4 py-3 text-white">
          <button
            type="button"
            aria-label="Open menu"
            className="text-2xl leading-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            ≡
          </button>
          <Link
            cta={{ link: logoLink, linkType: "URL" }}
            className="no-underline"
          >
            <span
              style={{
                fontSize: `${brandName.fontSize}px`,
                color: "#ffffff",
                fontWeight: brandName.fontWeight,
                textTransform: getTextTransformStyle(brandName.textTransform),
                fontFamily: "Montserrat, 'Open Sans', sans-serif",
                lineHeight: 1,
              }}
            >
              {resolvedBrandName}
            </span>
          </Link>
          <a
            href={`tel:${phone}`}
            className="text-xl text-[#d3a335] no-underline"
          >
            ☎
          </a>
        </div>

        {isMobileMenuOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="h-full w-[86%] max-w-[420px] overflow-y-auto bg-[#f3f3f3] text-[#4a4a4a] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#d7d7d7] px-5 py-4">
                <span className="font-['Montserrat','Open_Sans',sans-serif] text-sm uppercase tracking-[1px]">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="text-2xl leading-none"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ×
                </button>
              </div>

              <ul className="text-[14px]">
                {[...primaryLinks, ...moreLinks].map((item) => {
                  if (item.label !== "Patient Education") {
                    return (
                      <li
                        key={`${item.label}-${item.link}`}
                        className="border-b border-[#dddddd]"
                      >
                        <MenuItem
                          item={item}
                          className="block px-5 py-3 text-[#4a4a4a] no-underline"
                        />
                      </li>
                    );
                  }

                  return (
                    <li
                      key={`${item.label}-${item.link}`}
                      className="border-b border-[#dddddd]"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-5 py-3 text-left"
                        onClick={() =>
                          setIsPatientEducationOpen(
                            (currentValue) => !currentValue,
                          )
                        }
                      >
                        <span>{item.label}</span>
                        <span>{isPatientEducationOpen ? "−" : "+"}</span>
                      </button>
                      {isPatientEducationOpen ? (
                        <ul className="border-t border-[#dddddd] bg-white py-1">
                          {patientEducationLinks.map((subItem) => (
                            <li key={`${subItem.label}-${subItem.link}`}>
                              <MenuItem
                                item={subItem}
                                className="block px-8 py-2 text-[13px] text-[#4a4a4a] no-underline"
                              />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsHeaderSection: ComponentConfig<Hs1AlbanyNewPatientsHeaderSectionProps> =
  {
    label: "Hs1 Albany New Patients Header Section",
    fields: Hs1AlbanyNewPatientsHeaderSectionFields,
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
      logoLink: "https://www.ofc-albany.com",
      brandName: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Sunny Smiles",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 20,
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
      moreLinks: [
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
        {
          label: "Patient Education",
          link: "https://www.ofc-albany.com/articles/premium_education",
        },
      ],
      patientEducationLinks: [
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
    render: Hs1AlbanyNewPatientsHeaderSectionComponent,
  };
