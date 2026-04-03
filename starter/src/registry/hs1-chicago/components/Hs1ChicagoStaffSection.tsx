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

type StaffMember = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  name: string;
  suffix: string;
  role: string;
  description: StyledTextProps;
  cta: { label: string; link: string };
};

export type Hs1ChicagoStaffSectionProps = {
  heading: StyledTextProps;
  caption: StyledTextProps;
  activeMemberIndex: number;
  members: StaffMember[];
};

const weightOptions = [
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

const transformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const textField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: { types: ["type.string"] },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: [...weightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...transformOptions],
    },
  },
});

const makeText = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: { en: text, hasLocalizedValue: "true" },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const cssTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const fields: Fields<Hs1ChicagoStaffSectionProps> = {
  heading: textField("Heading"),
  caption: textField("Caption"),
  activeMemberIndex: { label: "Active Member Index", type: "number" },
  members: {
    label: "Members",
    type: "array",
    arrayFields: {
      image: YextEntityFieldSelector<
        any,
        ImageType | ComplexImageType | TranslatableAssetImage
      >({
        label: "Image",
        filter: { types: ["type.image"] },
      }),
      name: { label: "Name", type: "text" },
      suffix: { label: "Suffix", type: "text" },
      role: { label: "Role", type: "text" },
      description: textField("Description"),
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
          url: "https://cdcssl.ibsrv.net/ibimg/smb/250x250_80/webmgr/1o/q/x/stockdrimg.jpg.webp?e9b3f2b5a722ce16d21f85611f2a4722",
          width: 250,
          height: 250,
        },
        constantValueEnabled: true,
      },
      name: "Dr. John Smith",
      suffix: "DDS",
      role: "Doctor",
      description: makeText(
        "Dr. John Smith was born and raised in Minnesota.",
        15,
        "#4b4644",
        300,
        "normal",
      ),
      cta: { label: "Read More", link: "https://www.ofc-chicago.com/staff" },
    },
    getItemSummary: (item) => item.name || "Member",
  },
};

export const Hs1ChicagoStaffSectionComponent: PuckComponent<
  Hs1ChicagoStaffSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const index = Math.max(
    0,
    Math.min(
      Math.round(props.activeMemberIndex),
      Math.max(props.members.length - 1, 0),
    ),
  );
  const member = props.members[index];
  const image = member
    ? resolveComponentData(member.image, locale, streamDocument)
    : undefined;
  const description = member
    ? resolveComponentData(member.description.text, locale, streamDocument) ||
      ""
    : "";

  return (
    <section className="bg-white px-6 py-14 max-md:px-4 max-md:py-12">
      <div className="mx-auto max-w-[1140px]">
        <div className="text-center">
          <p
            className="m-0"
            style={{
              fontFamily: "'Oswald', Verdana, sans-serif",
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: cssTransform(props.heading.textTransform),
              lineHeight: 1.2,
            }}
          >
            {resolveComponentData(props.heading.text, locale, streamDocument) ||
              ""}
          </p>
          <p
            className="m-0 mt-1"
            style={{
              fontFamily: "'Hind', Arial, Helvetica, sans-serif",
              fontSize: `${props.caption.fontSize}px`,
              color: props.caption.fontColor,
              fontWeight: props.caption.fontWeight,
              textTransform: cssTransform(props.caption.textTransform),
              lineHeight: 1.25,
            }}
          >
            {resolveComponentData(props.caption.text, locale, streamDocument) ||
              ""}
          </p>
        </div>
        {member && (
          <div className="mx-auto mt-10 max-w-[945px] border border-[#d8d0ce] bg-white p-6">
            <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
              <div className="overflow-hidden border border-[#d8d0ce]">
                {image && (
                  <div className="[&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                    <Image image={image} />
                  </div>
                )}
              </div>
              <div>
                <p className="m-0 font-['Oswald',_Verdana,_sans-serif] text-[26px] uppercase text-[#1f1a19]">
                  {member.name}
                </p>
                <p className="m-0 mt-1 font-['Oswald',_Verdana,_sans-serif] text-[16px] uppercase text-[#815955]">
                  {[member.suffix, member.role].filter(Boolean).join(" • ")}
                </p>
                <p
                  className="m-0 mt-4"
                  style={{
                    fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                    fontSize: `${member.description.fontSize}px`,
                    color: member.description.fontColor,
                    fontWeight: member.description.fontWeight,
                    textTransform: cssTransform(
                      member.description.textTransform,
                    ),
                    lineHeight: 1.7,
                  }}
                >
                  {description}
                </p>
                {member.cta.link && (
                  <div className="mt-5">
                    <Link cta={{ link: member.cta.link, linkType: "URL" }}>
                      <span
                        className="text-[15px] uppercase text-[#815955] underline underline-offset-4"
                        style={{ fontFamily: "'Oswald', Verdana, sans-serif" }}
                      >
                        {member.cta.label}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mt-5 flex items-center justify-center gap-2">
          {props.members.map((_item, dotIndex) => (
            <span
              key={dotIndex}
              className={`block h-2.5 w-2.5 rounded-full ${
                dotIndex === index ? "bg-[#815955]" : "bg-[#d4cdcb]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1ChicagoStaffSection: ComponentConfig<Hs1ChicagoStaffSectionProps> =
  {
    label: "HS1 Chicago Staff Section",
    fields,
    defaultProps: {
      heading: makeText("Meet Our Staff", 28, "#1f1a19", 500, "uppercase"),
      caption: makeText("Learn Who We Are", 18, "#3f3a39", 300, "normal"),
      activeMemberIndex: 0,
      members: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/250x250_80/webmgr/1o/q/x/stockdrimg.jpg.webp?e9b3f2b5a722ce16d21f85611f2a4722",
              width: 250,
              height: 250,
            },
            constantValueEnabled: true,
          },
          name: "Dr. John Smith",
          suffix: "DDS",
          role: "Doctor",
          description: makeText(
            "Dr. John Smith was born and raised in Minnesota. He received his degree from the University of Minnesota in 1990. He practiced in Minneapolis for ten years and enjoys spending time with his family, traveling, and reading.",
            15,
            "#4b4644",
            300,
            "normal",
          ),
          cta: {
            label: "Read More",
            link: "https://www.ofc-chicago.com/staff",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/250x250_80/webmgr/1o/q/x/drpicstock.jpg.webp?0e673d692af0c35756c1b81cbd2799cb",
              width: 250,
              height: 250,
            },
            constantValueEnabled: true,
          },
          name: "Dr. Sarah Green",
          suffix: "DDS",
          role: "Doctor",
          description: makeText(
            "Dr. Sarah Green's practice philosophy is based on extreme excellence. When not working with her patients she enjoys baking and watching movies.",
            15,
            "#4b4644",
            300,
            "normal",
          ),
          cta: { label: "", link: "" },
        },
      ],
    },
    render: Hs1ChicagoStaffSectionComponent,
  };
