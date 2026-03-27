import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";
import { Address, HoursTable, Link } from "@yext/pages-components";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type LinkItem = {
  label: string;
  link: string;
};

export type WellnessRetreatCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitHeading: StyledTextProps;
  connectHeading: StyledTextProps;
  hoursHeading: StyledTextProps;
  directionsLink: LinkItem;
  emailLink: LinkItem;
  supportText: StyledTextProps;
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
];

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: textTransformOptions,
    },
  },
});

const resolveTextValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(field, locale, streamDocument) || "";

const getTextStyle = (text: StyledTextProps): CSSProperties => ({
  fontSize: `${text.fontSize}px`,
  color: text.fontColor,
  fontWeight: text.fontWeight,
  textTransform: text.textTransform === "normal" ? "none" : text.textTransform,
});

const getPhoneDetails = (value: unknown) => {
  const phoneText = typeof value === "string" ? value : "";
  const digits = phoneText.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    const nationalDigits = digits.slice(1);
    return {
      display: `(${nationalDigits.slice(0, 3)}) ${nationalDigits.slice(
        3,
        6,
      )}-${nationalDigits.slice(6)}`,
      href: `+${digits}`,
    };
  }

  if (digits.length === 10) {
    return {
      display: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
        6,
      )}`,
      href: `+1${digits}`,
    };
  }

  return {
    display: phoneText,
    href: phoneText.replace(/[^\d+]/g, ""),
  };
};

const WellnessRetreatCoreInfoSectionFields: Fields<WellnessRetreatCoreInfoSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    visitHeading: createStyledTextField("Visit Heading"),
    connectHeading: createStyledTextField("Connect Heading"),
    hoursHeading: createStyledTextField("Hours Heading"),
    directionsLink: {
      label: "Directions Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    emailLink: {
      label: "Email Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    supportText: createStyledTextField("Support Text"),
  };

export const WellnessRetreatCoreInfoSectionComponent: PuckComponent<
  WellnessRetreatCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const resolvedHeading = resolveTextValue(
    props.heading.text,
    locale,
    streamDocument,
  );
  const resolvedVisitHeading = resolveTextValue(
    props.visitHeading.text,
    locale,
    streamDocument,
  );
  const resolvedConnectHeading = resolveTextValue(
    props.connectHeading.text,
    locale,
    streamDocument,
  );
  const resolvedHoursHeading = resolveTextValue(
    props.hoursHeading.text,
    locale,
    streamDocument,
  );
  const resolvedSupportText = resolveTextValue(
    props.supportText.text,
    locale,
    streamDocument,
  );
  const phone = getPhoneDetails(streamDocument.mainPhone);

  return (
    <section className="w-full bg-white py-6">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mb-6">
          <h2
            className="m-0 leading-[0.94] tracking-[-0.03em]"
            style={{
              ...getTextStyle(props.heading),
              fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {resolvedHeading}
          </h2>
        </div>
        <div className="grid items-start gap-6 pt-2 md:grid-cols-[1fr_1fr_1.1fr]">
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3
              className="m-0 font-['Inter',sans-serif] leading-[1.55]"
              style={getTextStyle(props.visitHeading)}
            >
              {resolvedVisitHeading}
            </h3>
            <div className="min-w-0 font-['Inter',sans-serif] text-base leading-[1.55] text-[#101418] not-italic">
              {streamDocument.address ? (
                <Address address={streamDocument.address} />
              ) : null}
            </div>
            <Link
              cta={{ link: props.directionsLink.link, linkType: "URL" }}
              className="inline-block max-w-full break-words whitespace-normal font-['Inter',sans-serif] text-base font-normal text-[#101418] no-underline"
            >
              {props.directionsLink.label}
            </Link>
          </div>
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3
              className="m-0 font-['Inter',sans-serif] leading-[1.55]"
              style={getTextStyle(props.connectHeading)}
            >
              {resolvedConnectHeading}
            </h3>
            {phone.display && phone.href ? (
              <Link
                cta={{
                  link: `tel:${phone.href}`,
                  linkType: "URL",
                }}
                className="inline-block max-w-full break-words whitespace-normal font-['Inter',sans-serif] text-base font-normal text-[#101418] no-underline"
              >
                {phone.display}
              </Link>
            ) : null}
            <Link
              cta={{ link: props.emailLink.link, linkType: "URL" }}
              className="inline-block max-w-full break-words whitespace-normal font-['Inter',sans-serif] text-base font-normal text-[#101418] no-underline"
            >
              {props.emailLink.label}
            </Link>
          </div>
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3
              className="m-0 font-['Inter',sans-serif] leading-[1.55]"
              style={getTextStyle(props.hoursHeading)}
            >
              {resolvedHoursHeading}
            </h3>
            <div className="min-w-0 font-['Inter',sans-serif] text-base leading-[1.55] text-[#101418] [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_td]:px-0 [&_td]:py-0 [&_td]:align-top [&_tr]:align-top [&_td:first-child]:pr-3 [&_td:first-child]:whitespace-nowrap [&_td:last-child]:break-words [&_td:last-child]:whitespace-normal">
              {streamDocument.hours ? (
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="today"
                  collapseDays={true}
                />
              ) : null}
            </div>
            <p
              className="m-0 min-w-0 max-w-[32ch] break-words font-['Inter',sans-serif] leading-[1.55]"
              style={getTextStyle(props.supportText)}
            >
              {resolvedSupportText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WellnessRetreatCoreInfoSection: ComponentConfig<WellnessRetreatCoreInfoSectionProps> =
  {
    label: "Wellness Retreat Core Info Section",
    fields: WellnessRetreatCoreInfoSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Core information",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 38,
        fontColor: "#101418",
        fontWeight: 600,
        textTransform: "normal",
      },
      visitHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Visit",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#101418",
        fontWeight: 700,
        textTransform: "normal",
      },
      connectHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Connect",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#101418",
        fontWeight: 700,
        textTransform: "normal",
      },
      hoursHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Hours",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#101418",
        fontWeight: 700,
        textTransform: "normal",
      },
      directionsLink: {
        label: "Get directions to the studio",
        link: "#",
      },
      emailLink: {
        label: "hello@stillpointstudio.com",
        link: "mailto:hello@stillpointstudio.com",
      },
      supportText: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Front desk support starts 30 minutes before the first class",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5f666d",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    render: WellnessRetreatCoreInfoSectionComponent,
  };
