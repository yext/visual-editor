import type { ComponentProps } from "react";
import { Link as PagesLink } from "@yext/pages-components";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { useState } from "react";
import {
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  Image,
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

type NavLinkItem = {
  label: string;
  href: string;
};

type MoreMenuProps = {
  label: string;
  href: string;
  links: NavLinkItem[];
  nestedMenuLabel: string;
  nestedMenuHref: string;
  nestedLinks: NavLinkItem[];
};

export type Hs1AlbanyStaffHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoText: StyledTextProps;
  primaryLinks: NavLinkItem[];
  moreMenu: MoreMenuProps;
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

const imageField = (label: string) =>
  YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label,
    filter: {
      types: ["type.image"],
    },
  });

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

const resolveStyledText = (
  textField: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(textField.text, locale, streamDocument) || "";

const Chevron = ({ open = false }: { open?: boolean }) => (
  <span
    className={`inline-block h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-current transition-transform ${open ? "rotate-180" : ""}`}
  />
);

const Hamburger = ({ open }: { open: boolean }) => (
  <span className="relative flex h-6 w-7 flex-col justify-center gap-[5px]">
    <span
      className={`block h-[2px] w-full bg-[#4a4a4a] transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
    />
    <span
      className={`block h-[2px] w-full bg-[#4a4a4a] transition-opacity ${open ? "opacity-0" : ""}`}
    />
    <span
      className={`block h-[2px] w-full bg-[#4a4a4a] transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
    />
  </span>
);

const SubmenuList = ({
  links,
  className = "",
}: {
  links: NavLinkItem[];
  className?: string;
}) => (
  <ul className={`m-0 list-none p-0 ${className}`}>
    {links.map((link) => (
      <li key={`${link.label}-${link.href}`}>
        <Link
          href={link.href}
          className="block whitespace-nowrap px-[18px] py-[10px] text-[15px] font-bold leading-[20px] text-white no-underline [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
        >
          {link.label}
        </Link>
      </li>
    ))}
  </ul>
);

export const Hs1AlbanyStaffHeaderSectionFields: Fields<Hs1AlbanyStaffHeaderSectionProps> =
  {
    logoImage: imageField("Logo Image"),
    logoText: styledTextFields("Logo Text"),
    primaryLinks: {
      label: "Primary Links",
      type: "array",
      defaultItemProps: {
        label: "Link",
        href: "#",
      },
      arrayFields: {
        label: { label: "Label", type: "text" },
        href: { label: "Link", type: "text" },
      },
    },
    moreMenu: {
      label: "More Menu",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        href: { label: "Link", type: "text" },
        links: {
          label: "Links",
          type: "array",
          defaultItemProps: {
            label: "Menu Link",
            href: "#",
          },
          arrayFields: {
            label: { label: "Label", type: "text" },
            href: { label: "Link", type: "text" },
          },
        },
        nestedMenuLabel: { label: "Nested Menu Label", type: "text" },
        nestedMenuHref: { label: "Nested Menu Link", type: "text" },
        nestedLinks: {
          label: "Nested Links",
          type: "array",
          defaultItemProps: {
            label: "Nested Link",
            href: "#",
          },
          arrayFields: {
            label: { label: "Label", type: "text" },
            href: { label: "Link", type: "text" },
          },
        },
      },
    },
  };

export const Hs1AlbanyStaffHeaderSectionComponent: PuckComponent<
  Hs1AlbanyStaffHeaderSectionProps
> = ({ logoImage, logoText, primaryLinks, moreMenu }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileNestedOpen, setMobileNestedOpen] = useState(false);
  const resolvedLogoImage = resolveComponentData(
    logoImage,
    locale,
    streamDocument,
  );
  const resolvedLogoText = resolveStyledText(logoText, locale, streamDocument);
  const mainPhone = streamDocument.mainPhone || "(877) 393-3348";
  const telHref = `tel:${String(mainPhone).replace(/[^\d+]/g, "")}`;

  return (
    <section className="relative z-20 bg-white">
      <div className="mx-auto max-w-[1140px] px-[15px]">
        <div className="flex items-center justify-between gap-4 py-[14px] lg:grid lg:grid-cols-[2fr_7fr_3fr] lg:py-0">
          <Link
            href="https://www.ofc-albany.com"
            className="flex min-w-0 items-center gap-[14px] no-underline"
          >
            <div className="h-[76px] w-[122px] shrink-0 lg:h-[84px] lg:w-[130px]">
              {resolvedLogoImage ? (
                <Image image={resolvedLogoImage} className="h-full w-full" />
              ) : null}
            </div>
            <span
              className="hidden leading-none sm:block"
              style={{
                fontFamily: '"Montserrat", "Open Sans", sans-serif',
                fontSize: `${logoText.fontSize}px`,
                color: logoText.fontColor,
                fontWeight: logoText.fontWeight,
                lineHeight: "28px",
                letterSpacing: "1px",
                textTransform: toCssTextTransform(logoText.textTransform),
              }}
            >
              {resolvedLogoText}
            </span>
          </Link>

          <nav className="hidden items-center justify-center lg:flex">
            <ul className="m-0 flex list-none items-center gap-[2px] p-0">
              {primaryLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="inline-flex px-[11px] py-[11px] text-[15px] font-bold leading-[15px] text-[#4a4a4a] no-underline [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="group relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-[8px] px-[11px] py-[11px] text-[15px] font-bold leading-[15px] text-[#4a4a4a] [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
                >
                  {moreMenu.label}
                  <Chevron />
                </button>
                <div className="absolute right-0 top-full hidden min-w-[260px] bg-[#4f4e4e] shadow-lg group-hover:block group-focus-within:block">
                  <SubmenuList links={moreMenu.links} />
                  <div className="group/nested relative">
                    <Link
                      href={moreMenu.nestedMenuHref}
                      className="flex items-center justify-between whitespace-nowrap px-[18px] py-[10px] text-[15px] font-bold leading-[20px] text-white no-underline [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
                    >
                      {moreMenu.nestedMenuLabel}
                      <span className="text-white">›</span>
                    </Link>
                    <div className="absolute right-full top-0 hidden min-w-[290px] bg-[#4f4e4e] shadow-lg group-hover/nested:block group-focus-within/nested:block">
                      <SubmenuList links={moreMenu.nestedLinks} />
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          <div className="hidden justify-end lg:flex">
            <Link
              href={telHref}
              className="text-right text-[28px] font-medium leading-[36px] text-[#d3a335] no-underline [font-family:'Montserrat','Open_Sans',sans-serif]"
            >
              {mainPhone}
            </Link>
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            <Link
              href={telHref}
              className="text-[18px] font-medium leading-[24px] text-[#d3a335] no-underline [font-family:'Montserrat','Open_Sans',sans-serif]"
            >
              {mainPhone}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="Toggle navigation"
            >
              <Hamburger open={mobileOpen} />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#ececec] bg-white lg:hidden">
          <div className="mx-auto max-w-[1140px] px-[15px] py-[12px]">
            <ul className="m-0 list-none p-0">
              {primaryLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="block px-0 py-[12px] text-[16px] font-bold text-[#4a4a4a] no-underline [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setMobileMoreOpen((value) => !value)}
                  className="flex w-full items-center justify-between px-0 py-[12px] text-left text-[16px] font-bold text-[#4a4a4a] [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
                >
                  {moreMenu.label}
                  <Chevron open={mobileMoreOpen} />
                </button>
                {mobileMoreOpen ? (
                  <div className="bg-[#4f4e4e] px-[16px] py-[8px]">
                    <SubmenuList links={moreMenu.links} className="space-y-0" />
                    <button
                      type="button"
                      onClick={() => setMobileNestedOpen((value) => !value)}
                      className="flex w-full items-center justify-between px-[18px] py-[10px] text-left text-[15px] font-bold leading-[20px] text-white [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
                    >
                      {moreMenu.nestedMenuLabel}
                      <Chevron open={mobileNestedOpen} />
                    </button>
                    {mobileNestedOpen ? (
                      <SubmenuList
                        links={moreMenu.nestedLinks}
                        className="border-t border-white/15 pt-[8px]"
                      />
                    ) : null}
                  </div>
                ) : null}
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export const Hs1AlbanyStaffHeaderSection: ComponentConfig<Hs1AlbanyStaffHeaderSectionProps> =
  {
    label: "HS1 Albany Staff Header Section",
    fields: Hs1AlbanyStaffHeaderSectionFields,
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
      logoText: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Sunny Smiles",
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
        { label: "Home", href: "https://www.ofc-albany.com" },
        { label: "Staff", href: "https://www.ofc-albany.com/staff" },
        { label: "Office", href: "https://www.ofc-albany.com/our-locations" },
        {
          label: "Services",
          href: "https://www.ofc-albany.com/dental-services",
        },
        {
          label: "New Patients",
          href: "https://www.ofc-albany.com/new-patients",
        },
      ],
      moreMenu: {
        label: "More",
        href: "#",
        links: [
          { label: "Contact Us", href: "https://www.ofc-albany.com/contact" },
          {
            label: "Appointment Request",
            href: "https://www.ofc-albany.com/appointment",
          },
          {
            label: "Testimonials",
            href: "https://www.ofc-albany.com/testimonials",
          },
          {
            label: "Smile Gallery",
            href: "https://www.ofc-albany.com/gallery",
          },
          { label: "Blog", href: "https://www.ofc-albany.com/blog" },
        ],
        nestedMenuLabel: "Patient Education",
        nestedMenuHref: "https://www.ofc-albany.com/articles/premium_education",
        nestedLinks: [
          {
            label: "Educational Videos",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47361",
          },
          {
            label: "Cosmetic & General Dentistry",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47362",
          },
          {
            label: "Emergency Care",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47363",
          },
          {
            label: "Endodontics",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47364",
          },
          {
            label: "Implant Dentistry",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47365",
          },
          {
            label: "Oral Health",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47366",
          },
          {
            label: "Oral Hygiene",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47367",
          },
          {
            label: "Oral Surgery",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47368",
          },
          {
            label: "Orthodontics",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47369",
          },
          {
            label: "Pediatric Dentistry",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47370",
          },
          {
            label: "Periodontal Therapy",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47371",
          },
          {
            label: "Technology",
            href: "https://www.ofc-albany.com/articles/premium_education/category/47372",
          },
        ],
      },
    },
    render: Hs1AlbanyStaffHeaderSectionComponent,
  };
