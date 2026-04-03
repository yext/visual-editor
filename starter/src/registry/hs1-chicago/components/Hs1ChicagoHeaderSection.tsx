import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";

type NavigationLink = {
  label: string;
  link: string;
};

type SocialLink = {
  label: string;
  link: string;
  symbol: string;
};

export type Hs1ChicagoHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoLink: string;
  phoneCta: {
    label: string;
    link: string;
  };
  socialLinks: SocialLink[];
  navigationLinks: NavigationLink[];
  educationMenu: {
    label: string;
    link: string;
    subLinks: NavigationLink[];
  };
};

const navigationLinkFields = {
  label: { label: "Label", type: "text" },
  link: { label: "Link", type: "text" },
} satisfies Fields<NavigationLink>;

const Hs1ChicagoHeaderSectionFields: Fields<Hs1ChicagoHeaderSectionProps> = {
  logoImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Logo Image",
    filter: {
      types: ["type.image"],
    },
  }),
  logoLink: { label: "Logo Link", type: "text" },
  phoneCta: {
    label: "Phone Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      symbol: { label: "Symbol", type: "text" },
    },
    defaultItemProps: {
      label: "Youtube",
      link: "",
      symbol: "Y",
    },
    getItemSummary: (item) => item.label,
  },
  navigationLinks: {
    label: "Navigation Links",
    type: "array",
    arrayFields: navigationLinkFields,
    defaultItemProps: {
      label: "Home",
      link: "https://www.ofc-chicago.com",
    },
    getItemSummary: (item) => item.label,
  },
  educationMenu: {
    label: "Education Menu",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      subLinks: {
        label: "Sub Links",
        type: "array",
        arrayFields: navigationLinkFields,
        defaultItemProps: {
          label: "Educational Videos",
          link: "https://www.ofc-chicago.com/articles/premium_education/category/47361",
        },
        getItemSummary: (item) => item.label,
      },
    },
  },
};

export const Hs1ChicagoHeaderSectionComponent: PuckComponent<
  Hs1ChicagoHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const hasLink = (value?: string) => Boolean(value && value.trim());

  const resolvedLogoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );

  return (
    <header className="bg-white">
      <div className="border-b border-[#acaba9] px-6 max-md:px-4">
        <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-3 py-2 max-md:flex-col max-md:items-start">
          {hasLink(props.phoneCta.link) ? (
            <Link
              cta={{
                link: props.phoneCta.link,
                linkType: "URL",
              }}
            >
              <span
                className="text-[13px] leading-5 text-black"
                style={{
                  fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                }}
              >
                {props.phoneCta.label}
              </span>
            </Link>
          ) : (
            <span
              className="text-[13px] leading-5 text-black"
              style={{
                fontFamily: "'Hind', Arial, Helvetica, sans-serif",
              }}
            >
              {props.phoneCta.label}
            </span>
          )}
          <ul className="flex items-center gap-3">
            {props.socialLinks.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                {hasLink(item.link) ? (
                  <Link
                    cta={{
                      link: item.link,
                      linkType: "URL",
                    }}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center border border-[#815955] bg-[#dd8b83] text-[10px] text-white"
                      style={{
                        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                        fontFamily: "'Oswald', Verdana, sans-serif",
                      }}
                      aria-label={item.label}
                    >
                      {item.symbol}
                    </span>
                  </Link>
                ) : (
                  <span
                    className="flex h-6 w-6 items-center justify-center border border-[#815955] bg-[#dd8b83] text-[10px] text-white"
                    style={{
                      clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                      fontFamily: "'Oswald', Verdana, sans-serif",
                    }}
                    aria-label={item.label}
                  >
                    {item.symbol}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-b border-[#acaba9] bg-white">
        <div className="mx-auto max-w-[1140px] px-5">
          <ul
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 py-4 text-center max-md:justify-start"
            style={{
              fontFamily: "'Oswald', Verdana, sans-serif",
            }}
          >
            {props.navigationLinks.slice(0, 8).map((item, index) => (
              <li key={`${item.label}-${index}`}>
                {hasLink(item.link) ? (
                  <Link
                    cta={{
                      link: item.link,
                      linkType: "URL",
                    }}
                  >
                    <span className="text-[13px] uppercase tracking-[0.12em] text-[#3f3a39] transition-colors duration-150 hover:text-[#815955]">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <span className="text-[13px] uppercase tracking-[0.12em] text-[#3f3a39] transition-colors duration-150 hover:text-[#815955]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
            <li className="group relative">
              {hasLink(props.educationMenu.link) ? (
                <Link
                  cta={{
                    link: props.educationMenu.link,
                    linkType: "URL",
                  }}
                >
                  <span className="text-[13px] uppercase tracking-[0.12em] text-[#3f3a39] transition-colors duration-150 hover:text-[#815955]">
                    {props.educationMenu.label}
                  </span>
                </Link>
              ) : (
                <span className="text-[13px] uppercase tracking-[0.12em] text-[#3f3a39] transition-colors duration-150 hover:text-[#815955]">
                  {props.educationMenu.label}
                </span>
              )}
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-[min(100vw-48px,1140px)] -translate-x-1/2 bg-[#815955] opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 max-md:hidden">
                <ul className="py-2">
                  {props.educationMenu.subLinks.map((item, index) => (
                    <li
                      key={`${item.label}-${index}`}
                      className="border-t border-white/30 first:border-t-0"
                    >
                      {hasLink(item.link) ? (
                        <Link
                          cta={{
                            link: item.link,
                            linkType: "URL",
                          }}
                        >
                          <span
                            className="block px-5 py-2 text-left text-[14px] leading-[22px] text-white transition-colors duration-150 hover:bg-white hover:text-[#815955]"
                            style={{
                              fontFamily:
                                "'Hind', Arial, Helvetica, sans-serif",
                            }}
                          >
                            {item.label}
                          </span>
                        </Link>
                      ) : (
                        <span
                          className="block px-5 py-2 text-left text-[14px] leading-[22px] text-white transition-colors duration-150 hover:bg-white hover:text-[#815955]"
                          style={{
                            fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            {props.navigationLinks.slice(8).map((item, index) => (
              <li key={`${item.label}-${index}`}>
                {hasLink(item.link) ? (
                  <Link
                    cta={{
                      link: item.link,
                      linkType: "URL",
                    }}
                  >
                    <span className="text-[13px] uppercase tracking-[0.12em] text-[#3f3a39] transition-colors duration-150 hover:text-[#815955]">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <span className="text-[13px] uppercase tracking-[0.12em] text-[#3f3a39] transition-colors duration-150 hover:text-[#815955]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="px-4 py-[34px] pb-[33px] text-center max-md:py-7">
        <div className="mx-auto max-w-[1140px]">
          {resolvedLogoImage &&
            (hasLink(props.logoLink) ? (
              <Link
                cta={{
                  link: props.logoLink,
                  linkType: "URL",
                }}
              >
                <span className="inline-flex max-w-[350px] items-center justify-center">
                  <Image image={resolvedLogoImage} />
                </span>
              </Link>
            ) : (
              <span className="inline-flex max-w-[350px] items-center justify-center">
                <Image image={resolvedLogoImage} />
              </span>
            ))}
        </div>
      </div>
    </header>
  );
};

export const Hs1ChicagoHeaderSection: ComponentConfig<Hs1ChicagoHeaderSectionProps> =
  {
    label: "HS1 Chicago Header Section",
    fields: Hs1ChicagoHeaderSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/350x204_80/webmgr/1o/q/x/northsidedentallogo.png.webp?9767ec738ac88e2dc881cf48d0b128d5",
          width: 350,
          height: 204,
        },
        constantValueEnabled: true,
      },
      logoLink: "https://www.ofc-chicago.com",
      phoneCta: {
        label: "(877) 393-3348",
        link: "tel:(877) 393-3348",
      },
      socialLinks: [
        {
          label: "Youtube",
          link: "",
          symbol: "Y",
        },
        {
          label: "Facebook",
          link: "",
          symbol: "F",
        },
        {
          label: "Twitter",
          link: "",
          symbol: "T",
        },
      ],
      navigationLinks: [
        {
          label: "Home",
          link: "https://www.ofc-chicago.com",
        },
        {
          label: "Staff",
          link: "https://www.ofc-chicago.com/staff",
        },
        {
          label: "Office",
          link: "https://www.ofc-chicago.com/our-locations",
        },
        {
          label: "Services",
          link: "https://www.ofc-chicago.com/dental-services",
        },
        {
          label: "New Patients",
          link: "https://www.ofc-chicago.com/new-patients",
        },
        {
          label: "Contact Us",
          link: "https://www.ofc-chicago.com/contact",
        },
        {
          label: "Appointment Request",
          link: "https://www.ofc-chicago.com/appointment",
        },
        {
          label: "Testimonials",
          link: "https://www.ofc-chicago.com/testimonials",
        },
        {
          label: "Test Videos",
          link: "https://www.ofc-chicago.com/test-videos",
        },
      ],
      educationMenu: {
        label: "Patient Education",
        link: "https://www.ofc-chicago.com/articles/premium_education",
        subLinks: [
          {
            label: "Educational Videos",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47361",
          },
          {
            label: "Cosmetic & General Dentistry",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47362",
          },
          {
            label: "Emergency Care",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47363",
          },
          {
            label: "Endodontics",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47364",
          },
          {
            label: "Implant Dentistry",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47365",
          },
          {
            label: "Oral Health",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47366",
          },
          {
            label: "Oral Hygiene",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47367",
          },
          {
            label: "Oral Surgery",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47368",
          },
          {
            label: "Orthodontics",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47369",
          },
          {
            label: "Pediatric Dentistry",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47370",
          },
          {
            label: "Periodontal Therapy",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47371",
          },
          {
            label: "Technology",
            link: "https://www.ofc-chicago.com/articles/premium_education/category/47372",
          },
        ],
      },
    },
    render: Hs1ChicagoHeaderSectionComponent,
  };
