import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type LinkItem = {
  label: string;
  link: string;
};

type SocialItem = {
  label: string;
  link: string;
};

export type Hs1LagunaFooterSectionProps = {
  brandName: string;
  phoneTitle: string;
  phoneNumber: string;
  socialTitle: string;
  socialLinks: SocialItem[];
  actionLinks: LinkItem[];
};

const Hs1LagunaFooterSectionFields: Fields<Hs1LagunaFooterSectionProps> = {
  brandName: { label: "Brand Name", type: "text" },
  phoneTitle: { label: "Phone Title", type: "text" },
  phoneNumber: { label: "Phone Number", type: "text" },
  socialTitle: { label: "Social Title", type: "text" },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Social",
      link: "",
    },
    getItemSummary: (item: SocialItem) => item.label,
  },
  actionLinks: {
    label: "Action Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      label: "Action",
      link: "#",
    },
    getItemSummary: (item: LinkItem) => item.label,
  },
};

export const Hs1LagunaFooterSectionComponent: PuckComponent<
  Hs1LagunaFooterSectionProps
> = ({
  brandName,
  phoneTitle,
  phoneNumber,
  socialTitle,
  socialLinks,
  actionLinks,
}) => {
  return (
    <section>
      <div className="bg-[#755b53] px-[14px] py-6 text-white md:px-0">
        <div className="mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-6 md:flex-row">
          <p className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[21px] font-bold">
            {brandName}
          </p>
          <div className="text-center md:text-right">
            <h2 className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[26px] font-bold leading-none text-white">
              {phoneTitle}
            </h2>
            <Link
              cta={{ link: `tel:${phoneNumber}`, linkType: "PHONE" }}
              className="mt-2 inline-block text-[25px] font-bold text-white no-underline"
            >
              {phoneNumber}
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-black px-[14px] py-6 text-white md:px-0">
        <div className="mx-auto flex max-w-[1140px] flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialLinks.map((link) => (
              <Link
                key={`${link.label}-${link.link}`}
                cta={{ link: link.link || "#", linkType: "URL" }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white text-[12px] font-bold uppercase text-white no-underline"
              >
                {link.label.slice(0, 1)}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-stretch gap-px md:flex-row">
            {actionLinks.map((link) => (
              <Link
                key={`${link.label}-${link.link}`}
                cta={{ link: link.link, linkType: "URL" }}
                className="inline-flex min-w-[220px] items-center justify-center border border-white bg-transparent px-6 py-4 text-[13px] font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-white hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f7eeea] px-[14px] py-8 md:hidden">
        <div className="mx-auto max-w-[1140px] text-center">
          <h2 className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[23px] font-bold text-[#4f4f4f]">
            {socialTitle}
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            {socialLinks.slice(0, 2).map((link) => (
              <Link
                key={`${link.label}-mobile`}
                cta={{ link: link.link || "#", linkType: "URL" }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#755b53] text-[12px] font-bold uppercase text-[#755b53] no-underline"
              >
                {link.label.slice(0, 1)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1LagunaFooterSection: ComponentConfig<Hs1LagunaFooterSectionProps> =
  {
    label: "Sunny Smiles Footer",
    fields: Hs1LagunaFooterSectionFields,
    defaultProps: {
      brandName: "Sunny Smiles Dental",
      phoneTitle: "Call Us Today",
      phoneNumber: "(877) 393-3348",
      socialTitle: "Connect With Us",
      socialLinks: [
        { label: "Facebook", link: "" },
        { label: "Twitter", link: "" },
        { label: "Youtube", link: "" },
      ],
      actionLinks: [
        {
          label: "Location",
          link: "https://www.ofc-laguna.com/office",
        },
        {
          label: "Request Appointment",
          link: "https://www.ofc-laguna.com/appointment-request",
        },
      ],
    },
    render: Hs1LagunaFooterSectionComponent,
  };
