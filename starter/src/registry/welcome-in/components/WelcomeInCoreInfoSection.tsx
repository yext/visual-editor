import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address, HoursTable, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type NoteItem = {
  text: StyledTextProps;
};

export type WelcomeInCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitHeading: StyledTextProps;
  callHeading: StyledTextProps;
  hoursHeading: StyledTextProps;
  notesHeading: StyledTextProps;
  directionsCta: {
    label: string;
    link: string;
  };
  emailCta: {
    label: string;
    link: string;
  };
  notes: NoteItem[];
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

const createStyledTextField = (label: string): any => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select",
      options: textTransformOptions,
    },
  },
});

const defaultStyledText = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
) => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true" as const,
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

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

const WelcomeInCoreInfoSectionFields: Fields<WelcomeInCoreInfoSectionProps> = {
  heading: createStyledTextField("Heading"),
  visitHeading: createStyledTextField("Visit Heading"),
  callHeading: createStyledTextField("Call Heading"),
  hoursHeading: createStyledTextField("Hours Heading"),
  notesHeading: createStyledTextField("Good To Know Heading"),
  directionsCta: {
    label: "Directions Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  emailCta: {
    label: "Email Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  notes: {
    label: "Notes",
    type: "array",
    arrayFields: {
      text: createStyledTextField("Text"),
    },
    defaultItemProps: {
      text: defaultStyledText("Good to know item", 16, "#24324d", 400),
    },
    getItemSummary: (item: NoteItem) =>
      (item as any)?.text?.text?.constantValue?.defaultValue || "Note",
  },
};

export const WelcomeInCoreInfoSectionComponent: PuckComponent<
  WelcomeInCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
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
  const phone = getPhoneDetails(streamDocument.mainPhone);
  const notesHeading = resolveStyledText(
    props.notesHeading,
    locale,
    streamDocument,
  );

  return (
    <section className="w-full bg-[#fffdfb] py-3">
      <div className="mx-auto w-full max-w-[1024px] px-6">
        <div className="mb-6 text-center">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Baloo 2", "Trebuchet MS", sans-serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="grid items-start gap-6 pt-2 md:grid-cols-2 xl:grid-cols-4">
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3
              className="m-0"
              style={{
                fontFamily:
                  '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                fontSize: `${props.visitHeading.fontSize}px`,
                color: props.visitHeading.fontColor,
                fontWeight: props.visitHeading.fontWeight,
                textTransform: toCssTextTransform(
                  props.visitHeading.textTransform,
                ),
              }}
            >
              {visitHeading}
            </h3>
            {streamDocument.address ? (
              <div className="grid min-w-0 gap-1 text-[16px] text-[#24324d] [&_*]:not-italic [&_div]:grid [&_div]:gap-1 [&_p]:m-0 [&_span]:block">
                <Address address={streamDocument.address} />
              </div>
            ) : null}
            <Link
              cta={{
                link: props.directionsCta.link,
                linkType: "URL",
              }}
              className="inline-block max-w-full break-words whitespace-normal text-[16px] text-[#db5d7d]"
            >
              {props.directionsCta.label}
            </Link>
          </div>
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3
              className="m-0"
              style={{
                fontFamily:
                  '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
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
                cta={{
                  link: `tel:${phone.href}`,
                  linkType: "URL",
                }}
                className="inline-block max-w-full break-words whitespace-normal text-[16px] text-[#db5d7d]"
              >
                {phone.display}
              </Link>
            ) : null}
            <Link
              cta={{
                link: props.emailCta.link,
                linkType: "URL",
              }}
              className="inline-block max-w-full break-words whitespace-normal text-[16px] text-[#db5d7d]"
            >
              {props.emailCta.label}
            </Link>
          </div>
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3
              className="m-0"
              style={{
                fontFamily:
                  '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
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
              <div className="min-w-0 w-fit max-w-full overflow-x-auto overflow-y-hidden text-[16px] text-[#24324d] [&_table]:w-max [&_table]:border-collapse [&_tbody]:align-top [&_td]:px-0 [&_td]:py-1 [&_td]:align-top [&_td:first-child]:pr-3 [&_td:first-child]:whitespace-nowrap [&_td:last-child]:break-words [&_td:last-child]:whitespace-normal [&_td:last-child]:text-right">
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="today"
                  collapseDays={false}
                />
              </div>
            ) : null}
          </div>
          <div className="grid min-w-0 content-start gap-3 self-start">
            <h3
              className="m-0"
              style={{
                fontFamily:
                  '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                fontSize: `${props.notesHeading.fontSize}px`,
                color: props.notesHeading.fontColor,
                fontWeight: props.notesHeading.fontWeight,
                textTransform: toCssTextTransform(
                  props.notesHeading.textTransform,
                ),
              }}
            >
              {notesHeading}
            </h3>
            {props.notes.map((note, index) => {
              const noteText = resolveStyledText(
                note.text,
                locale,
                streamDocument,
              );

              return (
                <p
                  key={`${noteText}-${index}`}
                  className="m-0 min-w-0 break-words"
                  style={{
                    fontFamily:
                      '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                    fontSize: `${note.text.fontSize}px`,
                    color: note.text.fontColor,
                    fontWeight: note.text.fontWeight,
                    textTransform: toCssTextTransform(note.text.textTransform),
                    lineHeight: 1.55,
                  }}
                >
                  {noteText}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const WelcomeInCoreInfoSection: ComponentConfig<WelcomeInCoreInfoSectionProps> =
  {
    label: "Welcome In Core Info Section",
    fields: WelcomeInCoreInfoSectionFields,
    defaultProps: {
      heading: defaultStyledText("Core information", 35, "#24324d", 800),
      visitHeading: defaultStyledText("Visit", 17, "#24324d", 800),
      callHeading: defaultStyledText("Call", 17, "#24324d", 800),
      hoursHeading: defaultStyledText("Hours", 17, "#24324d", 800),
      notesHeading: defaultStyledText("Good to know", 17, "#24324d", 800),
      directionsCta: {
        label: "Get directions to the shop",
        link: "#",
      },
      emailCta: {
        label: "hello@juniperstoryhouse.com",
        link: "mailto:hello@juniperstoryhouse.com",
      },
      notes: [
        {
          text: defaultStyledText("Weekly storytime", 16, "#24324d", 400),
        },
        {
          text: defaultStyledText("Gift wrap at checkout", 16, "#24324d", 400),
        },
        {
          text: defaultStyledText(
            "Teacher discount available",
            16,
            "#24324d",
            400,
          ),
        },
      ],
    },
    render: WelcomeInCoreInfoSectionComponent,
  };
