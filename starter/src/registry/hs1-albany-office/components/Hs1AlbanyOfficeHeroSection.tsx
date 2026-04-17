import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
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

type LinkItem = {
  label: string;
  link: string;
};

export type Hs1AlbanyOfficeHeroSectionProps = {
  homeLink: LinkItem;
  currentCrumb: StyledTextProps;
  pageTitle: StyledTextProps;
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

const createStyledTextObjectFields = () => ({
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
    options: [...fontWeightOptions],
  },
  textTransform: {
    label: "Text Transform",
    type: "select" as const,
    options: [...textTransformOptions],
  },
});

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
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

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const createLinkItemFields = () => ({
  label: {
    label: "Label",
    type: "text" as const,
  },
  link: {
    label: "Link",
    type: "text" as const,
  },
});

const Hs1AlbanyOfficeHeroSectionFields: Fields<Hs1AlbanyOfficeHeroSectionProps> =
  {
    homeLink: {
      label: "Home Link",
      type: "object",
      objectFields: createLinkItemFields(),
    },
    currentCrumb: {
      label: "Current Crumb",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    pageTitle: {
      label: "Page Title",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
  };

export const Hs1AlbanyOfficeHeroSectionComponent: PuckComponent<
  Hs1AlbanyOfficeHeroSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale = (streamDocument.locale as string) ?? "en";
  const currentCrumb = resolveStyledText(
    props.currentCrumb,
    locale,
    streamDocument,
  );
  const pageTitle = resolveStyledText(props.pageTitle, locale, streamDocument);

  return (
    <section className="bg-[#e5c989] font-['Montserrat','Open_Sans',sans-serif]">
      <div className="mx-auto max-w-[1200px] px-6 pb-5 pt-3">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/85">
          <Link href={props.homeLink.link} className="hover:text-white">
            {props.homeLink.label}
          </Link>
          <span>&gt;</span>
          <span
            style={{
              fontSize: `${props.currentCrumb.fontSize}px`,
              color: props.currentCrumb.fontColor,
              fontWeight: props.currentCrumb.fontWeight,
              textTransform: cssTextTransform(props.currentCrumb.textTransform),
            }}
          >
            {currentCrumb}
          </span>
        </div>
        <h1
          className="m-0 leading-none"
          style={{
            fontSize: `${props.pageTitle.fontSize}px`,
            color: props.pageTitle.fontColor,
            fontWeight: props.pageTitle.fontWeight,
            textTransform: cssTextTransform(props.pageTitle.textTransform),
            letterSpacing: "1px",
          }}
        >
          {pageTitle}
        </h1>
      </div>
    </section>
  );
};

export const Hs1AlbanyOfficeHeroSection: ComponentConfig<Hs1AlbanyOfficeHeroSectionProps> =
  {
    label: "Hs1 Albany Office Hero Section",
    fields: Hs1AlbanyOfficeHeroSectionFields,
    defaultProps: {
      homeLink: {
        label: "Home",
        link: "https://www.ofc-albany.com",
      },
      currentCrumb: createStyledTextDefault("Office", 10, "#fff7e5", 400),
      pageTitle: createStyledTextDefault(
        "Our Locations",
        28,
        "#ffffff",
        400,
        "uppercase",
      ),
    },
    render: Hs1AlbanyOfficeHeroSectionComponent,
  };
