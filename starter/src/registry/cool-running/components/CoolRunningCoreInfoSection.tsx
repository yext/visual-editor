import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address, HoursStatus, Link } from "@yext/pages-components";

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

export type CoolRunningCoreInfoSectionProps = {
  heading: StyledTextProps;
  locationHeading: StyledTextProps;
  supportHeading: StyledTextProps;
  availabilityHeading: StyledTextProps;
  directionsCta: LinkItem;
  supportEmailCta: LinkItem;
  supportDescription: StyledTextProps;
  driveUpAvailability: StyledTextProps;
  depositAvailability: StyledTextProps;
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

const CoolRunningCoreInfoSectionFields: Fields<CoolRunningCoreInfoSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    locationHeading: createStyledTextField("Location Heading"),
    supportHeading: createStyledTextField("Support Heading"),
    availabilityHeading: createStyledTextField("Availability Heading"),
    directionsCta: {
      label: "Directions Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    supportEmailCta: {
      label: "Support Email Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    supportDescription: createStyledTextField("Support Description"),
    driveUpAvailability: createStyledTextField("Drive Up Availability"),
    depositAvailability: createStyledTextField("Deposit Availability"),
  };

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const textStyle = (value: StyledTextProps) => ({
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  fontSize: `${value.fontSize}px`,
  lineHeight: 1.5,
  fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
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

export const CoolRunningCoreInfoSectionComponent: PuckComponent<
  CoolRunningCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const heading = resolveText(props.heading, locale, streamDocument);
  const locationHeading = resolveText(
    props.locationHeading,
    locale,
    streamDocument,
  );
  const supportHeading = resolveText(
    props.supportHeading,
    locale,
    streamDocument,
  );
  const availabilityHeading = resolveText(
    props.availabilityHeading,
    locale,
    streamDocument,
  );
  const supportDescription = resolveText(
    props.supportDescription,
    locale,
    streamDocument,
  );
  const driveUpAvailability = resolveText(
    props.driveUpAvailability,
    locale,
    streamDocument,
  );
  const depositAvailability = resolveText(
    props.depositAvailability,
    locale,
    streamDocument,
  );
  const hasAddress = Boolean(streamDocument.address);
  const hasHours = Boolean(streamDocument.hours);
  const phone = getPhoneDetails(streamDocument.mainPhone);

  return (
    <section className="mx-auto w-full max-w-[1024px] px-6 py-6">
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
            fontSize: `${props.heading.fontSize}px`,
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: toCssTextTransform(props.heading.textTransform),
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-3">
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3 className="m-0" style={textStyle(props.locationHeading)}>
            {locationHeading}
          </h3>
          {hasAddress ? (
            <div className="min-w-0 [&_p]:m-0 [&_p]:font-['IBM_Plex_Sans','Open_Sans',sans-serif] [&_p]:text-[16px] [&_p]:leading-[1.5] [&_p]:text-[#14202c]">
              <Address address={streamDocument.address} />
            </div>
          ) : null}
          <Link
            className="inline-block max-w-full break-words whitespace-normal text-[16px] leading-[1.5] text-[#1677c9] no-underline"
            cta={{
              link: props.directionsCta.link,
              linkType: "URL",
            }}
          >
            {props.directionsCta.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3 className="m-0" style={textStyle(props.supportHeading)}>
            {supportHeading}
          </h3>
          {phone.display && phone.href ? (
            <Link
              className="inline-block max-w-full break-words whitespace-normal text-[16px] leading-[1.5] text-[#1677c9] no-underline"
              cta={{
                link: `tel:${phone.href}`,
                linkType: "URL",
              }}
            >
              {phone.display}
            </Link>
          ) : null}
          <Link
            className="inline-block max-w-full break-words whitespace-normal text-[16px] leading-[1.5] text-[#1677c9] no-underline"
            cta={{
              link: props.supportEmailCta.link,
              linkType: "URL",
            }}
          >
            {props.supportEmailCta.label}
          </Link>
          <p
            className="m-0 min-w-0 break-words"
            style={textStyle(props.supportDescription)}
          >
            {supportDescription}
          </p>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3 className="m-0" style={textStyle(props.availabilityHeading)}>
            {availabilityHeading}
          </h3>
          <div
            className="m-0 min-w-0 break-words text-[16px] leading-[1.5] text-[#14202c]"
            style={{
              fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
            }}
          >
            <span>ATM access: </span>
            {hasHours ? (
              <span className="[&_div]:inline [&_p]:inline [&_span]:inline">
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
              </span>
            ) : (
              <span>24/7</span>
            )}
          </div>
          <p
            className="m-0 min-w-0 break-words"
            style={textStyle(props.driveUpAvailability)}
          >
            {driveUpAvailability}
          </p>
          <p
            className="m-0 min-w-0 break-words"
            style={textStyle(props.depositAvailability)}
          >
            {depositAvailability}
          </p>
        </div>
      </div>
    </section>
  );
};

export const CoolRunningCoreInfoSection: ComponentConfig<CoolRunningCoreInfoSectionProps> =
  {
    label: "Cool Running Core Info Section",
    fields: CoolRunningCoreInfoSectionFields,
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
        fontSize: 32,
        fontColor: "#14202c",
        fontWeight: 700,
        textTransform: "normal",
      },
      locationHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Location",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#14202c",
        fontWeight: 700,
        textTransform: "normal",
      },
      supportHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Support",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#14202c",
        fontWeight: 700,
        textTransform: "normal",
      },
      availabilityHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Availability",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#14202c",
        fontWeight: 700,
        textTransform: "normal",
      },
      directionsCta: {
        label: "Get directions to this ATM",
        link: "#",
      },
      supportEmailCta: {
        label: "support@citypointbank.com",
        link: "mailto:support@citypointbank.com",
      },
      supportDescription: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Customer help for card or access questions",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#14202c",
        fontWeight: 400,
        textTransform: "normal",
      },
      driveUpAvailability: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Drive-up lane: 24/7",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#14202c",
        fontWeight: 400,
        textTransform: "normal",
      },
      depositAvailability: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Cash deposit availability varies by card type",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#14202c",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    render: CoolRunningCoreInfoSectionComponent,
  };
