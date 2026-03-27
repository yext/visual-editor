import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Address, HoursStatus, HoursTable, Link } from "@yext/pages-components";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type LinkProps = {
  label: string;
  link: string;
};

type FocusItemProps = {
  text: StyledTextProps;
};

export type CoastalCareCoreInfoSectionProps = {
  sectionHeading: StyledTextProps;
  visitHeading: StyledTextProps;
  callHeading: StyledTextProps;
  hoursHeading: StyledTextProps;
  focusHeading: StyledTextProps;
  directionsCta: LinkProps;
  emailCta: LinkProps;
  careFocusItems: FocusItemProps[];
};

const styledTextFields = (label: string) => ({
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
      type: "select" as const,
      options: [
        { label: "Normal", value: "normal" },
        { label: "Uppercase", value: "uppercase" },
        { label: "Lowercase", value: "lowercase" },
        { label: "Capitalize", value: "capitalize" },
      ],
    },
  },
});

const linkFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    label: { label: "Label", type: "text" as const },
    link: { label: "Link", type: "text" as const },
  },
});

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

const CoastalCareCoreInfoSectionFields: Fields<CoastalCareCoreInfoSectionProps> =
  {
    sectionHeading: styledTextFields("Section Heading"),
    visitHeading: styledTextFields("Visit Heading"),
    callHeading: styledTextFields("Call Heading"),
    hoursHeading: styledTextFields("Hours Heading"),
    focusHeading: styledTextFields("Care Focus Heading"),
    directionsCta: linkFields("Directions Call To Action"),
    emailCta: linkFields("Email Call To Action"),
    careFocusItems: {
      label: "Care Focus Items",
      type: "array",
      arrayFields: {
        text: styledTextFields("Text"),
      },
      defaultItemProps: {
        text: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Care Focus Item",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#183347",
          fontWeight: 400,
          textTransform: "normal",
        },
      },
      getItemSummary: (item: any) =>
        item?.text?.text?.constantValue?.defaultValue || "Care Focus Item",
    },
  };

export const CoastalCareCoreInfoSectionComponent: PuckComponent<
  CoastalCareCoreInfoSectionProps
> = ({
  sectionHeading,
  visitHeading,
  callHeading,
  hoursHeading,
  focusHeading,
  directionsCta,
  emailCta,
  careFocusItems,
}) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const resolvedSectionHeading =
    resolveComponentData(sectionHeading.text, locale, streamDocument) || "";
  const resolvedVisitHeading =
    resolveComponentData(visitHeading.text, locale, streamDocument) || "";
  const resolvedCallHeading =
    resolveComponentData(callHeading.text, locale, streamDocument) || "";
  const resolvedHoursHeading =
    resolveComponentData(hoursHeading.text, locale, streamDocument) || "";
  const resolvedFocusHeading =
    resolveComponentData(focusHeading.text, locale, streamDocument) || "";
  const phone = getPhoneDetails(streamDocument.mainPhone);

  return (
    <section className="mx-auto w-full max-w-[1024px] px-6 py-6">
      <div className="mb-6">
        <h2
          className="m-0 font-['DM_Serif_Display','Times_New_Roman',serif] leading-none"
          style={{
            fontSize: `${sectionHeading.fontSize}px`,
            color: sectionHeading.fontColor,
            fontWeight: sectionHeading.fontWeight,
            textTransform: toCssTextTransform(sectionHeading.textTransform),
          }}
        >
          {resolvedSectionHeading}
        </h2>
      </div>
      <div className="grid items-start gap-6 pt-2 text-left md:grid-cols-2 xl:grid-cols-4">
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.25]"
            style={{
              fontSize: `${visitHeading.fontSize}px`,
              color: visitHeading.fontColor,
              fontWeight: visitHeading.fontWeight,
              textTransform: toCssTextTransform(visitHeading.textTransform),
            }}
          >
            {resolvedVisitHeading}
          </h3>
          {streamDocument.address && (
            <div className="min-w-0 font-['Public_Sans','Open_Sans',sans-serif] text-base leading-[1.55] text-[#183347] [&_p]:m-0">
              <Address address={streamDocument.address} />
            </div>
          )}
          <Link
            cta={{
              link: directionsCta.link,
              linkType: "URL",
            }}
            className="inline-block max-w-full break-words whitespace-normal font-['Public_Sans','Open_Sans',sans-serif] text-sm text-[#2d6f83] no-underline"
          >
            {directionsCta.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.25]"
            style={{
              fontSize: `${callHeading.fontSize}px`,
              color: callHeading.fontColor,
              fontWeight: callHeading.fontWeight,
              textTransform: toCssTextTransform(callHeading.textTransform),
            }}
          >
            {resolvedCallHeading}
          </h3>
          {phone.display && phone.href && (
            <Link
              cta={{
                link: `tel:${phone.href}`,
                linkType: "URL",
              }}
              className="inline-block max-w-full break-words whitespace-normal font-['Public_Sans','Open_Sans',sans-serif] text-base text-[#2d6f83] no-underline"
            >
              {phone.display}
            </Link>
          )}
          <Link
            cta={{
              link: emailCta.link,
              linkType: "URL",
            }}
            className="inline-block max-w-full break-words whitespace-normal font-['Public_Sans','Open_Sans',sans-serif] text-sm text-[#2d6f83] no-underline"
          >
            {emailCta.label}
          </Link>
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.25]"
            style={{
              fontSize: `${hoursHeading.fontSize}px`,
              color: hoursHeading.fontColor,
              fontWeight: hoursHeading.fontWeight,
              textTransform: toCssTextTransform(hoursHeading.textTransform),
            }}
          >
            {resolvedHoursHeading}
          </h3>
          {streamDocument.hours && (
            <>
              <div className="font-['Public_Sans','Open_Sans',sans-serif] text-sm text-[#5f7684]">
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
              </div>
              <div className="min-w-0 w-fit max-w-full overflow-x-auto overflow-y-hidden font-['Public_Sans','Open_Sans',sans-serif] text-sm leading-[1.55] text-[#183347] [&_table]:w-max [&_td]:py-1 [&_td]:align-top [&_td]:pr-3 [&_td:first-child]:whitespace-nowrap [&_td:last-child]:break-words [&_td:last-child]:whitespace-normal [&_td:last-child]:pr-0">
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="today"
                  collapseDays={false}
                />
              </div>
            </>
          )}
        </div>
        <div className="grid min-w-0 content-start gap-3 self-start">
          <h3
            className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.25]"
            style={{
              fontSize: `${focusHeading.fontSize}px`,
              color: focusHeading.fontColor,
              fontWeight: focusHeading.fontWeight,
              textTransform: toCssTextTransform(focusHeading.textTransform),
            }}
          >
            {resolvedFocusHeading}
          </h3>
          <div className="grid min-w-0 gap-3">
            {careFocusItems.map((item, index) => {
              const resolvedItemText =
                resolveComponentData(item.text.text, locale, streamDocument) ||
                "";

              return (
                <p
                  key={`${resolvedItemText}-${index}`}
                  className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
                  style={{
                    fontSize: `${item.text.fontSize}px`,
                    color: item.text.fontColor,
                    fontWeight: item.text.fontWeight,
                    textTransform: toCssTextTransform(item.text.textTransform),
                  }}
                >
                  {resolvedItemText}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const CoastalCareCoreInfoSection: ComponentConfig<CoastalCareCoreInfoSectionProps> =
  {
    label: "Coastal Care Core Info Section",
    fields: CoastalCareCoreInfoSectionFields,
    defaultProps: {
      sectionHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Core information",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 35,
        fontColor: "#183347",
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
        fontSize: 18,
        fontColor: "#183347",
        fontWeight: 800,
        textTransform: "normal",
      },
      callHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Call",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#183347",
        fontWeight: 800,
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
        fontSize: 18,
        fontColor: "#183347",
        fontWeight: 800,
        textTransform: "normal",
      },
      focusHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Care focus",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#183347",
        fontWeight: 800,
        textTransform: "normal",
      },
      directionsCta: {
        label: "Get directions to this clinic",
        link: "#",
      },
      emailCta: {
        label: "hello@harboranimalclinic.com",
        link: "mailto:hello@harboranimalclinic.com",
      },
      careFocusItems: [
        {
          text: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Wellness visits",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          text: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Dental care",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          text: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Puppy and kitten plans",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
    },
    render: CoastalCareCoreInfoSectionComponent,
  };
