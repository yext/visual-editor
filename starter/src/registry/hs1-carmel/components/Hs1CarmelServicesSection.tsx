import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
};

type ServiceCard = {
  title: string;
  description: string;
  link: string;
};

export type Hs1CarmelServicesSectionProps = {
  heading: StyledTextProps;
  cards: ServiceCard[];
};

const createStyledTextField = (label: string) =>
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
          { label: "Normal", value: "none" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) satisfies Fields<Hs1CarmelServicesSectionProps>["heading"];

const Hs1CarmelServicesSectionFields: Fields<Hs1CarmelServicesSectionProps> = {
  heading: createStyledTextField("Heading"),
  cards: {
    label: "Cards",
    type: "array",
    arrayFields: {
      title: { label: "Title", type: "text" },
      description: { label: "Description", type: "textarea" },
      link: { label: "Link", type: "text" },
    },
    defaultItemProps: {
      title: "Service",
      description: "Service description",
      link: "#",
    },
    getItemSummary: (item: ServiceCard) => item.title || "Service",
  },
};

export const Hs1CarmelServicesSectionComponent: PuckComponent<
  Hs1CarmelServicesSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="bg-[#0f2230] px-4 py-16 text-white lg:px-6">
      <div className="mx-auto max-w-[1140px]">
        <h2
          className="m-0 text-center font-['Poppins','Open_Sans',sans-serif]"
          style={{
            fontSize: `${props.heading.fontSize}px`,
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: props.heading.textTransform,
            lineHeight: 1.1,
          }}
        >
          {resolvedHeading}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {props.cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="flex h-full flex-col bg-white p-8 text-[#04364E] shadow-[1px_2px_18px_3px_rgba(0,0,0,0.1)]"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#7CB0D3]/20 text-2xl font-bold text-[#7CB0D3]">
                {index + 1}
              </div>
              <h3 className="m-0 font-['Poppins','Open_Sans',sans-serif] text-xl font-bold leading-6">
                {card.title}
              </h3>
              <p className="mt-4 flex-1 font-['Gothic_A1','Open_Sans',sans-serif] text-[17px] leading-6 text-[#04364E]">
                {card.description}
              </p>
              <div className="mt-6">
                <Link
                  cta={{
                    link: card.link,
                    linkType: "URL",
                  }}
                  className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0384D7] no-underline hover:text-black"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1CarmelServicesSection: ComponentConfig<Hs1CarmelServicesSectionProps> =
  {
    label: "HS1 Carmel Services Section",
    fields: Hs1CarmelServicesSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            en: "How can we help you?",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 34,
        fontColor: "#FFFFFF",
        fontWeight: 700,
        textTransform: "none",
      },
      cards: [
        {
          title: "General Dentistry",
          description:
            "Dentistry encompasses array of services and procedures with a common goal: to help you preserve your natural teeth, ensure your oral health, and keep you looking and feeling great.",
          link: "https://www.ofc-carmel.com/articles/general/502398-general-dentistry",
        },
        {
          title: "Teeth Whitening",
          description:
            "Whitening procedures have effectively restored the smile of people with stained, dull, or discolored teeth.",
          link: "https://www.ofc-carmel.com/articles/general/502439-teeth-whitening",
        },
        {
          title: "Fillings",
          description:
            "Learn about restorative filling options and how to treat cavities before they become larger oral health issues.",
          link: "https://www.ofc-carmel.com/articles/general/502392-fillings",
        },
        {
          title: "Dental Implants",
          description:
            "Before development of dental implants, dentures were the only alternative to replacing a missing tooth or teeth.",
          link: "https://www.ofc-carmel.com/articles/general/502402-implants",
        },
      ],
    },
    render: Hs1CarmelServicesSectionComponent,
  };
