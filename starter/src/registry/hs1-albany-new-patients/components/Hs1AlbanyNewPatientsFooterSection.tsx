import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  Image,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { Link } from "../../shared/SafeLink";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type SocialLink = {
  label: string;
  link: string;
  icon: "facebook" | "twitter" | "youtube";
};

export type Hs1AlbanyNewPatientsFooterSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  brandName: StyledTextProps;
  socialLinks: SocialLink[];
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

const iconMap: Record<SocialLink["icon"], string> = {
  facebook: "f",
  twitter: "t",
  youtube: "▶",
};

const getTextTransformStyle = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

export const Hs1AlbanyNewPatientsFooterSectionFields: Fields<Hs1AlbanyNewPatientsFooterSectionProps> =
  {
    logoImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Logo Image",
      filter: {
        types: ["type.image"],
      },
    }),
    brandName: {
      label: "Brand Name",
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
    },
    socialLinks: {
      label: "Social Links",
      type: "array",
      arrayFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
        icon: {
          label: "Icon",
          type: "select",
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Twitter", value: "twitter" },
            { label: "Youtube", value: "youtube" },
          ],
        },
      },
      defaultItemProps: {
        label: "Facebook",
        link: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
        icon: "facebook",
      },
      getItemSummary: (item) => item.label,
    },
  };

export const Hs1AlbanyNewPatientsFooterSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsFooterSectionProps
> = ({ logoImage, brandName, socialLinks }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoImage = resolveComponentData(
    logoImage,
    locale,
    streamDocument,
  );
  const resolvedBrandName =
    resolveComponentData(brandName.text, locale, streamDocument) || "";

  return (
    <section className="bg-white text-[#4a4a4a]">
      <div className="mx-auto max-w-[1170px] px-[15px] pb-5 pt-5">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex items-center gap-3">
            {resolvedLogoImage ? (
              <div className="h-[78px] w-[120px]">
                <Image
                  image={resolvedLogoImage}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
            <p
              className="m-0"
              style={{
                fontSize: `${brandName.fontSize}px`,
                color: brandName.fontColor,
                fontWeight: brandName.fontWeight,
                textTransform: getTextTransformStyle(brandName.textTransform),
                fontFamily: "Montserrat, 'Open Sans', sans-serif",
                lineHeight: 1,
              }}
            >
              {resolvedBrandName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
            {socialLinks.map((item) => (
              <Link
                key={`${item.label}-${item.link}`}
                cta={{ link: item.link, linkType: "URL" }}
                className="no-underline"
                target="_blank"
              >
                <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#dcb65f] text-sm font-bold text-white">
                  {iconMap[item.icon]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsFooterSection: ComponentConfig<Hs1AlbanyNewPatientsFooterSectionProps> =
  {
    label: "Hs1 Albany New Patients Footer Section",
    fields: Hs1AlbanyNewPatientsFooterSectionFields,
    defaultProps: {
      logoImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/120x78_80/webmgr/1o/u/o/brooklyn/sunnysmileslogo.png.webp?60c03c38fcebb177765418932264c8d5",
          width: 120,
          height: 78,
        },
        constantValueEnabled: true,
      },
      brandName: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Sunny Smiles",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 20,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "normal",
      },
      socialLinks: [
        {
          label: "Facebook",
          link: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
          icon: "facebook",
        },
        {
          label: "Twitter",
          link: "https://twitter.com/InternetMatrix",
          icon: "twitter",
        },
        {
          label: "Youtube",
          link: "https://www.youtube.com/user/webmarketingimatrix",
          icon: "youtube",
        },
      ],
    },
    render: Hs1AlbanyNewPatientsFooterSectionComponent,
  };
