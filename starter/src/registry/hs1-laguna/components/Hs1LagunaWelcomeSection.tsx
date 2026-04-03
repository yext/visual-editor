import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

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

export type Hs1LagunaWelcomeSectionProps = {
  heading: StyledTextProps;
  subheading: StyledTextProps;
  emailLink: LinkItem;
  appointmentLink: LinkItem;
};

const styledTextFields = (label: string) =>
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
  }) satisfies Fields<{ value: StyledTextProps }>["value"];

const Hs1LagunaWelcomeSectionFields: Fields<Hs1LagunaWelcomeSectionProps> = {
  heading: styledTextFields("Heading"),
  subheading: styledTextFields("Subheading"),
  emailLink: {
    label: "Email Link",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  appointmentLink: {
    label: "Appointment Link",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
};

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const renderStyledText = (
  value: StyledTextProps,
  text: string,
  className?: string,
) => (
  <span
    className={className}
    style={{
      fontSize: `${value.fontSize}px`,
      color: value.fontColor,
      fontWeight: value.fontWeight,
      textTransform:
        value.textTransform === "normal" ? undefined : value.textTransform,
      fontFamily: "Roboto, Arial, Helvetica, sans-serif",
    }}
  >
    {text}
  </span>
);

const buildTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      en: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

export const Hs1LagunaWelcomeSectionComponent: PuckComponent<
  Hs1LagunaWelcomeSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale =
    typeof streamDocument.locale === "string" ? streamDocument.locale : "en";

  const heading = resolveStyledText(props.heading, locale, streamDocument);
  const subheading = resolveStyledText(
    props.subheading,
    locale,
    streamDocument,
  );

  return (
    <section className="relative z-20 mx-auto -mt-[44px] max-w-[1140px] px-[24px] pb-[34px] pt-0 md:-mt-[62px] md:px-0 md:pb-[22px]">
      <div className="bg-white shadow-[0_5px_33px_13px_rgba(0,0,0,0.15)]">
        <div className="px-[24px] py-[26px] md:px-8">
          <h1 className="m-0 mb-4 block leading-[1.13]">
            {renderStyledText(props.heading, heading)}
          </h1>
          <h2 className="m-0 mb-4 mt-[-14px] block leading-[1.154]">
            {renderStyledText(props.subheading, subheading)}
          </h2>

          <div className="space-y-4 text-[16px] leading-[1.65] text-[#4f4f4f]">
            <p className="m-0">
              Welcome! The dental professionals at Dental Practice Demo are
              pleased to welcome you to our practice. We want all our patients
              to be informed decision makers and fully understand any health
              issues you face. That&apos;s why we&apos;ve developed a web site
              loaded with valuable information about dental and dental problems
              and treatments. We encourage you to visit this site whenever you
              have concern about your teeth.
            </p>

            <p className="m-0">
              Our web site also provides you with background about our, staff,
              office hours, insurance policies, appointment procedures, maps,
              directions to our office in Downers Grove and other useful
              information. We know how hectic life can be and are committed to
              making our practice convenient and accessible. And we want you to
              feel confident that when you choose Dental Practice Demo,
              you&apos;re working with doctors and other professionals who are
              qualified, experienced and caring.
            </p>

            <p className="m-0">
              Please take a few moments to look through this site to get a
              better feel for Dental Practice Demo&apos;s capabilities and
              services. We also invite you to{" "}
              <Link
                cta={{ link: props.emailLink.link, linkType: "URL" }}
                className="font-medium text-[#ac5745]"
              >
                {props.emailLink.label}
              </Link>{" "}
              or call our Downers Grove office at any time to{" "}
              <Link
                cta={{ link: props.appointmentLink.link, linkType: "URL" }}
                className="font-medium text-[#ac5745]"
              >
                {props.appointmentLink.label}
              </Link>
              . Thank you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1LagunaWelcomeSection: ComponentConfig<Hs1LagunaWelcomeSectionProps> =
  {
    label: "Welcome to Our Practice",
    fields: Hs1LagunaWelcomeSectionFields,
    defaultProps: {
      heading: buildTextDefault("Welcome to Our Practice", 23, "#4f4f4f", 700),
      subheading: buildTextDefault(
        "Welcome to Dental Practice Demo, Your Dentist in Downers Grove, IL",
        26,
        "#4f4f4f",
        700,
      ),
      emailLink: {
        label: "email",
        link: "contact",
      },
      appointmentLink: {
        label: "request an appointment",
        link: "appointment",
      },
    },
    render: Hs1LagunaWelcomeSectionComponent,
  };
