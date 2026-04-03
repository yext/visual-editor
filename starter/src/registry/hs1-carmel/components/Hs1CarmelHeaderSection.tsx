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
import { ChevronDown, Menu, Phone } from "lucide-react";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
};

type HeaderLink = {
  label: string;
  link: string;
};

export type Hs1CarmelHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logo: HeaderLink;
  logoTitle: StyledTextProps;
  logoCaption: StyledTextProps;
  primaryLinks: HeaderLink[];
  aboutLinks: HeaderLink[];
  contactLinks: HeaderLink[];
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
  }) satisfies Fields<Hs1CarmelHeaderSectionProps>["logoTitle"];

const createLinkArrayField = (label: string) =>
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
    getItemSummary: (item: HeaderLink) => item.label || "Link",
  }) satisfies Fields<Hs1CarmelHeaderSectionProps>["primaryLinks"];

const Hs1CarmelHeaderSectionFields: Fields<Hs1CarmelHeaderSectionProps> = {
  logoImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Logo Image",
    filter: {
      types: ["type.image"],
    },
  }),
  logo: {
    label: "Logo Link",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  logoTitle: createStyledTextField("Logo Title"),
  logoCaption: createStyledTextField("Logo Caption"),
  primaryLinks: createLinkArrayField("Primary Links"),
  aboutLinks: createLinkArrayField("About Links"),
  contactLinks: createLinkArrayField("Contact Links"),
};

const HeaderText = ({
  value,
  config,
  className,
}: {
  value: string;
  config: StyledTextProps;
  className?: string;
}) => (
  <p
    className={className}
    style={{
      fontSize: `${config.fontSize}px`,
      color: config.fontColor,
      fontWeight: config.fontWeight,
      textTransform: config.textTransform,
      fontFamily: "'Poppins', 'Open Sans', sans-serif",
    }}
  >
    {value}
  </p>
);

const renderLink = (link: HeaderLink, className?: string) => (
  <Link
    cta={{
      link: link.link,
      linkType: "URL",
    }}
    className={className}
  >
    {link.label}
  </Link>
);

export const Hs1CarmelHeaderSectionComponent: PuckComponent<
  Hs1CarmelHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );
  const logoTitle =
    resolveComponentData(props.logoTitle.text, locale, streamDocument) || "";
  const logoCaption =
    resolveComponentData(props.logoCaption.text, locale, streamDocument) || "";
  const phoneNumber = streamDocument.mainPhone || "(877) 393-3348";

  return (
    <section className="sticky top-0 z-40 border-b border-white/10 bg-[#04364E] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="mx-auto flex w-full max-w-[1140px] flex-wrap items-center gap-3 px-2 py-4 sm:px-3 lg:flex-nowrap lg:gap-5 lg:px-3">
        <Link
          cta={{
            link: props.logo.link,
            linkType: "URL",
          }}
          className="flex min-w-0 items-center gap-3 no-underline lg:w-[15.75rem] lg:shrink-0"
        >
          <div className="w-[68px] shrink-0 overflow-hidden rounded-md bg-white/10 p-2">
            {resolvedLogoImage && (
              <Image
                image={resolvedLogoImage}
                className="[&_img]:h-auto [&_img]:w-full [&_img]:object-contain"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <HeaderText
              value={logoTitle}
              config={props.logoTitle}
              className="m-0 max-w-full break-words leading-tight tracking-[0.08em]"
            />
            <HeaderText
              value={logoCaption}
              config={props.logoCaption}
              className="m-0 mt-1 max-w-full break-words text-[0.95em] leading-tight"
            />
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <ul className="flex flex-nowrap items-center justify-center gap-5 whitespace-nowrap xl:gap-6">
            {props.primaryLinks.map((link) => {
              const isAbout = link.label === "About";
              const isContact = link.label === "Contact";
              const dropdownLinks = isAbout
                ? props.aboutLinks
                : isContact
                  ? props.contactLinks
                  : [];

              return (
                <li
                  key={`${link.label}-${link.link}`}
                  className="group relative"
                >
                  <div className="flex items-center gap-1">
                    {renderLink(
                      link,
                      "text-[12px] font-medium uppercase tracking-[0.12em] text-white transition hover:text-[#7CB0D3] no-underline",
                    )}
                    {dropdownLinks.length > 0 && (
                      <ChevronDown className="h-4 w-4 text-white/70 transition group-hover:text-[#7CB0D3]" />
                    )}
                  </div>
                  {dropdownLinks.length > 0 && (
                    <div className="invisible absolute left-0 top-full z-10 mt-4 min-w-[220px] rounded-xl border border-white/10 bg-[#032a3d] p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                      <ul className="space-y-2">
                        {dropdownLinks.map((item) => (
                          <li key={`${item.label}-${item.link}`}>
                            {renderLink(
                              item,
                              "block rounded-lg px-3 py-2 text-sm text-white no-underline transition hover:bg-white/10 hover:text-[#7CB0D3]",
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden shrink-0 lg:flex">
          <Link
            cta={{
              link: `tel:${phoneNumber}`,
              linkType: "URL",
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[14px] font-medium text-white no-underline transition hover:border-[#7CB0D3] hover:bg-[#7CB0D3]/20"
          >
            <Phone className="h-4 w-4" />
            <span>{phoneNumber}</span>
          </Link>
        </div>

        <details className="group relative ml-auto lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.14em]">
            <Menu className="h-4 w-4" />
            Menu
          </summary>
          <div className="absolute right-0 top-full mt-3 w-[min(92vw,22rem)] rounded-2xl border border-white/10 bg-[#032a3d] p-4 shadow-xl">
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="m-0 text-xs uppercase tracking-[0.2em] text-white/60">
                Call Us
              </p>
              <Link
                cta={{
                  link: `tel:${phoneNumber}`,
                  linkType: "URL",
                }}
                className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-white no-underline"
              >
                <Phone className="h-4 w-4" />
                <span>{phoneNumber}</span>
              </Link>
            </div>
            <ul className="space-y-2">
              {props.primaryLinks.map((link) => {
                const isAbout = link.label === "About";
                const isContact = link.label === "Contact";
                const dropdownLinks = isAbout
                  ? props.aboutLinks
                  : isContact
                    ? props.contactLinks
                    : [];

                if (dropdownLinks.length === 0) {
                  return (
                    <li key={`${link.label}-${link.link}`}>
                      {renderLink(
                        link,
                        "block rounded-xl px-3 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white no-underline transition hover:bg-white/10",
                      )}
                    </li>
                  );
                }

                return (
                  <li key={`${link.label}-${link.link}`}>
                    <details className="rounded-xl border border-white/10">
                      <summary className="cursor-pointer list-none px-3 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white">
                        {link.label}
                      </summary>
                      <div className="space-y-2 px-3 pb-3">
                        {renderLink(
                          link,
                          "block rounded-lg bg-white/5 px-3 py-2 text-sm text-white no-underline",
                        )}
                        {dropdownLinks.map((item) => (
                          <div key={`${item.label}-${item.link}`}>
                            {renderLink(
                              item,
                              "block rounded-lg px-3 py-2 text-sm text-white/85 no-underline transition hover:bg-white/10",
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          </div>
        </details>
      </div>
    </section>
  );
};

export const Hs1CarmelHeaderSection: ComponentConfig<Hs1CarmelHeaderSectionProps> =
  {
    label: "HS1 Carmel Header Section",
    fields: Hs1CarmelHeaderSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/150x97_80/webmgr/1s/a/7/whitetoothlandscapelogo_20221028_2105.png.webp?7551f5345c2547b3047da04163ae0cfc",
          width: 150,
          height: 97,
        },
        constantValueEnabled: true,
      },
      logo: {
        label: "Round Valley Dental Center",
        link: "https://www.ofc-carmel.com",
      },
      logoTitle: {
        text: {
          field: "",
          constantValue: {
            en: "Round Valley",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#FFFFFF",
        fontWeight: 700,
        textTransform: "uppercase",
      },
      logoCaption: {
        text: {
          field: "",
          constantValue: {
            en: "Dental Center",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 12,
        fontColor: "#FFFFFF",
        fontWeight: 400,
        textTransform: "none",
      },
      primaryLinks: [
        { label: "Home", link: "https://www.ofc-carmel.com" },
        {
          label: "About",
          link: "https://www.ofc-carmel.com/our-locations",
        },
        {
          label: "Office",
          link: "https://www.ofc-carmel.com/our-locations",
        },
        {
          label: "New Patients",
          link: "https://www.ofc-carmel.com/new-patients",
        },
        {
          label: "Dental Services",
          link: "https://www.ofc-carmel.com/dental-services",
        },
        {
          label: "Testimonials",
          link: "https://www.ofc-carmel.com/testimonials",
        },
        {
          label: "Contact",
          link: "https://www.ofc-carmel.com/contact",
        },
        {
          label: "Patient Education",
          link: "https://www.ofc-carmel.com/articles/general",
        },
      ],
      aboutLinks: [
        {
          label: "Dental Staff",
          link: "https://www.ofc-carmel.com/staff",
        },
      ],
      contactLinks: [
        {
          label: "Appointment Request",
          link: "https://www.ofc-carmel.com/appointment",
        },
      ],
    },
    render: Hs1CarmelHeaderSectionComponent,
  };
