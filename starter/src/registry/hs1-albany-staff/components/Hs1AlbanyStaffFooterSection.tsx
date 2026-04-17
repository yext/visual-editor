import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  Image,
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
  platform: "Facebook" | "Twitter" | "Youtube";
  href: string;
};

export type Hs1AlbanyStaffFooterSectionProps = {
  logoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  logoText: StyledTextProps;
  socialLinks: SocialLink[];
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

const imageField = (label: string) =>
  YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label,
    filter: {
      types: ["type.image"],
    },
  });

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

const resolveStyledText = (
  textField: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(textField.text, locale, streamDocument) || "";

const SocialIcon = ({ platform }: { platform: SocialLink["platform"] }) => {
  if (platform === "Facebook") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-current"
        aria-hidden="true"
      >
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H17V4.9c-.4-.1-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V11H7.1v3H10V22h3.5Z" />
      </svg>
    );
  }

  if (platform === "Twitter") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-current"
        aria-hidden="true"
      >
        <path d="M21 7.2c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.2 1.8-2.2-.8.5-1.7.8-2.6 1-1.5-1.6-4.2-1.4-5.5.4-.8 1-.9 2.3-.4 3.4-3.1-.2-5.8-1.7-7.6-4.1-1 1.7-.5 3.9 1.1 5-.6 0-1.2-.2-1.7-.5 0 2 1.4 3.7 3.3 4.1-.6.2-1.2.2-1.8.1.5 1.6 2 2.8 3.7 2.8A7.7 7.7 0 0 1 3 19.5a10.9 10.9 0 0 0 5.9 1.7c7.1 0 11.1-6.1 10.8-11.5.8-.5 1.5-1.2 2-2Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
      aria-hidden="true"
    >
      <path d="M23 7.2a2.9 2.9 0 0 0-2-2C19.2 4.7 12 4.7 12 4.7s-7.2 0-9 .5a2.9 2.9 0 0 0-2 2A30.9 30.9 0 0 0 .5 12 30.9 30.9 0 0 0 1 16.8a2.9 2.9 0 0 0 2 2c1.8.5 9 .5 9 .5s7.2 0 9-.5a2.9 2.9 0 0 0 2-2 30.9 30.9 0 0 0 .5-4.8 30.9 30.9 0 0 0-.5-4.8ZM9.7 15.8V8.2l6 3.8-6 3.8Z" />
    </svg>
  );
};

export const Hs1AlbanyStaffFooterSectionFields: Fields<Hs1AlbanyStaffFooterSectionProps> =
  {
    logoImage: imageField("Logo Image"),
    logoText: styledTextFields("Logo Text"),
    socialLinks: {
      label: "Social Links",
      type: "array",
      defaultItemProps: {
        platform: "Facebook",
        href: "#",
      },
      arrayFields: {
        platform: {
          label: "Platform",
          type: "select",
          options: [
            { label: "Facebook", value: "Facebook" },
            { label: "Twitter", value: "Twitter" },
            { label: "Youtube", value: "Youtube" },
          ],
        },
        href: { label: "Link", type: "text" },
      },
    },
  };

export const Hs1AlbanyStaffFooterSectionComponent: PuckComponent<
  Hs1AlbanyStaffFooterSectionProps
> = ({ logoImage, logoText, socialLinks }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoImage = resolveComponentData(
    logoImage,
    locale,
    streamDocument,
  );
  const resolvedLogoText = resolveStyledText(logoText, locale, streamDocument);

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-4 px-[15px] pb-[20px] pt-[20px] lg:grid-cols-[8fr_4fr]">
          <Link
            href="https://www.ofc-albany.com"
            className="flex items-center gap-[14px] no-underline"
          >
            <div className="h-[78px] w-[120px] shrink-0">
              {resolvedLogoImage ? (
                <Image image={resolvedLogoImage} className="h-full w-full" />
              ) : null}
            </div>
            <span
              style={{
                fontFamily: '"Montserrat", "Open Sans", sans-serif',
                fontSize: `${logoText.fontSize}px`,
                color: logoText.fontColor,
                fontWeight: logoText.fontWeight,
                lineHeight: "28px",
                letterSpacing: "1px",
                textTransform: toCssTextTransform(logoText.textTransform),
              }}
            >
              {resolvedLogoText}
            </span>
          </Link>
          <div className="flex justify-start gap-[12px] lg:justify-end">
            {socialLinks.map((socialLink, index) => (
              <Link
                key={`${socialLink.platform}-${index}`}
                href={socialLink.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcb65f] text-white no-underline"
              >
                <SocialIcon platform={socialLink.platform} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <button
        type="button"
        onClick={() =>
          typeof window !== "undefined" &&
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="fixed bottom-[96px] right-[18px] z-30 flex h-[44px] w-[44px] items-center justify-center bg-[#666666] text-white shadow-lg"
        aria-label="Back to top"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-current"
          aria-hidden="true"
        >
          <path d="m12 6 8 8-1.4 1.4L12 8.8l-6.6 6.6L4 14l8-8Z" />
        </svg>
      </button>
    </>
  );
};

export const Hs1AlbanyStaffFooterSection: ComponentConfig<Hs1AlbanyStaffFooterSectionProps> =
  {
    label: "HS1 Albany Staff Footer Section",
    fields: Hs1AlbanyStaffFooterSectionFields,
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
      logoText: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Sunny Smiles",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 28,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "uppercase",
      },
      socialLinks: [
        {
          platform: "Facebook",
          href: "https://www.facebook.com/Anderson-Optometry-363713737059041/",
        },
        {
          platform: "Twitter",
          href: "https://twitter.com/InternetMatrix",
        },
        {
          platform: "Youtube",
          href: "https://www.youtube.com/user/webmarketingimatrix",
        },
      ],
    },
    render: Hs1AlbanyStaffFooterSectionComponent,
  };
