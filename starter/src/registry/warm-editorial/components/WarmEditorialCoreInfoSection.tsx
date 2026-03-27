import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { Address, HoursStatus, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type WarmEditorialCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitTitle: StyledTextProps;
  visitCta: {
    label: string;
    link: string;
  };
  callTitle: StyledTextProps;
  emailLink: {
    label: string;
    link: string;
  };
  hoursTitle: StyledTextProps;
  hoursNote: StyledTextProps;
};

const createStyledTextFields = (label: string) =>
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
          { label: "Normal", value: "normal" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) as const;

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const textStyle = (value: StyledTextProps) => ({
  fontFamily: '"Space Grotesk", Arial, sans-serif',
  fontSize: `${value.fontSize}px`,
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  lineHeight: 1.5,
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

const WarmEditorialCoreInfoSectionFields: Fields<WarmEditorialCoreInfoSectionProps> =
  {
    heading: createStyledTextFields("Heading"),
    visitTitle: createStyledTextFields("Visit Title"),
    visitCta: {
      label: "Visit Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    callTitle: createStyledTextFields("Call Title"),
    emailLink: {
      label: "Email Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    hoursTitle: createStyledTextFields("Hours Title"),
    hoursNote: createStyledTextFields("Hours Note"),
  };

export const WarmEditorialCoreInfoSectionComponent: PuckComponent<
  WarmEditorialCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const phone = getPhoneDetails(streamDocument.mainPhone);

  return (
    <section className="w-full bg-[#fffaf3] px-6 py-6">
      <div className="mx-auto max-w-[1024px]">
        <div className="mb-6">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Newsreader", Georgia, serif',
              fontSize: `${props.heading.fontSize}px`,
              lineHeight: 0.98,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
            }}
          >
            {resolveStyledText(props.heading, locale, streamDocument)}
          </h2>
        </div>
        <div className="grid items-start gap-6 pt-2 max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3 className="m-0" style={textStyle(props.visitTitle)}>
              {resolveStyledText(props.visitTitle, locale, streamDocument)}
            </h3>
            {streamDocument.address && (
              <div className='min-w-0 font-["Space_Grotesk","Arial",sans-serif] text-[16px] leading-6 text-[#2b211d] [&_*]:m-0 [&_div]:space-y-0'>
                <Address address={streamDocument.address} />
              </div>
            )}
            <Link
              cta={{
                link: props.visitCta.link,
                linkType: "URL",
              }}
              className="inline-block max-w-full break-words whitespace-normal text-[#a55739] no-underline"
            >
              <span
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontWeight: 500,
                }}
              >
                {props.visitCta.label}
              </span>
            </Link>
          </div>
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3 className="m-0" style={textStyle(props.callTitle)}>
              {resolveStyledText(props.callTitle, locale, streamDocument)}
            </h3>
            {phone.display && phone.href ? (
              <Link
                cta={{
                  link: `tel:${phone.href}`,
                  linkType: "PHONE",
                }}
                className="inline-block max-w-full break-words whitespace-normal text-[#a55739] no-underline"
              >
                <span
                  style={{
                    fontFamily: '"Space Grotesk", Arial, sans-serif',
                  }}
                >
                  {phone.display}
                </span>
              </Link>
            ) : null}
            <Link
              cta={{
                link: props.emailLink.link,
                linkType: props.emailLink.link.startsWith("mailto:")
                  ? "EMAIL"
                  : "URL",
              }}
              className="inline-block max-w-full break-words whitespace-normal text-[#a55739] no-underline"
            >
              <span
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                }}
              >
                {props.emailLink.label}
              </span>
            </Link>
          </div>
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3 className="m-0" style={textStyle(props.hoursTitle)}>
              {resolveStyledText(props.hoursTitle, locale, streamDocument)}
            </h3>
            {streamDocument.hours ? (
              <div className='min-w-0 font-["Space_Grotesk","Arial",sans-serif] text-[16px] leading-6 text-[#2b211d] [&_*]:text-[#2b211d]'>
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
              </div>
            ) : null}
            <p
              className="m-0 min-w-0 break-words"
              style={textStyle(props.hoursNote)}
            >
              {resolveStyledText(props.hoursNote, locale, streamDocument)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WarmEditorialCoreInfoSection: ComponentConfig<WarmEditorialCoreInfoSectionProps> =
  {
    label: "Warm Editorial Core Info Section",
    fields: WarmEditorialCoreInfoSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Core information", 34, "#2b211d", 700),
      visitTitle: createStyledTextDefault("Visit", 16, "#2b211d", 700),
      visitCta: {
        label: "Get directions to this bakehouse",
        link: "#",
      },
      callTitle: createStyledTextDefault("Call", 16, "#2b211d", 700),
      emailLink: {
        label: "hello@northcommonbakehouse.com",
        link: "mailto:hello@northcommonbakehouse.com",
      },
      hoursTitle: createStyledTextDefault("Hours", 16, "#2b211d", 700),
      hoursNote: createStyledTextDefault(
        "Preorders available before pickup windows close",
        16,
        "#2b211d",
        500,
      ),
    },
    render: WarmEditorialCoreInfoSectionComponent,
  };
