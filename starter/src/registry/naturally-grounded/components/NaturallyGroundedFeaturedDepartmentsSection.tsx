import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type DepartmentItem = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: StyledTextProps;
  body: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type NaturallyGroundedFeaturedDepartmentsSectionProps = {
  title: StyledTextProps;
  items: DepartmentItem[];
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

export const NaturallyGroundedFeaturedDepartmentsSectionComponent: PuckComponent<
  NaturallyGroundedFeaturedDepartmentsSectionProps
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
          const resolvedImage = resolveComponentData(
            item.image,
            locale,
            streamDocument,
          );
          const resolvedItemTitle =
            resolveComponentData(item.title.text, locale, streamDocument) || "";
          const resolvedItemBody =
            resolveComponentData(item.body.text, locale, streamDocument) || "";

          return (
            <article
              key={`${resolvedItemTitle}-${index}`}
              className="grid overflow-hidden rounded-[24px] border border-[#d8e2d8] bg-white"
            >
              <div className="min-h-[180px] max-h-[180px] overflow-hidden border-b border-[#d8e2d8] bg-[#edf4ea]">
                {resolvedImage && (
                  <Image
                    image={resolvedImage}
                    className="h-[180px] w-full object-cover"
                  />
                )}
              </div>
              <div className="grid gap-4 p-6">
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
                    color: item.body.fontColor,
                    fontSize: `${item.body.fontSize}px`,
                    fontWeight: item.body.fontWeight,
                    textTransform: getTextTransform(item.body.textTransform),
                  }}
                >
                  {resolvedItemBody}
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
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const NaturallyGroundedFeaturedDepartmentsSection: ComponentConfig<NaturallyGroundedFeaturedDepartmentsSectionProps> =
  {
    label: "Naturally Grounded Featured Departments Section",
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
          image: YextEntityFieldSelector<
            any,
            ImageType | ComplexImageType | TranslatableAssetImage
          >({
            label: "Image",
            filter: {
              types: ["type.image"],
            },
          }),
          title: {
            label: "Title",
            type: "object",
            objectFields: styledTextObjectFields,
          },
          body: {
            label: "Body",
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
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: createTextDefault("Department", 17, "#1f2a24", 800),
          body: createTextDefault(
            "Department description.",
            16,
            "#1f2a24",
            400,
          ),
          cta: {
            label: "Explore",
            link: "#",
          },
        },
        getItemSummary: (item) =>
          ((item.title?.text as any)?.constantValue?.defaultValue as string) ||
          "Department Item",
      },
    },
    defaultProps: {
      title: createTextDefault("Featured departments", 40, "#1d4b33", 700),
      items: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: createTextDefault(
            "Produce and fresh greens",
            17,
            "#1f2a24",
            800,
          ),
          body: createTextDefault(
            "Seasonal fruit, regional vegetables, salad essentials, and easy weeknight staples.",
            16,
            "#1f2a24",
            400,
          ),
          cta: {
            label: "Explore produce",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: createTextDefault(
            "Bulk pantry and refill shelves",
            17,
            "#1f2a24",
            800,
          ),
          body: createTextDefault(
            "Beans, grains, nuts, baking basics, and household refills for shoppers who want lower-packaging routines.",
            16,
            "#1f2a24",
            400,
          ),
          cta: {
            label: "Explore bulk pantry",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: createTextDefault(
            "Prepared foods and grab-and-go",
            17,
            "#1f2a24",
            800,
          ),
          body: createTextDefault(
            "Plant-forward lunches, soups, salads, snacks, and simple meal helpers for the week ahead.",
            16,
            "#1f2a24",
            400,
          ),
          cta: {
            label: "Explore prepared foods",
            link: "#",
          },
        },
      ],
    },
    render: NaturallyGroundedFeaturedDepartmentsSectionComponent,
  };
