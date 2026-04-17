import {
  type ComponentConfig,
  type Fields,
  type PuckComponent,
} from "@puckeditor/core";
import {
  type TranslatableString,
  resolveComponentData,
  useDocument,
  type YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "../../shared/SafeLink";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type ServiceItem = {
  label: string;
  link: string;
  description: string;
};

export type Hs1AlbanyServicesContentSectionProps = {
  introText: StyledTextProps;
  servicesLead: StyledTextProps;
  services: ServiceItem[];
  emergencyHeading: StyledTextProps;
  emergencyText: StyledTextProps;
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

const renderStyledText = (
  textField: StyledTextProps,
  resolvedText: string,
  fontFamily: string,
) => (
  <span
    style={{
      fontFamily,
      fontSize: `${textField.fontSize}px`,
      color: textField.fontColor,
      fontWeight: textField.fontWeight,
      textTransform:
        textField.textTransform === "normal"
          ? undefined
          : textField.textTransform,
    }}
  >
    {resolvedText}
  </span>
);

export const Hs1AlbanyServicesContentSectionFields: Fields<Hs1AlbanyServicesContentSectionProps> =
  {
    introText: styledTextFields("Intro Text"),
    servicesLead: styledTextFields("Services Lead"),
    services: {
      label: "Services",
      type: "array",
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
        description: { label: "Description", type: "textarea" },
      },
      defaultItemProps: {
        label: "Bonding",
        link: "https://www.ofc-albany.com/articles/premium_education/915074-bonding",
        description: "to repair small chips or cracks",
      },
    },
    emergencyHeading: styledTextFields("Emergency Heading"),
    emergencyText: styledTextFields("Emergency Text"),
  };

export const Hs1AlbanyServicesContentSectionComponent: PuckComponent<
  Hs1AlbanyServicesContentSectionProps
> = ({
  introText,
  servicesLead,
  services,
  emergencyHeading,
  emergencyText,
}) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedIntroText =
    resolveComponentData(introText.text, locale, streamDocument) || "";
  const resolvedServicesLead =
    resolveComponentData(servicesLead.text, locale, streamDocument) || "";
  const resolvedEmergencyHeading =
    resolveComponentData(emergencyHeading.text, locale, streamDocument) || "";
  const resolvedEmergencyText =
    resolveComponentData(emergencyText.text, locale, streamDocument) || "";

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1170px] px-6 pb-[54px] pt-[28px]">
        <div className="max-w-[1110px]">
          <p className="m-0 leading-[1.65]">
            {renderStyledText(
              introText,
              resolvedIntroText,
              "'Nunito Sans', 'Open Sans', sans-serif",
            )}
          </p>

          <p className="mb-0 mt-4 leading-[1.65]">
            {renderStyledText(
              servicesLead,
              resolvedServicesLead,
              "'Nunito Sans', 'Open Sans', sans-serif",
            )}
          </p>

          <ul className="mb-0 mt-4 list-disc space-y-3 pl-10 text-[#4a4a4a]">
            {services.map((service, index) => (
              <li
                key={`${service.label}-${index}`}
                className="pl-1 text-[16px] leading-[1.55]"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                }}
              >
                <Link
                  href={service.link}
                  className="font-normal text-[#d3a335] no-underline hover:underline"
                >
                  {service.label}
                </Link>
                <span>{`, ${service.description}`}</span>
              </li>
            ))}
          </ul>

          <h2 className="mb-0 mt-7 leading-[1.35]">
            {renderStyledText(
              emergencyHeading,
              resolvedEmergencyHeading,
              "'Playfair Display', Georgia, serif",
            )}
          </h2>
          <p className="mb-0 mt-3 leading-[1.65]">
            {renderStyledText(
              emergencyText,
              resolvedEmergencyText,
              "'Nunito Sans', 'Open Sans', sans-serif",
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyServicesContentSection: ComponentConfig<Hs1AlbanyServicesContentSectionProps> =
  {
    label: "HS1 Albany Services Content Section",
    fields: Hs1AlbanyServicesContentSectionFields,
    defaultProps: {
      introText: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Regular dental visits are essential to make sure oral health problems — from tooth decay to oral cancer — are detected and treated in a timely manner. At our office, your oral health is our paramount concern. We want to make sure your teeth stay healthy, function well and look great! From regular cleanings and exams to advanced restorative treatments, all of your routine dental needs can be met right here.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 17,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "normal",
      },
      servicesLead: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Services we offer include:",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 17,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "normal",
      },
      services: [
        {
          label: "Bonding",
          link: "https://www.ofc-albany.com/articles/premium_education/915074-bonding",
          description: "to repair small chips or cracks",
        },
        {
          label: "Crowns & Bridgework",
          link: "https://www.ofc-albany.com/articles/premium_education/509264-crowns-bridgework",
          description:
            "to replace large amounts of lost tooth structure and/or missing teeth",
        },
        {
          label: "Dental Implants",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47365",
          description:
            "for the longest-lasting tooth replacement available today",
        },
        {
          label: "Fillings",
          link: "https://www.ofc-albany.com/articles/premium_education/915070-fillings",
          description: "to make your teeth strong and healthy again",
        },
        {
          label: "Oral Cancer Screenings",
          link: "https://www.ofc-albany.com/articles/premium_education/509307-oral-cancer-screening",
          description: "to detect disease at a curable stage",
        },
        {
          label: "Orthodontic Treatment",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47369",
          description: "to move teeth into the right position",
        },
        {
          label: "Periodontal (Gum) Disease Therapy",
          link: "https://www.ofc-albany.com/articles/premium_education/category/47371",
          description: "to prevent tooth loss",
        },
        {
          label: "Porcelain Veneers",
          link: "https://www.ofc-albany.com/articles/premium_education/509326-porcelain-veneers",
          description:
            "for repairing larger chips and cracks, and reshaping teeth",
        },
        {
          label: "Professional Teeth Cleanings",
          link: "https://www.ofc-albany.com/articles/premium_education/509331-professional-teeth-cleanings",
          description: "to maintain good oral health",
        },
        {
          label: "Removable Dentures",
          link: "https://www.ofc-albany.com/articles/premium_education/915076-dentures",
          description: "to help you smile again",
        },
        {
          label: "Root Canal Treatment",
          link: "https://www.ofc-albany.com/articles/premium_education/509336-root-canal-treatment",
          description: "to save an infected tooth",
        },
        {
          label: "Sealants",
          link: "https://www.ofc-albany.com/articles/premium_education/509340-sealants",
          description: "to protect children's teeth from decay",
        },
        {
          label: "Teeth Whitening",
          link: "https://www.ofc-albany.com/articles/premium_education/915075-teeth-whitening",
          description: "to brighten a faded or discolored smile",
        },
        {
          label: "TMJ/TMD Treatment",
          link: "https://www.ofc-albany.com/articles/premium_education/915079-tmd",
          description: "for chronic jaw pain",
        },
        {
          label: "Tooth Extractions",
          link: "https://www.ofc-albany.com/articles/premium_education/915164-extractions",
          description: "when a tooth is hopelessly damaged or decayed",
        },
      ],
      emergencyHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Emergency Dental Treatment",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 22,
        fontColor: "#d3a335",
        fontWeight: 400,
        textTransform: "normal",
      },
      emergencyText: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "If you have a life-threatening or severe injury, call 911 or go directly to the nearest hospital emergency room. We can treat a variety of traumatic dental injuries, including teeth that have been chipped, moved, or knocked out entirely. Please call our office for assistance.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 17,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    render: Hs1AlbanyServicesContentSectionComponent,
  };
