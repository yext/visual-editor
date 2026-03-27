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

type CtaProps = {
  label: string;
  link: string;
};

export type ModernEraCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitHeading: StyledTextProps;
  contactHeading: StyledTextProps;
  hoursHeading: StyledTextProps;
  directionsCta: CtaProps;
  emailCta: CtaProps;
  contactSupportingText: StyledTextProps;
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
] as const;

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const styledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: { types: ["type.string"] },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: [...fontWeightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...textTransformOptions],
    },
  },
});

const styledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
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
  textTransform,
});

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const getFormattedPhoneValue = (phone: unknown) => {
  if (typeof phone !== "string") {
    return null;
  }

  const trimmedPhone = phone.trim();
  if (!trimmedPhone) {
    return null;
  }

  const digitsOnly = trimmedPhone.replace(/\D/g, "");
  const hrefDigits = trimmedPhone.startsWith("+")
    ? `+${trimmedPhone.slice(1).replace(/\D/g, "")}`
    : digitsOnly;

  let label = trimmedPhone;
  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    label = `(${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  } else if (digitsOnly.length === 10) {
    label = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  return {
    href: `tel:${hrefDigits}`,
    label,
  };
};

const ModernEraCoreInfoSectionFields: Fields<ModernEraCoreInfoSectionProps> = {
  heading: styledTextFields("Heading"),
  visitHeading: styledTextFields("Visit Heading"),
  contactHeading: styledTextFields("Contact Heading"),
  hoursHeading: styledTextFields("Hours Heading"),
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
  contactSupportingText: styledTextFields("Contact Supporting Text"),
};

export const ModernEraCoreInfoSectionComponent: PuckComponent<
  ModernEraCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);
  const visitHeading = resolveText(props.visitHeading, locale, streamDocument);
  const contactHeading = resolveText(
    props.contactHeading,
    locale,
    streamDocument,
  );
  const hoursHeading = resolveText(props.hoursHeading, locale, streamDocument);
  const supportingText = resolveText(
    props.contactSupportingText,
    locale,
    streamDocument,
  );
  const phoneValue = getFormattedPhoneValue(streamDocument.mainPhone);

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="mb-6">
        <h2
          className="m-0 text-[#19324d]"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: cssTextTransform(props.heading.textTransform),
          }}
        >
          {heading}
        </h2>
      </div>
      <div
        className="grid content-start items-start grid-cols-3 gap-6 pt-2 max-[920px]:grid-cols-1"
        style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
      >
        <div className="grid content-start self-start gap-3">
          <h3
            className="m-0"
            style={{
              fontSize: `${props.visitHeading.fontSize}px`,
              color: props.visitHeading.fontColor,
              fontWeight: props.visitHeading.fontWeight,
              textTransform: cssTextTransform(props.visitHeading.textTransform),
            }}
          >
            {visitHeading}
          </h3>
          {streamDocument.address ? (
            <div className=" [&_div]:text-[16px] [&_div]:leading-[1.55] [&_p]:m-0">
              <Address address={streamDocument.address} />
            </div>
          ) : null}
          <Link
            cta={{ link: props.directionsCta.link, linkType: "URL" }}
            className="text-[#2a6cb0] underline-offset-2"
          >
            {props.directionsCta.label}
          </Link>
        </div>
        <div className="grid content-start self-start gap-3">
          <h3
            className="m-0"
            style={{
              fontSize: `${props.contactHeading.fontSize}px`,
              color: props.contactHeading.fontColor,
              fontWeight: props.contactHeading.fontWeight,
              textTransform: cssTextTransform(
                props.contactHeading.textTransform,
              ),
            }}
          >
            {contactHeading}
          </h3>
          {phoneValue ? (
            <Link
              cta={{ link: phoneValue.href, linkType: "URL" }}
              className="text-[#2a6cb0]"
            >
              {phoneValue.label}
            </Link>
          ) : null}
          <Link
            cta={{ link: props.emailCta.link, linkType: "URL" }}
            className="text-[#2a6cb0]"
          >
            {props.emailCta.label}
          </Link>
          <p
            className="m-0"
            style={{
              fontSize: `${props.contactSupportingText.fontSize}px`,
              color: props.contactSupportingText.fontColor,
              fontWeight: props.contactSupportingText.fontWeight,
              textTransform: cssTextTransform(
                props.contactSupportingText.textTransform,
              ),
            }}
          >
            {supportingText}
          </p>
        </div>
        <div className="grid content-start self-start gap-3">
          <h3
            className="m-0"
            style={{
              fontSize: `${props.hoursHeading.fontSize}px`,
              color: props.hoursHeading.fontColor,
              fontWeight: props.hoursHeading.fontWeight,
              textTransform: cssTextTransform(props.hoursHeading.textTransform),
            }}
          >
            {hoursHeading}
          </h3>
          {streamDocument.hours ? (
            <>
              <div className="text-[16px] text-[#1b2430]">
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
              </div>
              <div className="[&_table]:w-full [&_table]:border-collapse [&_td]:py-0.5 [&_td]:pr-2 [&_td]:text-left [&_td]:text-[16px] [&_td]:leading-[1.55] [&_td]:text-[#1b2430] [&_th]:py-0.5 [&_th]:pr-3 [&_th]:text-left [&_th]:text-[16px] [&_th]:font-normal [&_th]:leading-[1.55] [&_th]:text-[#1b2430]">
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="today"
                  collapseDays={false}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const ModernEraCoreInfoSection: ComponentConfig<ModernEraCoreInfoSectionProps> =
  {
    label: "Modern Era Core Info Section",
    fields: ModernEraCoreInfoSectionFields,
    defaultProps: {
      heading: styledTextDefault("Core information", 42, "#19324d", 400),
      visitHeading: styledTextDefault("Visit", 18, "#1b2430", 800),
      contactHeading: styledTextDefault("Talk with us", 18, "#1b2430", 800),
      hoursHeading: styledTextDefault("Hours", 18, "#1b2430", 800),
      directionsCta: {
        label: "Get directions to this branch",
        link: "#",
      },
      emailCta: {
        label: "retirement@bluehavenbank.com",
        link: "mailto:retirement@bluehavenbank.com",
      },
      contactSupportingText: styledTextDefault(
        "Retirement desk and branch support",
        16,
        "#1b2430",
        400,
      ),
    },
    render: ModernEraCoreInfoSectionComponent,
  };
