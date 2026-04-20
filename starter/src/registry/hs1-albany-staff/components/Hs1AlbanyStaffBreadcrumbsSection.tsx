import type { ComponentProps } from "react";
import { Link as PagesLink } from "@yext/pages-components";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
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

type LinkItem = {
  label: string;
  href: string;
};

export type Hs1AlbanyStaffBreadcrumbsSectionProps = {
  homeLink: LinkItem;
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

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

export const Hs1AlbanyStaffBreadcrumbsSectionFields: Fields<Hs1AlbanyStaffBreadcrumbsSectionProps> =
  {
    homeLink: {
      label: "Home Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        href: { label: "Link", type: "text" },
      },
    },
    currentLabel: styledTextFields("Current Label"),
  };

const resolveStyledText = (
  textField: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(textField.text, locale, streamDocument) || "";

export const Hs1AlbanyStaffBreadcrumbsSectionComponent: PuckComponent<
  Hs1AlbanyStaffBreadcrumbsSectionProps
> = ({ homeLink, currentLabel }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedCurrentLabel = resolveStyledText(
    currentLabel,
    locale,
    streamDocument,
  );

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[#e5c989]" />
      <div className="relative mx-auto flex max-w-[1140px] items-center px-[15px] py-[18px]">
        <div
          className="flex items-center gap-2"
          style={{
            fontFamily:
              '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "13px",
            lineHeight: "19.5px",
            color: "#ffffff",
          }}
        >
          <Link href={homeLink.href} className="text-white no-underline">
            {homeLink.label}
          </Link>
          <span className="text-white">/</span>
          <span
            style={{
              fontSize: `${currentLabel.fontSize}px`,
              color: currentLabel.fontColor,
              fontWeight: currentLabel.fontWeight,
              textTransform: toCssTextTransform(currentLabel.textTransform),
            }}
          >
            {resolvedCurrentLabel}
          </span>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyStaffBreadcrumbsSection: ComponentConfig<Hs1AlbanyStaffBreadcrumbsSectionProps> =
  {
    label: "HS1 Albany Staff Breadcrumbs Section",
    fields: Hs1AlbanyStaffBreadcrumbsSectionFields,
    defaultProps: {
      homeLink: {
        label: "Home",
        href: "https://www.ofc-albany.com",
      },
      currentLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Staff",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 13,
        fontColor: "#ffffff",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    render: Hs1AlbanyStaffBreadcrumbsSectionComponent,
  };
