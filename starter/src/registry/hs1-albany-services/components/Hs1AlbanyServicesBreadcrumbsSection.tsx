import type { ComponentProps } from "react";
import { Link as PagesLink } from "@yext/pages-components";
import {
  type ComponentConfig,
  type Fields,
  type PuckComponent,
} from "@puckeditor/core";
import {
  type TranslatableString,
  resolveComponentData,
  useDocument,
  type YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

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

export type Hs1AlbanyServicesBreadcrumbsSectionProps = {
  homeLink: {
    label: string;
    link: string;
  };
  currentLabel: StyledTextProps;
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

export const Hs1AlbanyServicesBreadcrumbsSectionFields: Fields<Hs1AlbanyServicesBreadcrumbsSectionProps> =
  {
    homeLink: {
      label: "Home Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    currentLabel: styledTextFields("Current Label"),
  };

export const Hs1AlbanyServicesBreadcrumbsSectionComponent: PuckComponent<
  Hs1AlbanyServicesBreadcrumbsSectionProps
> = ({ homeLink, currentLabel }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedCurrentLabel =
    resolveComponentData(currentLabel.text, locale, streamDocument) || "";
  const currentTextTransform =
    currentLabel.textTransform === "normal"
      ? undefined
      : currentLabel.textTransform;

  return (
    <section className="bg-[#e5c989]">
      <div className="mx-auto max-w-[1170px] px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={homeLink.link}
            className="text-[13px] font-semibold text-white no-underline hover:underline"
            style={{
              fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
            }}
          >
            {homeLink.label}
          </Link>
          <span
            className="text-[13px] text-white"
            style={{ fontFamily: "'Nunito Sans', 'Open Sans', sans-serif" }}
          >
            /
          </span>
          <span
            style={{
              fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
              fontSize: `${currentLabel.fontSize}px`,
              color: currentLabel.fontColor,
              fontWeight: currentLabel.fontWeight,
              textTransform: currentTextTransform,
            }}
          >
            {resolvedCurrentLabel}
          </span>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyServicesBreadcrumbsSection: ComponentConfig<Hs1AlbanyServicesBreadcrumbsSectionProps> =
  {
    label: "HS1 Albany Services Breadcrumbs Section",
    fields: Hs1AlbanyServicesBreadcrumbsSectionFields,
    defaultProps: {
      homeLink: {
        label: "Home",
        link: "https://www.ofc-albany.com",
      },
      currentLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Services",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 13,
        fontColor: "#ffffff",
        fontWeight: 600,
        textTransform: "normal",
      },
    },
    render: Hs1AlbanyServicesBreadcrumbsSectionComponent,
  };
