// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiHeading } from "../atoms/YetiHeading.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiFooterLinksColumnSlotProps {
  data: {
    heading: TranslatableString;
    links: Array<{
      label: TranslatableString;
      href: string;
      openInNewTab: boolean;
    }>;
  };
}

const defaultLink = {
  label: toTranslatableString("Link"),
  href: "#",
  openInNewTab: false,
};

const fields: Fields<YetiFooterLinksColumnSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField("Heading", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      links: YextField("Links", {
        type: "array",
        defaultItemProps: defaultLink,
        arrayFields: {
          label: YextField("Label", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          href: YextField("Href", { type: "text" }),
          openInNewTab: YextField("Open in New Tab", {
            type: "radio",
            options: [
              { label: "No", value: false },
              { label: "Yes", value: true },
            ],
          }),
        },
      }),
    },
  }),
};

const YetiFooterLinksColumnSlotComponent: PuckComponent<
  YetiFooterLinksColumnSlotProps
> = ({ data }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const heading = resolveComponentData(
    data.heading,
    i18n.language,
    streamDocument
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {heading ? <YetiHeading level={4}>{heading}</YetiHeading> : null}
      <ul className="flex flex-col gap-2 text-sm">
        {data.links.map((link, index) => {
          const label = resolveComponentData(
            link?.label,
            i18n.language,
            streamDocument
          );
          if (!label) {
            return null;
          }

          return (
            <li key={`footer-link-${index}`}>
              <a
                href={link.href || "#"}
                target={link.openInNewTab ? "_blank" : undefined}
                rel={link.openInNewTab ? "noreferrer" : undefined}
                className="underline-offset-2 hover:underline"
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const defaultYetiSupportLinksColumnSlotProps: YetiFooterLinksColumnSlotProps =
  {
    data: {
      heading: toTranslatableString("Customer Support"),
      links: [
        {
          label: toTranslatableString("Help"),
          href: "https://www.yeti.com/help-guide.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("FAQ"),
          href: "https://www.yeti.com/faq.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Contact"),
          href: "https://www.yeti.com/contact-us.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Shipping"),
          href: "https://www.yeti.com/shipping-and-returns.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Returns"),
          href: "https://www.yeti.com/returns",
          openInNewTab: false,
        },
      ],
    },
  };

export const defaultYetiCompanyLinksColumnSlotProps: YetiFooterLinksColumnSlotProps =
  {
    data: {
      heading: toTranslatableString("Company"),
      links: [
        {
          label: toTranslatableString("About Us"),
          href: "https://www.yeti.com/stories/our-story.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("News"),
          href: "https://www.yeti.com/news.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Careers"),
          href: "https://www.yeti.com/yeti-careers.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Corporate Sales"),
          href: "https://www.yeti.com/corporate-sales.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Investor Relations"),
          href: "https://investors.yeti.com/overview/default.aspx",
          openInNewTab: true,
        },
      ],
    },
  };

export const defaultYetiStoreLinksColumnSlotProps: YetiFooterLinksColumnSlotProps =
  {
    data: {
      heading: toTranslatableString("Stores"),
      links: [
        {
          label: toTranslatableString("See All Stores"),
          href: "https://www.yeti.com/yeti-store-locations.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Dealer Locator"),
          href: "https://www.yeti.com/find-a-store",
          openInNewTab: false,
        },
      ],
    },
  };

export const defaultYetiComplianceLinksColumnSlotProps: YetiFooterLinksColumnSlotProps =
  {
    data: {
      heading: toTranslatableString("Privacy & Compliance"),
      links: [
        {
          label: toTranslatableString("Privacy Policy"),
          href: "https://www.yeti.com/privacy-policy.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Terms & Conditions"),
          href: "https://www.yeti.com/terms-conditions.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Cookie Policy"),
          href: "https://www.yeti.com/cookie-policy.html",
          openInNewTab: false,
        },
        {
          label: toTranslatableString("Report a Vulnerability"),
          href: "https://www.yeti.com/report-vulnerability.html",
          openInNewTab: false,
        },
      ],
    },
  };

export const YetiFooterLinksColumnSlot: ComponentConfig<{
  props: YetiFooterLinksColumnSlotProps;
}> = {
  label: "Yeti Footer Links Column Slot",
  fields,
  defaultProps: defaultYetiSupportLinksColumnSlotProps,
  render: (props) => <YetiFooterLinksColumnSlotComponent {...props} />,
};
