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

type NearbyItem = {
  title: StyledTextProps;
  location: StyledTextProps;
  status: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type NaturallyGroundedNearbyLocationsSectionProps = {
  title: StyledTextProps;
  items: NearbyItem[];
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

export const NaturallyGroundedNearbyLocationsSectionComponent: PuckComponent<
  NaturallyGroundedNearbyLocationsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(props.title.text, locale, streamDocument) || "";

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
      <div className="grid gap-5 md:grid-cols-3">
        {props.items.map((item, index) => {
          const resolvedItemTitle =
            resolveComponentData(item.title.text, locale, streamDocument) || "";
          const resolvedLocation =
            resolveComponentData(item.location.text, locale, streamDocument) ||
            "";
          const resolvedStatus =
            resolveComponentData(item.status.text, locale, streamDocument) ||
            "";

          return (
            <article
              key={`${resolvedItemTitle}-${index}`}
              className="grid gap-4 rounded-[24px] border border-[#d8e2d8] bg-white p-6"
            >
              <h3
                className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  color: item.title.fontColor,
                  fontSize: `${item.title.fontSize}px`,
                  fontWeight: item.title.fontWeight,
                  textTransform: getTextTransform(item.title.textTransform),
                }}
              >
                {resolvedItemTitle}
              </h3>
              <p
                className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  color: item.location.fontColor,
                  fontSize: `${item.location.fontSize}px`,
                  fontWeight: item.location.fontWeight,
                  textTransform: getTextTransform(item.location.textTransform),
                }}
              >
                {resolvedLocation}
              </p>
              <p
                className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  color: item.status.fontColor,
                  fontSize: `${item.status.fontSize}px`,
                  fontWeight: item.status.fontWeight,
                  textTransform: getTextTransform(item.status.textTransform),
                }}
              >
                {resolvedStatus}
              </p>
              <Link
                cta={{
                  link: item.cta.link,
                  linkType: "URL",
                }}
              >
                <span className="text-sm text-[#1d4b33] no-underline">
                  {item.cta.label}
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const NaturallyGroundedNearbyLocationsSection: ComponentConfig<NaturallyGroundedNearbyLocationsSectionProps> =
  {
    label: "Naturally Grounded Nearby Locations Section",
    fields: {
      title: {
        label: "Title",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
          title: {
            label: "Title",
            type: "object",
            objectFields: styledTextObjectFields,
          },
          location: {
            label: "Location",
            type: "object",
            objectFields: styledTextObjectFields,
          },
          status: {
            label: "Status",
            type: "object",
            objectFields: styledTextObjectFields,
          },
          cta: {
            label: "Call To Action",
            type: "object",
            objectFields: {
              label: { label: "Label", type: "text" },
              link: { label: "Link", type: "text" },
            },
          },
        },
        defaultItemProps: {
          title: createTextDefault("Field & Root Market", 17, "#1f2a24", 800),
          location: createTextDefault("Nearby City, ST", 16, "#1f2a24", 400),
          status: createTextDefault("Open until 8:00 PM", 16, "#1f2a24", 400),
          cta: {
            label: "View store",
            link: "#",
          },
        },
        getItemSummary: (item) =>
          ((item.location?.text as any)?.constantValue
            ?.defaultValue as string) || "Nearby Location",
      },
    },
    defaultProps: {
      title: createTextDefault("Nearby locations", 40, "#1d4b33", 700),
      items: [
        {
          title: createTextDefault("Field & Root Market", 17, "#1f2a24", 800),
          location: createTextDefault(
            "South Burlington, VT",
            16,
            "#1f2a24",
            400,
          ),
          status: createTextDefault("Open until 8:00 PM", 16, "#1f2a24", 400),
          cta: {
            label: "View store",
            link: "#",
          },
        },
        {
          title: createTextDefault("Field & Root Market", 17, "#1f2a24", 800),
          location: createTextDefault("Essex Junction, VT", 16, "#1f2a24", 400),
          status: createTextDefault("Open until 8:00 PM", 16, "#1f2a24", 400),
          cta: {
            label: "View store",
            link: "#",
          },
        },
        {
          title: createTextDefault("Field & Root Market", 17, "#1f2a24", 800),
          location: createTextDefault("Williston, VT", 16, "#1f2a24", 400),
          status: createTextDefault("Open until 9:00 PM", 16, "#1f2a24", 400),
          cta: {
            label: "View store",
            link: "#",
          },
        },
      ],
    },
    render: NaturallyGroundedNearbyLocationsSectionComponent,
  };
