import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address, HoursStatus, HoursTable, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type CoreLink = {
  label: string;
  link: string;
};

type OfferingItem = {
  copy: StyledTextProps;
};

export type NaturallyGroundedCoreInfoSectionProps = {
  title: StyledTextProps;
  visitHeading: StyledTextProps;
  contactHeading: StyledTextProps;
  offeringsHeading: StyledTextProps;
  emailLink: CoreLink;
  directionsLink: CoreLink;
  offeringItems: OfferingItem[];
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
} satisfies Fields<StyledTextProps>;

const createTextDefault = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

const getTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

export const NaturallyGroundedCoreInfoSectionComponent: PuckComponent<
  NaturallyGroundedCoreInfoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(props.title.text, locale, streamDocument) || "";
  const resolvedVisitHeading =
    resolveComponentData(props.visitHeading.text, locale, streamDocument) || "";
  const resolvedContactHeading =
    resolveComponentData(props.contactHeading.text, locale, streamDocument) ||
    "";
  const resolvedOfferingsHeading =
    resolveComponentData(props.offeringsHeading.text, locale, streamDocument) ||
    "";

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="mb-6">
        <h2
          className="m-0 font-['Libre_Baskerville','Times_New_Roman',serif] leading-[1.02] tracking-[-0.03em]"
          style={{
            color: props.title.fontColor,
            fontSize: `${props.title.fontSize}px`,
            fontWeight: props.title.fontWeight,
            textTransform: getTextTransform(props.title.textTransform),
          }}
        >
          {resolvedTitle}
        </h2>
      </div>
      <div className="grid items-start gap-6 pt-2 text-[#1f2a24] md:grid-cols-[1fr_1fr_1.15fr]">
        <div className="grid gap-3 font-['Work_Sans','Open_Sans',sans-serif]">
          <h3
            className="m-0 text-[1.06rem] leading-[1.55]"
            style={{
              color: props.visitHeading.fontColor,
              fontSize: `${props.visitHeading.fontSize}px`,
              fontWeight: props.visitHeading.fontWeight,
              textTransform: getTextTransform(props.visitHeading.textTransform),
            }}
          >
            {resolvedVisitHeading}
          </h3>
          <div className="[&_a]:text-[#1d4b33] [&_a]:no-underline [&_p]:m-0">
            {streamDocument.address && (
              <Address address={streamDocument.address} />
            )}
          </div>
          <Link
            cta={{
              link: props.directionsLink.link,
              linkType: "URL",
            }}
          >
            <span className="text-sm text-[#1d4b33] no-underline">
              {props.directionsLink.label}
            </span>
          </Link>
        </div>
        <div className="grid gap-3 font-['Work_Sans','Open_Sans',sans-serif]">
          <h3
            className="m-0 text-[1.06rem] leading-[1.55]"
            style={{
              color: props.contactHeading.fontColor,
              fontSize: `${props.contactHeading.fontSize}px`,
              fontWeight: props.contactHeading.fontWeight,
              textTransform: getTextTransform(
                props.contactHeading.textTransform,
              ),
            }}
          >
            {resolvedContactHeading}
          </h3>
          {streamDocument.mainPhone && (
            <Link
              cta={{
                link: `tel:${streamDocument.mainPhone}`,
                linkType: "URL",
              }}
            >
              <span className="text-sm text-[#1d4b33] no-underline">
                {streamDocument.mainPhone}
              </span>
            </Link>
          )}
          <Link
            cta={{
              link: props.emailLink.link,
              linkType: "URL",
            }}
          >
            <span className="text-sm text-[#1d4b33] no-underline">
              {props.emailLink.label}
            </span>
          </Link>
          <div className="grid gap-2 text-sm text-[#607164]">
            {streamDocument.hours && (
              <>
                <HoursStatus
                  hours={streamDocument.hours}
                  timezone={streamDocument.timezone}
                />
                <div className="[&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-y-1 [&_td]:px-0 [&_td]:py-0 [&_td]:text-xs [&_th]:px-0 [&_th]:py-0 [&_th]:pr-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-normal">
                  <HoursTable
                    hours={streamDocument.hours}
                    startOfWeek="today"
                    collapseDays={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="grid gap-3 font-['Work_Sans','Open_Sans',sans-serif]">
          <h3
            className="m-0 text-[1.06rem] leading-[1.55]"
            style={{
              color: props.offeringsHeading.fontColor,
              fontSize: `${props.offeringsHeading.fontSize}px`,
              fontWeight: props.offeringsHeading.fontWeight,
              textTransform: getTextTransform(
                props.offeringsHeading.textTransform,
              ),
            }}
          >
            {resolvedOfferingsHeading}
          </h3>
          <ul className="m-0 list-disc space-y-2 pl-[18px] marker:text-[#1f2a24]">
            {props.offeringItems.map((item, index) => {
              const resolvedItem =
                resolveComponentData(item.copy.text, locale, streamDocument) ||
                "";

              return (
                <li
                  key={`${resolvedItem}-${index}`}
                  className="font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                  style={{
                    color: item.copy.fontColor,
                    fontSize: `${item.copy.fontSize}px`,
                    fontWeight: item.copy.fontWeight,
                    textTransform: getTextTransform(item.copy.textTransform),
                  }}
                >
                  {resolvedItem}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export const NaturallyGroundedCoreInfoSection: ComponentConfig<NaturallyGroundedCoreInfoSectionProps> =
  {
    label: "Naturally Grounded Core Info Section",
    fields: {
      title: {
        label: "Title",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      visitHeading: {
        label: "Visit Heading",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      contactHeading: {
        label: "Contact Heading",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      offeringsHeading: {
        label: "Offerings Heading",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      emailLink: {
        label: "Email Link",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
      directionsLink: {
        label: "Directions Link",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
      offeringItems: {
        label: "Offering Items",
        type: "array",
        arrayFields: {
          copy: {
            label: "Copy",
            type: "object",
            objectFields: styledTextObjectFields,
          },
        },
        defaultItemProps: {
          copy: createTextDefault("Offering", 16, "#1f2a24", 400),
        },
        getItemSummary: (item) =>
          ((item.copy?.text as any)?.constantValue?.defaultValue as string) ||
          "Offering Item",
      },
    },
    defaultProps: {
      title: createTextDefault("Core information", 40, "#1d4b33", 700),
      visitHeading: createTextDefault("Visit", 17, "#1f2a24", 800),
      contactHeading: createTextDefault(
        "Talk with the store",
        17,
        "#1f2a24",
        800,
      ),
      offeringsHeading: createTextDefault(
        "What you can find here",
        17,
        "#1f2a24",
        800,
      ),
      emailLink: {
        label: "hello@fieldandrootmarket.com",
        link: "mailto:hello@fieldandrootmarket.com",
      },
      directionsLink: {
        label: "Get directions",
        link: "#",
      },
      offeringItems: [
        {
          copy: createTextDefault(
            "Organic produce and pantry staples",
            16,
            "#1f2a24",
            400,
          ),
        },
        {
          copy: createTextDefault(
            "Bulk bins and refillable household basics",
            16,
            "#1f2a24",
            400,
          ),
        },
        {
          copy: createTextDefault(
            "Prepared foods with plant-forward options",
            16,
            "#1f2a24",
            400,
          ),
        },
        {
          copy: createTextDefault(
            "Local dairy, eggs, and seasonal goods",
            16,
            "#1f2a24",
            400,
          ),
        },
      ],
    },
    render: NaturallyGroundedCoreInfoSectionComponent,
  };
