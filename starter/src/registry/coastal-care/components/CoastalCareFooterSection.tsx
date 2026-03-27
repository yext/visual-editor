import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type LinkProps = {
  label: string;
  link: string;
};

type SocialLinkProps = {
  label: string;
  link: string;
  icon: "instagram" | "facebook";
};

export type CoastalCareFooterSectionProps = {
  brandLink: LinkProps;
  location: StyledTextProps;
  navigationLinks: LinkProps[];
  socialLinks: SocialLinkProps[];
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

const linkFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    label: { label: "Label", type: "text" as const },
    link: { label: "Link", type: "text" as const },
  },
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const CoastalCareFooterSectionFields: Fields<CoastalCareFooterSectionProps> = {
  brandLink: linkFields("Brand Link"),
  location: styledTextFields("Location"),
  navigationLinks: {
    label: "Navigation Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Footer Link",
      link: "#",
    },
    getItemSummary: (item) => item.label || "Footer Link",
  },
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
          { label: "Instagram", value: "instagram" },
          { label: "Facebook", value: "facebook" },
        ],
      },
    },
    defaultItemProps: {
      label: "Social Link",
      link: "#",
      icon: "instagram",
    },
    getItemSummary: (item) => item.label || "Social Link",
  },
};

const SocialIcon = ({ icon }: { icon: SocialLinkProps["icon"] }) => {
  if (icon === "facebook") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.3 0-1.2-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V10H7.8v3h2.7v8h3z" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
};

export const CoastalCareFooterSectionComponent: PuckComponent<
  CoastalCareFooterSectionProps
> = ({ brandLink, location, navigationLinks, socialLinks }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLocation =
    resolveComponentData(location.text, locale, streamDocument) || "";
  const brandInitial = brandLink.label.trim().charAt(0).toUpperCase() || "C";

  return (
    <footer className="mt-6 w-full border-t border-[#d7e3e7] bg-white">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-6 px-6 pb-7 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#2d6f83] font-['Public_Sans','Open_Sans',sans-serif] text-sm font-extrabold text-white">
            {brandInitial}
          </div>
          <div>
            <Link
              cta={{
                link: brandLink.link,
                linkType: "URL",
              }}
              className="font-['Public_Sans','Open_Sans',sans-serif] text-sm font-extrabold text-[#183347] no-underline"
            >
              {brandLink.label}
            </Link>
            <p
              className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
              style={{
                fontSize: `${location.fontSize}px`,
                color: location.fontColor,
                fontWeight: location.fontWeight,
                textTransform: toCssTextTransform(location.textTransform),
              }}
            >
              {resolvedLocation}
            </p>
          </div>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
          {navigationLinks.map((item) => (
            <Link
              key={`${item.label}-${item.link}`}
              cta={{
                link: item.link,
                linkType: "URL",
              }}
              className="inline-flex min-h-[44px] items-center font-['Public_Sans','Open_Sans',sans-serif] text-sm text-[#183347] no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-3" aria-label="Social media links">
          {socialLinks.map((item) => (
            <Link
              key={`${item.label}-${item.icon}`}
              cta={{
                link: item.link,
                linkType: "URL",
              }}
              aria-label={item.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e3e7] text-[#2d6f83] no-underline"
            >
              <SocialIcon icon={item.icon} />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const CoastalCareFooterSection: ComponentConfig<CoastalCareFooterSectionProps> =
  {
    label: "Coastal Care Footer Section",
    fields: CoastalCareFooterSectionFields,
    defaultProps: {
      brandLink: {
        label: "Harbor Animal Clinic",
        link: "#",
      },
      location: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Newport, RI",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#5f7684",
        fontWeight: 400,
        textTransform: "normal",
      },
      navigationLinks: [
        {
          label: "Services",
          link: "#",
        },
        {
          label: "New clients",
          link: "#",
        },
        {
          label: "Contact",
          link: "#",
        },
      ],
      socialLinks: [
        {
          label: "Instagram",
          link: "#",
          icon: "instagram",
        },
        {
          label: "Facebook",
          link: "#",
          icon: "facebook",
        },
      ],
    },
    render: CoastalCareFooterSectionComponent,
  };
