import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { Address, HoursStatus, HoursTable, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

type TextItemProps = {
  copy: StyledTextProps;
};

export type HereForYouCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitHeading: StyledTextProps;
  directionsCta: {
    label: string;
    link: string;
  };
  callHeading: StyledTextProps;
  emailCta: {
    label: string;
    link: string;
  };
  hoursHeading: StyledTextProps;
  focusHeading: StyledTextProps;
  focusItems: TextItemProps[];
};

const createStyledTextFields = (): Fields<StyledTextProps> => ({
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
});

const createStyledTextDefault = (
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

const HereForYouCoreInfoSectionFields: Fields<HereForYouCoreInfoSectionProps> =
  {
    heading: {
      label: "Heading",
      type: "object",
      objectFields: createStyledTextFields(),
    },
    visitHeading: {
      label: "Visit Heading",
      type: "object",
      objectFields: createStyledTextFields(),
    },
    directionsCta: {
      label: "Directions Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    callHeading: {
      label: "Call Heading",
      type: "object",
      objectFields: createStyledTextFields(),
    },
    emailCta: {
      label: "Email Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    hoursHeading: {
      label: "Hours Heading",
      type: "object",
      objectFields: createStyledTextFields(),
    },
    focusHeading: {
      label: "Focus Heading",
      type: "object",
      objectFields: createStyledTextFields(),
    },
    focusItems: {
      label: "Focus Items",
      type: "array",
      arrayFields: {
        copy: {
          label: "Copy",
          type: "object",
          objectFields: createStyledTextFields(),
        },
      },
      defaultItemProps: {
        copy: createStyledTextDefault("Focus area", 16, "#203446", 400),
      },
      getItemSummary: (item: any) =>
        item.copy?.text?.constantValue?.defaultValue || "Focus Item",
    },
  };

export const HereForYouCoreInfoSectionComponent: PuckComponent<
  HereForYouCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, any>;
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: YextEntityField<TranslatableString>) =>
    resolveComponentData(value, locale, streamDocument) || "";
  const phone = getPhoneDetails(streamDocument.mainPhone);

  return (
    <section
      aria-labelledby="here-for-you-core-info-title"
      className="mx-auto my-3 w-full max-w-[1024px] px-6"
    >
      <div className="mb-6">
        <h2
          id="here-for-you-core-info-title"
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: `${props.heading.fontSize}px`,
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: toCssTextTransform(props.heading.textTransform),
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
          }}
          className="m-0"
        >
          {resolveText(props.heading.text)}
        </h2>
      </div>
      <div className="grid grid-cols-4 items-start gap-6 pt-2 max-[900px]:grid-cols-1">
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.visitHeading.fontSize}px`,
              color: props.visitHeading.fontColor,
              fontWeight: props.visitHeading.fontWeight,
              textTransform: toCssTextTransform(
                props.visitHeading.textTransform,
              ),
            }}
            className="m-0"
          >
            {resolveText(props.visitHeading.text)}
          </h3>
          {streamDocument.address ? (
            <div className="min-w-0 text-[15px] leading-[1.55] text-[#203446] [&_a]:text-[#2d8a87] [&_address]:not-italic">
              <Address address={streamDocument.address} />
            </div>
          ) : null}
          <Link
            cta={{ link: props.directionsCta.link, linkType: "URL" }}
            className="inline-block max-w-full break-words whitespace-normal text-[15px] text-[#2d8a87]"
          >
            {props.directionsCta.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.callHeading.fontSize}px`,
              color: props.callHeading.fontColor,
              fontWeight: props.callHeading.fontWeight,
              textTransform: toCssTextTransform(
                props.callHeading.textTransform,
              ),
            }}
            className="m-0"
          >
            {resolveText(props.callHeading.text)}
          </h3>
          {phone.display && phone.href ? (
            <Link
              cta={{ link: `tel:${phone.href}`, linkType: "URL" }}
              className="inline-block max-w-full break-words whitespace-normal text-[15px] text-[#2d8a87]"
            >
              {phone.display}
            </Link>
          ) : null}
          <Link
            cta={{ link: props.emailCta.link, linkType: "URL" }}
            className="inline-block max-w-full break-words whitespace-normal text-[15px] text-[#2d8a87]"
          >
            {props.emailCta.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.hoursHeading.fontSize}px`,
              color: props.hoursHeading.fontColor,
              fontWeight: props.hoursHeading.fontWeight,
              textTransform: toCssTextTransform(
                props.hoursHeading.textTransform,
              ),
            }}
            className="m-0"
          >
            {resolveText(props.hoursHeading.text)}
          </h3>
          {streamDocument.hours ? (
            <div className="grid min-w-0 w-fit max-w-full gap-2 overflow-x-auto overflow-y-hidden text-[15px] leading-[1.55] text-[#203446] [&_table]:w-max [&_td]:px-0 [&_td]:py-1 [&_td]:align-top [&_td:first-child]:pr-3 [&_td:first-child]:whitespace-nowrap [&_td:last-child]:break-words [&_td:last-child]:whitespace-normal [&_th]:px-0 [&_th]:py-1">
              <div className="text-[#667685]">
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
              </div>
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
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.focusHeading.fontSize}px`,
              color: props.focusHeading.fontColor,
              fontWeight: props.focusHeading.fontWeight,
              textTransform: toCssTextTransform(
                props.focusHeading.textTransform,
              ),
            }}
            className="m-0"
          >
            {resolveText(props.focusHeading.text)}
          </h3>
          {props.focusItems.map((item, index) => (
            <p
              key={index}
              className="m-0 min-w-0 break-words"
              style={{
                fontFamily: '"Manrope", "Open Sans", sans-serif',
                fontSize: `${item.copy.fontSize}px`,
                color: item.copy.fontColor,
                fontWeight: item.copy.fontWeight,
                textTransform: toCssTextTransform(item.copy.textTransform),
                lineHeight: 1.55,
              }}
            >
              {resolveText(item.copy.text)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HereForYouCoreInfoSection: ComponentConfig<HereForYouCoreInfoSectionProps> =
  {
    label: "Here For You Core Info Section",
    fields: HereForYouCoreInfoSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Core information", 35, "#203446", 600),
      visitHeading: createStyledTextDefault("Visit", 20, "#203446", 700),
      directionsCta: {
        label: "Get directions to this clinic",
        link: "#",
      },
      callHeading: createStyledTextDefault("Call", 20, "#203446", 700),
      emailCta: {
        label: "hello@harborpt.com",
        link: "mailto:hello@harborpt.com",
      },
      hoursHeading: createStyledTextDefault("Hours", 20, "#203446", 700),
      focusHeading: createStyledTextDefault("Focus areas", 20, "#203446", 700),
      focusItems: [
        {
          copy: createStyledTextDefault("Post-op recovery", 16, "#203446", 400),
        },
        {
          copy: createStyledTextDefault(
            "Back and neck pain",
            16,
            "#203446",
            400,
          ),
        },
        {
          copy: createStyledTextDefault(
            "Return-to-sport plans",
            16,
            "#203446",
            400,
          ),
        },
      ],
    },
    render: HereForYouCoreInfoSectionComponent,
  };
