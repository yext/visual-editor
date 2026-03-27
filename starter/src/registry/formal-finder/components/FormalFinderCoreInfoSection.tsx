import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address, HoursStatus, HoursTable, Link } from "@yext/pages-components";

const SOURCE_SANS_STACK = "'Source Sans 3', 'Open Sans', sans-serif";
const LIBRE_STACK = "'Libre Baskerville', Georgia, serif";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type FormalFinderCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitHeading: StyledTextProps;
  callHeading: StyledTextProps;
  hoursHeading: StyledTextProps;
  directionsLink: {
    label: string;
    link: string;
  };
  emailLink: {
    label: string;
    link: string;
  };
  hoursNote: StyledTextProps;
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

function createStyledTextField(label: string) {
  return {
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
  };
}

function createStyledTextDefault(
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps {
  return {
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
    textTransform,
  };
}

function resolveStyledText(
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) {
  return resolveComponentData(value.text, locale, streamDocument) || "";
}

function toCssTextTransform(value: StyledTextProps["textTransform"]) {
  return value === "normal" ? undefined : value;
}

function getPhoneDetails(value: unknown) {
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
}

const infoHeadingField = createStyledTextField("Info Heading");

const FormalFinderCoreInfoSectionFields: Fields<FormalFinderCoreInfoSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    visitHeading: infoHeadingField,
    callHeading: infoHeadingField,
    hoursHeading: infoHeadingField,
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
    hoursNote: createStyledTextField("Hours Note"),
  };

export const FormalFinderCoreInfoSectionComponent: PuckComponent<
  FormalFinderCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const phone = getPhoneDetails(streamDocument.mainPhone);

  const heading = resolveStyledText(props.heading, locale, streamDocument);
  const visitHeading = resolveStyledText(
    props.visitHeading,
    locale,
    streamDocument,
  );
  const callHeading = resolveStyledText(
    props.callHeading,
    locale,
    streamDocument,
  );
  const hoursHeading = resolveStyledText(
    props.hoursHeading,
    locale,
    streamDocument,
  );
  const hoursNote = resolveStyledText(props.hoursNote, locale, streamDocument);

  const infoHeadingStyle = {
    fontFamily: SOURCE_SANS_STACK,
    fontSize: `${props.visitHeading.fontSize}px`,
    lineHeight: 1.55,
    color: props.visitHeading.fontColor,
    fontWeight: props.visitHeading.fontWeight,
    textTransform: toCssTextTransform(props.visitHeading.textTransform),
  } as const;

  return (
    <section
      className="mx-auto mt-3 mb-[60px] w-full max-w-[1024px] px-6"
      style={{ fontFamily: SOURCE_SANS_STACK }}
    >
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: LIBRE_STACK,
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: toCssTextTransform(props.heading.textTransform),
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="grid items-start gap-6 pt-2 md:grid-cols-3">
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3 className="m-0" style={infoHeadingStyle}>
            {visitHeading}
          </h3>
          {streamDocument.address ? (
            <div className="min-w-0 text-base leading-[1.55] text-[#1a2230] [&_a]:text-inherit [&_div]:leading-[1.55] [&_span]:leading-[1.55]">
              <Address address={streamDocument.address} />
            </div>
          ) : null}
          <Link
            cta={{ link: props.directionsLink.link, linkType: "URL" }}
            className="inline-block max-w-full break-words whitespace-normal text-base text-[#27354a] underline decoration-[#27354a]/40 underline-offset-2"
          >
            {props.directionsLink.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0"
            style={{
              ...infoHeadingStyle,
              fontSize: `${props.callHeading.fontSize}px`,
              color: props.callHeading.fontColor,
              fontWeight: props.callHeading.fontWeight,
              textTransform: toCssTextTransform(
                props.callHeading.textTransform,
              ),
            }}
          >
            {callHeading}
          </h3>
          {phone.display && phone.href ? (
            <Link
              cta={{ link: `tel:${phone.href}`, linkType: "URL" }}
              className="inline-block max-w-full break-words whitespace-normal text-base text-[#27354a] underline decoration-[#27354a]/40 underline-offset-2"
            >
              {phone.display}
            </Link>
          ) : null}
          <Link
            cta={{ link: props.emailLink.link, linkType: "URL" }}
            className="inline-block max-w-full break-words whitespace-normal text-base text-[#27354a] underline decoration-[#27354a]/40 underline-offset-2"
          >
            {props.emailLink.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0"
            style={{
              ...infoHeadingStyle,
              fontSize: `${props.hoursHeading.fontSize}px`,
              color: props.hoursHeading.fontColor,
              fontWeight: props.hoursHeading.fontWeight,
              textTransform: toCssTextTransform(
                props.hoursHeading.textTransform,
              ),
            }}
          >
            {hoursHeading}
          </h3>
          {streamDocument.hours ? (
            <>
              <div className="min-w-0 text-sm text-[#1a2230] [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_td]:px-0 [&_td]:py-0.5 [&_td]:align-top [&_td:first-child]:pr-3 [&_td:first-child]:whitespace-nowrap [&_td:last-child]:break-words [&_td:last-child]:whitespace-normal [&_th]:px-0 [&_th]:py-0.5 [&_tr]:border-0">
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="today"
                  collapseDays={false}
                />
              </div>
              <div className="text-sm font-semibold text-[#6a7381]">
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
              </div>
            </>
          ) : null}
          <p
            className="m-0 min-w-0 break-words"
            style={{
              fontFamily: SOURCE_SANS_STACK,
              fontSize: `${props.hoursNote.fontSize}px`,
              lineHeight: 1.55,
              color: props.hoursNote.fontColor,
              fontWeight: props.hoursNote.fontWeight,
              textTransform: toCssTextTransform(props.hoursNote.textTransform),
            }}
          >
            {hoursNote}
          </p>
        </div>
      </div>
    </section>
  );
};

export const FormalFinderCoreInfoSection: ComponentConfig<FormalFinderCoreInfoSectionProps> =
  {
    label: "Formal Finder Core Info Section",
    fields: FormalFinderCoreInfoSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Core information", 32, "#1a2230", 700),
      visitHeading: createStyledTextDefault("Visit", 17, "#1a2230", 700),
      callHeading: createStyledTextDefault("Call", 17, "#1a2230", 700),
      hoursHeading: createStyledTextDefault("Hours", 17, "#1a2230", 700),
      directionsLink: {
        label: "Get directions to this office",
        link: "#",
      },
      emailLink: {
        label: "hello@harborledgercpa.com",
        link: "mailto:hello@harborledgercpa.com",
      },
      hoursNote: createStyledTextDefault(
        "Tax season appointments available by request",
        16,
        "#1a2230",
        400,
      ),
    },
    render: FormalFinderCoreInfoSectionComponent,
  };
