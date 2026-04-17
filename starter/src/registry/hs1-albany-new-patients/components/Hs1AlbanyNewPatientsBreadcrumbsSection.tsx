import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "../../shared/SafeLink";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyNewPatientsBreadcrumbsSectionProps = {
  homeLink: {
    label: string;
    link: string;
  };
  currentPage: StyledTextProps;
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

const getTextTransformStyle = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const currentPageFields: Fields<Hs1AlbanyNewPatientsBreadcrumbsSectionProps>["currentPage"] =
  {
    label: "Current Page",
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
        options: [...fontWeightOptions],
      },
      textTransform: {
        label: "Text Transform",
        type: "select",
        options: [...textTransformOptions],
      },
    },
  };

export const Hs1AlbanyNewPatientsBreadcrumbsSectionFields: Fields<Hs1AlbanyNewPatientsBreadcrumbsSectionProps> =
  {
    homeLink: {
      label: "Home Link",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    currentPage: currentPageFields,
  };

export const Hs1AlbanyNewPatientsBreadcrumbsSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsBreadcrumbsSectionProps
> = ({ homeLink, currentPage }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedCurrentPage =
    resolveComponentData(currentPage.text, locale, streamDocument) || "";

  return (
    <section className="bg-[#d3a335] text-white">
      <div className="mx-auto max-w-[1170px] px-[15px] py-2">
        <div className="flex items-center gap-2 py-2 text-[13px]">
          <Link href={homeLink.link} className="text-white no-underline">
            {homeLink.label}
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span
            className="m-0"
            style={{
              fontSize: `${currentPage.fontSize}px`,
              color: currentPage.fontColor,
              fontWeight: currentPage.fontWeight,
              textTransform: getTextTransformStyle(currentPage.textTransform),
              fontFamily: "Montserrat, 'Open Sans', sans-serif",
              lineHeight: 1.4,
            }}
          >
            {resolvedCurrentPage}
          </span>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsBreadcrumbsSection: ComponentConfig<Hs1AlbanyNewPatientsBreadcrumbsSectionProps> =
  {
    label: "Hs1 Albany New Patients Breadcrumbs Section",
    fields: Hs1AlbanyNewPatientsBreadcrumbsSectionFields,
    defaultProps: {
      homeLink: {
        label: "Home",
        link: "https://www.ofc-albany.com",
      },
      currentPage: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "New Patients",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 13,
        fontColor: "#ffffff",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    render: Hs1AlbanyNewPatientsBreadcrumbsSectionComponent,
  };
