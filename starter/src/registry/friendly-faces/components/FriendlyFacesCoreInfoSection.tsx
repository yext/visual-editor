import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address, HoursStatus, HoursTable, Link } from "@yext/pages-components";

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type TextTransform = "normal" | "uppercase" | "lowercase" | "capitalize";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: FontWeight;
  textTransform: TextTransform;
};

type LinkProps = {
  label: string;
  link: string;
};

type ServiceItemProps = {
  name: StyledTextProps;
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

const buildStyledTextFields = (label: string) => ({
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

const buildStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: FontWeight,
  textTransform: TextTransform = "normal",
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

const getTextTransformStyle = (value: TextTransform) =>
  value === "normal" ? undefined : value;

const getPhoneParts = (value: unknown) => {
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

const renderStyledText = (
  value: StyledTextProps,
  text: string,
  className?: string,
) => (
  <p
    className={
      className ?? "m-0 font-['Nunito','Open_Sans',sans-serif] leading-[1.6]"
    }
    style={{
      fontSize: `${value.fontSize}px`,
      color: value.fontColor,
      fontWeight: value.fontWeight,
      textTransform: getTextTransformStyle(value.textTransform),
    }}
  >
    {text}
  </p>
);

export type FriendlyFacesCoreInfoSectionProps = {
  heading: StyledTextProps;
  visitHeading: StyledTextProps;
  callHeading: StyledTextProps;
  hoursHeading: StyledTextProps;
  servicesHeading: StyledTextProps;
  directionsLink: LinkProps;
  emailLink: LinkProps;
  services: ServiceItemProps[];
};

const FriendlyFacesCoreInfoSectionFields: Fields<FriendlyFacesCoreInfoSectionProps> =
  {
    heading: buildStyledTextFields("Heading"),
    visitHeading: buildStyledTextFields("Visit Heading"),
    callHeading: buildStyledTextFields("Call Heading"),
    hoursHeading: buildStyledTextFields("Hours Heading"),
    servicesHeading: buildStyledTextFields("Services Heading"),
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
    services: {
      label: "Services",
      type: "array",
      arrayFields: {
        name: buildStyledTextFields("Name"),
      },
      defaultItemProps: {
        name: buildStyledTextDefault("Service", 16, "#17313d", 400),
      },
      getItemSummary: () => "Service",
    },
  };

export const FriendlyFacesCoreInfoSectionComponent: PuckComponent<
  FriendlyFacesCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedVisitHeading =
    resolveComponentData(props.visitHeading.text, locale, streamDocument) || "";
  const resolvedCallHeading =
    resolveComponentData(props.callHeading.text, locale, streamDocument) || "";
  const resolvedHoursHeading =
    resolveComponentData(props.hoursHeading.text, locale, streamDocument) || "";
  const resolvedServicesHeading =
    resolveComponentData(props.servicesHeading.text, locale, streamDocument) ||
    "";

  const phone = getPhoneParts(streamDocument.mainPhone);

  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 pb-6 pt-14">
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: getTextTransformStyle(props.heading.textTransform),
          }}
        >
          {resolvedHeading}
        </h2>
      </div>
      <div className="grid items-start gap-6 pt-2 min-[920px]:grid-cols-[repeat(4,minmax(0,1fr))] min-[920px]:gap-x-8">
        <div className="grid min-w-0 content-start gap-3 self-start">
          {renderStyledText(
            props.visitHeading,
            resolvedVisitHeading,
            "m-0 font-['Nunito','Open_Sans',sans-serif]",
          )}
          {streamDocument.address && (
            <div className="font-['Nunito','Open_Sans',sans-serif] text-base text-[#17313d] leading-[1.6] [&_p]:m-0">
              <Address address={streamDocument.address} />
            </div>
          )}
          <Link
            cta={{ link: props.directionsLink.link, linkType: "URL" }}
            className="font-['Nunito','Open_Sans',sans-serif] text-base text-[#0f7c82]"
          >
            {props.directionsLink.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          {renderStyledText(
            props.callHeading,
            resolvedCallHeading,
            "m-0 font-['Nunito','Open_Sans',sans-serif]",
          )}
          {phone.display && phone.href && (
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf9f8] font-['Nunito','Open_Sans',sans-serif] text-sm font-extrabold text-[#0f7c82]">
                P
              </span>
              <Link
                cta={{ link: `tel:${phone.href}`, linkType: "URL" }}
                className="truncate font-['Nunito','Open_Sans',sans-serif] text-base text-[#17313d]"
              >
                {phone.display}
              </Link>
            </div>
          )}
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf9f8] font-['Nunito','Open_Sans',sans-serif] text-sm font-extrabold text-[#0f7c82]">
              E
            </span>
            <Link
              cta={{ link: props.emailLink.link, linkType: "URL" }}
              className="truncate font-['Nunito','Open_Sans',sans-serif] text-base text-[#17313d]"
            >
              {props.emailLink.label}
            </Link>
          </div>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          {renderStyledText(
            props.hoursHeading,
            resolvedHoursHeading,
            "m-0 font-['Nunito','Open_Sans',sans-serif]",
          )}
          {streamDocument.hours && (
            <>
              <div className="font-['Nunito','Open_Sans',sans-serif] text-base font-extrabold text-[#0f7c82] [&_p]:m-0">
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
              </div>
              <div className="min-w-0 overflow-hidden font-['Nunito','Open_Sans',sans-serif] text-xs text-[#17313d] min-[920px]:pr-2 [&_table]:w-full [&_table]:table-fixed [&_td]:py-1 [&_td:first-child]:pr-3 [&_td:last-child]:text-right [&_th]:py-1">
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="today"
                  collapseDays={false}
                />
              </div>
            </>
          )}
          {streamDocument.additionalHoursText && (
            <p className="m-0 font-['Nunito','Open_Sans',sans-serif] text-base leading-[1.6] text-[#17313d]">
              {String(streamDocument.additionalHoursText)}
            </p>
          )}
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          {renderStyledText(
            props.servicesHeading,
            resolvedServicesHeading,
            "m-0 font-['Nunito','Open_Sans',sans-serif]",
          )}
          <ul className="m-0 grid gap-2 list-none p-0">
            {props.services.map((item, index) => {
              const resolvedService =
                resolveComponentData(item.name.text, locale, streamDocument) ||
                "";
              return (
                <li key={`${resolvedService}-${index}`} className="min-w-0">
                  {renderStyledText(item.name, resolvedService)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export const FriendlyFacesCoreInfoSection: ComponentConfig<FriendlyFacesCoreInfoSectionProps> =
  {
    label: "Friendly Faces Core Info Section",
    fields: FriendlyFacesCoreInfoSectionFields,
    defaultProps: {
      heading: buildStyledTextDefault("Core information", 38, "#17313d", 700),
      visitHeading: buildStyledTextDefault("Visit", 17, "#17313d", 800),
      callHeading: buildStyledTextDefault("Call", 17, "#17313d", 800),
      hoursHeading: buildStyledTextDefault("Hours", 17, "#17313d", 800),
      servicesHeading: buildStyledTextDefault("Services", 17, "#17313d", 800),
      directionsLink: {
        label: "Get directions",
        link: "#",
      },
      emailLink: {
        label: "hello@maplegrovepediatrics.com",
        link: "mailto:hello@maplegrovepediatrics.com",
      },
      services: [
        {
          name: buildStyledTextDefault("Well visits", 16, "#17313d", 400),
        },
        {
          name: buildStyledTextDefault("Vaccines", 16, "#17313d", 400),
        },
        {
          name: buildStyledTextDefault(
            "Same-day sick care",
            16,
            "#17313d",
            400,
          ),
        },
      ],
    },
    render: FriendlyFacesCoreInfoSectionComponent,
  };
