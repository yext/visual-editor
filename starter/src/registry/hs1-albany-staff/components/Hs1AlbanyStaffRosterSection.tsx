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

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type StaffMemberItem = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  name: StyledTextProps;
  role: StyledTextProps;
  bio: StyledTextProps;
};

export type Hs1AlbanyStaffRosterSectionProps = {
  intro: StyledTextProps;
  staffMembers: StaffMemberItem[];
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

export const Hs1AlbanyStaffRosterSectionFields: Fields<Hs1AlbanyStaffRosterSectionProps> =
  {
    intro: styledTextFields("Intro"),
    staffMembers: {
      label: "Staff Members",
      type: "array",
      defaultItemProps: {
        image: {
          field: "",
          constantValue: {
            url: "https://example.com/staff.jpg",
            width: 600,
            height: 900,
          },
          constantValueEnabled: true,
        },
        name: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Staff Member",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 28,
          fontColor: "#4a4a4a",
          fontWeight: 400,
          textTransform: "uppercase",
        },
        role: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Role",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 22,
          fontColor: "#d3a335",
          fontWeight: 300,
          textTransform: "normal",
        },
        bio: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Bio",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#4a4a4a",
          fontWeight: 400,
          textTransform: "normal",
        },
      },
      arrayFields: {
        image: imageField("Image"),
        name: styledTextFields("Name"),
        role: styledTextFields("Role"),
        bio: styledTextFields("Bio"),
      },
    },
  };

const imageWrapperClassByIndex = (index: number) =>
  index === 0 ? "lg:h-[416px]" : "lg:h-auto";

const textPanelClassByIndex = (index: number) =>
  index === 1 ? "bg-[#f8f8f8]" : "bg-transparent";

const textPanelMinHeightByIndex = (index: number) =>
  index === 0 ? "lg:min-h-[416px]" : "lg:min-h-[272px]";

export const Hs1AlbanyStaffRosterSectionComponent: PuckComponent<
  Hs1AlbanyStaffRosterSectionProps
> = ({ intro, staffMembers }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedIntro = resolveStyledText(intro, locale, streamDocument);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1140px] px-[15px] pb-[50px] pt-[25px]">
        <p
          className="mb-[30px] mt-[10px]"
          style={{
            fontFamily: '"Lato", "Open Sans", Arial, Helvetica, sans-serif',
            fontSize: `${intro.fontSize}px`,
            color: intro.fontColor,
            fontWeight: intro.fontWeight,
            lineHeight: "25.6px",
            textTransform: toCssTextTransform(intro.textTransform),
          }}
        >
          {resolvedIntro}
        </p>
        <div className="space-y-0">
          {staffMembers.map((staffMember, index) => {
            const resolvedImage = resolveComponentData(
              staffMember.image,
              locale,
              streamDocument,
            );
            const resolvedName = resolveStyledText(
              staffMember.name,
              locale,
              streamDocument,
            );
            const resolvedRole = resolveStyledText(
              staffMember.role,
              locale,
              streamDocument,
            );
            const resolvedBio = resolveStyledText(
              staffMember.bio,
              locale,
              streamDocument,
            );

            return (
              <article
                key={`${resolvedName}-${index}`}
                className={`grid grid-cols-1 lg:grid-cols-[277px_minmax(0,1fr)] ${textPanelMinHeightByIndex(index)}`}
              >
                <div
                  className={`relative w-full ${imageWrapperClassByIndex(index)}`}
                >
                  {resolvedImage ? (
                    <Image image={resolvedImage} className="h-full w-full" />
                  ) : (
                    <div className="h-full min-h-[220px] w-full bg-[#f0f0f0]" />
                  )}
                </div>
                <div
                  className={`flex flex-col justify-start px-[15px] py-[22px] lg:px-[15px] lg:py-[30px] ${textPanelClassByIndex(index)}`}
                >
                  <h3
                    className="m-0"
                    style={{
                      fontFamily: '"Montserrat", "Open Sans", sans-serif',
                      fontSize: `${staffMember.name.fontSize}px`,
                      color: staffMember.name.fontColor,
                      fontWeight: staffMember.name.fontWeight,
                      lineHeight: "28px",
                      letterSpacing: "1px",
                      textTransform: toCssTextTransform(
                        staffMember.name.textTransform,
                      ),
                    }}
                  >
                    {resolvedName}
                  </h3>
                  <p
                    className="mb-[30px] mt-[5px]"
                    style={{
                      fontFamily: '"Montserrat", "Open Sans", sans-serif',
                      fontSize: `${staffMember.role.fontSize}px`,
                      color: staffMember.role.fontColor,
                      fontWeight: staffMember.role.fontWeight,
                      lineHeight: "22px",
                      letterSpacing: "1.5px",
                      textTransform: toCssTextTransform(
                        staffMember.role.textTransform,
                      ),
                    }}
                  >
                    {resolvedRole}
                  </p>
                  <p
                    className="m-0"
                    style={{
                      fontFamily:
                        '"Nunito Sans", "Open Sans", Arial, Helvetica, sans-serif',
                      fontSize: `${staffMember.bio.fontSize}px`,
                      color: staffMember.bio.fontColor,
                      fontWeight: staffMember.bio.fontWeight,
                      lineHeight: "24px",
                      textTransform: toCssTextTransform(
                        staffMember.bio.textTransform,
                      ),
                    }}
                  >
                    {resolvedBio}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyStaffRosterSection: ComponentConfig<Hs1AlbanyStaffRosterSectionProps> =
  {
    label: "HS1 Albany Staff Roster Section",
    fields: Hs1AlbanyStaffRosterSectionFields,
    defaultProps: {
      intro: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "All professionals at Sunny Smiles Dental maintain the highest levels of accreditation and pursue ongoing education to stay abreast of the latest trends in the medical field. Read on to learn more about our staff's experience and training.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "normal",
      },
      staffMembers: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/1365x2048_80/webmgr/1o/u/o/51847043446_64d4ebad59_k.jpg.webp?c28a73b6870d253e190cdccd3a50c225",
              width: 1365,
              height: 2048,
            },
            constantValueEnabled: true,
          },
          name: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Dr. Nathan Anderson",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 28,
            fontColor: "#4a4a4a",
            fontWeight: 400,
            textTransform: "uppercase",
          },
          role: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Dentist",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 22,
            fontColor: "#d3a335",
            fontWeight: 300,
            textTransform: "normal",
          },
          bio: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Dr. John Smith was born and raised in Minnesota. He received his degree from the University of Minnesota in 1990. He practiced in Minneapolis for ten years. Dr. Smith entered the Master'Degree program in at the University of Minnesota in 2000. Dr Smith enjoys spending time with his family, traveling, and exploring the wilderness of the Boundary Waters. He is a talented musician and avid reader.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#4a4a4a",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/1000x668_80/webmgr/1o/u/o/wellnessproducts.jpg.webp?36a57dafc0203121e5236819f25e27d2",
              width: 1000,
              height: 668,
            },
            constantValueEnabled: true,
          },
          name: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Jessica Anderson",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 28,
            fontColor: "#4a4a4a",
            fontWeight: 400,
            textTransform: "uppercase",
          },
          role: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Dental Hygienist",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 22,
            fontColor: "#d3a335",
            fontWeight: 300,
            textTransform: "normal",
          },
          bio: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Jessica's practice philosophy is based on extreme excellence. When not working with her patients she enjoys baking and watching movies.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#4a4a4a",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
    },
    render: Hs1AlbanyStaffRosterSectionComponent,
  };
