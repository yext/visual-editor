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

type LinkItem = {
  label: string;
  link: string;
};

type NestedLinkGroup = {
  label: string;
  link: string;
  items: LinkItem[];
};

export type Hs1AlbanyHeaderSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logo: LinkItem;
  primaryLinks: LinkItem[];
  moreTrigger: LinkItem;
  moreLinks: LinkItem[];
  patientEducation: NestedLinkGroup;
};

const linkFields = {
  label: { label: "Label", type: "text" as const },
  link: { label: "Link", type: "text" as const },
};

const Hs1AlbanyHeaderSectionFields: Fields<Hs1AlbanyHeaderSectionProps> = {
  logoImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Logo Image",
    filter: { types: ["type.image"] },
  }),
  logo: {
    label: "Logo",
    type: "object",
    objectFields: linkFields,
  },
  primaryLinks: {
    label: "Primary Links",
    type: "array",
    arrayFields: linkFields,
    defaultItemProps: { label: "Link", link: "#" },
    getItemSummary: (item) => item.label,
  },
  moreTrigger: {
    label: "More Trigger",
    type: "object",
    objectFields: linkFields,
  },
  moreLinks: {
    label: "More Links",
    type: "array",
    arrayFields: linkFields,
    defaultItemProps: { label: "Link", link: "#" },
    getItemSummary: (item) => item.label,
  },
  patientEducation: {
    label: "Patient Education",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      items: {
        label: "Items",
        type: "array",
        arrayFields: linkFields,
        defaultItemProps: { label: "Link", link: "#" },
        getItemSummary: (item) => item.label,
      },
    },
  },
};

export const Hs1AlbanyHeaderSectionComponent: PuckComponent<
  Hs1AlbanyHeaderSectionProps
> = (props) => {
  const streamDocument = useDocument() as { locale?: string };
  const locale = streamDocument.locale ?? "en";
  const logoImage = resolveComponentData(
    props.logoImage,
    locale,
    streamDocument,
  );
  const phone = "(877) 393-3348";

  return (
    <section className="bg-white px-6 py-3">
      <div className="mx-auto grid max-w-[1170px] items-center gap-5 md:grid-cols-[minmax(170px,2fr)_minmax(0,7fr)_minmax(220px,3fr)]">
        <Link
          cta={{ link: props.logo.link, linkType: "URL" }}
          className="flex items-center gap-3 no-underline"
        >
          {logoImage ? (
            <div className="w-[92px] [&_img]:h-auto [&_img]:w-full">
              <Image image={logoImage} />
            </div>
          ) : null}
          <span
            className="text-[11px] uppercase tracking-[0.18em] text-[#7f7f7f]"
            style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
          >
            {props.logo.label}
          </span>
        </Link>
        <nav>
          <ul
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center"
            style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
          >
            {props.primaryLinks.map((item) => (
              <li key={`${item.label}-${item.link}`}>
                <Link
                  cta={{ link: item.link, linkType: "URL" }}
                  className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6f6f6f] no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="group relative">
              <Link
                cta={{ link: props.moreTrigger.link, linkType: "URL" }}
                className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6f6f6f] no-underline"
              >
                {props.moreTrigger.label}
              </Link>
              <div className="invisible absolute left-0 top-full z-20 mt-2 w-64 bg-white p-4 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.15)] transition-all group-hover:visible group-hover:opacity-100">
                <div className="flex flex-col">
                  {props.moreLinks.map((item) => (
                    <Link
                      key={`${item.label}-${item.link}`}
                      cta={{ link: item.link, linkType: "URL" }}
                      className="py-2 text-sm font-semibold uppercase tracking-[0.06em] text-[#4f4e4e] no-underline"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="group/patient relative">
                    <Link
                      cta={{
                        link: props.patientEducation.link,
                        linkType: "URL",
                      }}
                      className="py-2 text-sm font-semibold uppercase tracking-[0.06em] text-[#4f4e4e] no-underline"
                    >
                      {props.patientEducation.label}
                    </Link>
                    <div className="invisible absolute left-full top-0 ml-3 w-72 bg-white p-4 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.15)] transition-all group-hover/patient:visible group-hover/patient:opacity-100">
                      {props.patientEducation.items.map((item) => (
                        <Link
                          key={`${item.label}-${item.link}`}
                          cta={{ link: item.link, linkType: "URL" }}
                          className="block py-2 text-[13px] font-medium uppercase tracking-[0.05em] text-[#4f4e4e] no-underline"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>
        <Link
          cta={{ link: `tel:${phone}`, linkType: "URL" }}
          className="justify-self-center text-[28px] font-medium text-[#d3a335] no-underline md:justify-self-end"
          style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
        >
          {phone}
        </Link>
      </div>
    </section>
  );
};

export const Hs1AlbanyHeaderSection: ComponentConfig<Hs1AlbanyHeaderSectionProps> =
  {
    label: "HS1 Albany Header Section",
    fields: Hs1AlbanyHeaderSectionFields,
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
      logo: { label: "Sunny Smiles", link: "https://www.ofc-albany.com" },
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
      moreTrigger: { label: "More", link: "#" },
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
      ],
      patientEducation: {
        label: "Patient Education",
        link: "https://www.ofc-albany.com/articles/premium_education",
        items: [
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
    },
    render: Hs1AlbanyHeaderSectionComponent,
  };
