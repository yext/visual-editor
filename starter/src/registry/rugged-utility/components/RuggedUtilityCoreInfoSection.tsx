import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { Address, HoursStatus, HoursTable, Link } from "@yext/pages-components";

function getFormattedPhoneValue(phone: string | undefined) {
  if (!phone) {
    return undefined;
  }

  const trimmedPhone = phone.trim();
  const phoneHref = trimmedPhone.replace(/[^\d+]/g, "");
  const digitsOnly = trimmedPhone.replace(/\D/g, "");
  const normalizedDigits =
    digitsOnly.length === 11 && digitsOnly.startsWith("1")
      ? digitsOnly.slice(1)
      : digitsOnly;

  const formattedPhone =
    normalizedDigits.length === 10
      ? `(${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6)}`
      : trimmedPhone;
  const href = trimmedPhone.startsWith("+")
    ? phoneHref
    : normalizedDigits.length === 10
      ? `+1${normalizedDigits}`
      : phoneHref;

  return {
    href,
    label: formattedPhone,
  };
}

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type RuggedUtilityCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitHeading: StyledTextProps;
  visitCta: {
    label: string;
    link: string;
  };
  contactHeading: StyledTextProps;
  emailCta: {
    label: string;
    link: string;
  };
  contactDetails: StyledTextProps;
  hoursHeading: StyledTextProps;
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
] as const;

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const styledTextObjectFields = {
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
};

const RuggedUtilityCoreInfoSectionFields: Fields<RuggedUtilityCoreInfoSectionProps> =
  {
    heading: {
      label: "Heading",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    visitHeading: {
      label: "Visit Heading",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    visitCta: {
      label: "Visit Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    contactHeading: {
      label: "Contact Heading",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    emailCta: {
      label: "Email Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    contactDetails: {
      label: "Contact Details",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    hoursHeading: {
      label: "Hours Heading",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    hoursNote: {
      label: "Hours Note",
      type: "object",
      objectFields: styledTextObjectFields,
    },
  };

export const RuggedUtilityCoreInfoSectionComponent: PuckComponent<
  RuggedUtilityCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const visitHeading =
    resolveComponentData(props.visitHeading.text, locale, streamDocument) || "";
  const contactHeading =
    resolveComponentData(props.contactHeading.text, locale, streamDocument) ||
    "";
  const contactDetails =
    resolveComponentData(props.contactDetails.text, locale, streamDocument) ||
    "";
  const hoursHeading =
    resolveComponentData(props.hoursHeading.text, locale, streamDocument) || "";
  const hoursNote =
    resolveComponentData(props.hoursNote.text, locale, streamDocument) || "";

  const phoneValue = getFormattedPhoneValue(
    streamDocument.mainPhone || "+15415550122",
  );
  const address = streamDocument.address;
  const hours = streamDocument.hours;

  return (
    <section className="mx-auto my-3 w-full max-w-[1024px] px-6 pt-2">
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: '"Archivo Black", "Arial Black", sans-serif',
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform:
              props.heading.textTransform === "normal"
                ? "none"
                : props.heading.textTransform,
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="grid items-start gap-6 pt-2 md:grid-cols-3">
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.visitHeading.fontSize}px`,
              lineHeight: 1.35,
              color: props.visitHeading.fontColor,
              fontWeight: props.visitHeading.fontWeight,
              textTransform:
                props.visitHeading.textTransform === "normal"
                  ? "none"
                  : props.visitHeading.textTransform,
            }}
          >
            {visitHeading}
          </h3>
          {address ? (
            <div className="grid gap-0 text-[1rem] leading-6 text-[#181715] [&_*]:not-italic">
              <Address address={address} />
            </div>
          ) : (
            <div className="grid gap-0 text-[1rem] leading-6 text-[#181715]">
              <p className="m-0">728 Timber Avenue</p>
              <p className="m-0">Bend, OR 97701</p>
            </div>
          )}
          <Link
            cta={{ link: props.visitCta.link, linkType: "URL" }}
            className="inline-flex min-h-[44px] items-center break-words text-sm font-semibold text-[#ad5f2d] no-underline"
          >
            {props.visitCta.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.contactHeading.fontSize}px`,
              lineHeight: 1.35,
              color: props.contactHeading.fontColor,
              fontWeight: props.contactHeading.fontWeight,
              textTransform:
                props.contactHeading.textTransform === "normal"
                  ? "none"
                  : props.contactHeading.textTransform,
            }}
          >
            {contactHeading}
          </h3>
          {phoneValue ? (
            <Link
              cta={{ link: `tel:${phoneValue.href}`, linkType: "URL" }}
              className="inline-flex min-h-[44px] items-center break-words text-[1rem] text-[#ad5f2d] no-underline"
            >
              {phoneValue.label}
            </Link>
          ) : null}
          <Link
            cta={{ link: props.emailCta.link, linkType: "URL" }}
            className="inline-flex min-h-[44px] items-center break-words text-[1rem] text-[#ad5f2d] no-underline"
          >
            {props.emailCta.label}
          </Link>
          <p
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.contactDetails.fontSize}px`,
              lineHeight: 1.5,
              color: props.contactDetails.fontColor,
              fontWeight: props.contactDetails.fontWeight,
              textTransform:
                props.contactDetails.textTransform === "normal"
                  ? "none"
                  : props.contactDetails.textTransform,
            }}
          >
            {contactDetails}
          </p>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.hoursHeading.fontSize}px`,
              lineHeight: 1.35,
              color: props.hoursHeading.fontColor,
              fontWeight: props.hoursHeading.fontWeight,
              textTransform:
                props.hoursHeading.textTransform === "normal"
                  ? "none"
                  : props.hoursHeading.textTransform,
            }}
          >
            {hoursHeading}
          </h3>
          {hours ? (
            <>
              <div className="text-[0.95rem] text-[#6d665b] [&_*]:m-0">
                <HoursStatus hours={hours} timezone={streamDocument.timezone} />
              </div>
              <div className="text-[0.95rem] text-[#181715] [&_table]:w-full [&_td]:px-0 [&_td]:py-0.5 [&_th]:px-0 [&_th]:py-0.5 [&_th]:pr-4 [&_tr]:align-top">
                <HoursTable
                  hours={hours}
                  startOfWeek="today"
                  collapseDays={false}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-0 text-[1rem] leading-6 text-[#181715]">
              <p className="m-0">Mon-Sat: 9:00 AM - 7:00 PM</p>
              <p className="m-0">Sun: 10:00 AM - 5:00 PM</p>
            </div>
          )}
          <p
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.hoursNote.fontSize}px`,
              lineHeight: 1.5,
              color: props.hoursNote.fontColor,
              fontWeight: props.hoursNote.fontWeight,
              textTransform:
                props.hoursNote.textTransform === "normal"
                  ? "none"
                  : props.hoursNote.textTransform,
            }}
          >
            {hoursNote}
          </p>
        </div>
      </div>
    </section>
  );
};

export const RuggedUtilityCoreInfoSection: ComponentConfig<RuggedUtilityCoreInfoSectionProps> =
  {
    label: "Rugged Utility Core Info Section",
    fields: RuggedUtilityCoreInfoSectionFields,
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
        fontSize: 36,
        fontColor: "#181715",
        fontWeight: 400,
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
        fontSize: 17,
        fontColor: "#181715",
        fontWeight: 800,
        textTransform: "normal",
      },
      visitCta: {
        label: "Get directions to this store",
        link: "#",
      },
      contactHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Talk with the floor team",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 17,
        fontColor: "#181715",
        fontWeight: 800,
        textTransform: "normal",
      },
      emailCta: {
        label: "gear@northlineoutfitters.com",
        link: "mailto:gear@northlineoutfitters.com",
      },
      contactDetails: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Boot fitting, layering help, and seasonal recommendations",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#6d665b",
        fontWeight: 400,
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
        fontSize: 17,
        fontColor: "#181715",
        fontWeight: 800,
        textTransform: "normal",
      },
      hoursNote: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Repair desk closes one hour before store close",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#6d665b",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    render: RuggedUtilityCoreInfoSectionComponent,
  };
