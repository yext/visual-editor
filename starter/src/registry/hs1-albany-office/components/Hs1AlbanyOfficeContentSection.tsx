import type { ComponentProps } from "react";
import { Address as PagesAddress } from "@yext/pages-components";
import { Link as PagesLink } from "@yext/pages-components";
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
import {
  ComplexImageType,
  HoursTable,
  HoursType,
  ImageType,
} from "@yext/pages-components";

type PagesAddressProps = ComponentProps<typeof PagesAddress>;

const hasAddressContent = (address: PagesAddressProps["address"]): boolean => {
  if (!address) {
    return false;
  }

  return Boolean(
    address.line1 ||
      address.line2 ||
      address.city ||
      address.region ||
      address.postalCode ||
      address.countryCode,
  );
};

const Address = (props: PagesAddressProps) => {
  if (!hasAddressContent(props.address)) {
    return null;
  }

  return <PagesAddress {...props} />;
};

const getSafeHref = (href?: string): string => {
  const trimmedHref = href?.trim();
  return trimmedHref ? trimmedHref : "#";
};

type PagesLinkProps = ComponentProps<typeof PagesLink>;

const Link = (props: PagesLinkProps) => {
  const safeProps = { ...props } as any;

  if ("cta" in safeProps && safeProps.cta) {
    safeProps.cta = {
      ...safeProps.cta,
      link: getSafeHref(safeProps.cta.link),
    };
  }

  if ("href" in safeProps) {
    safeProps.href = getSafeHref(safeProps.href);
  }

  return <PagesLink {...safeProps} />;
};

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

type FacilityItem = {
  item: StyledTextProps;
};

export type Hs1AlbanyOfficeContentSectionProps = {
  officeImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  introTitle: StyledTextProps;
  introBody: StyledTextProps;
  officeName: StyledTextProps;
  officeHoursTitle: StyledTextProps;
  hours: YextEntityField<HoursType>;
  appointmentsHeading: StyledTextProps;
  appointmentsBodyBefore: StyledTextProps;
  appointmentCta: LinkItem;
  appointmentsBodyAfter: StyledTextProps;
  insuranceHeading: StyledTextProps;
  insuranceBody: StyledTextProps;
  paymentHeading: StyledTextProps;
  paymentBody: StyledTextProps;
  financingHeading: StyledTextProps;
  financingImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  financingBodyOne: StyledTextProps;
  financingBodyTwo: StyledTextProps;
  financingBodyThree: StyledTextProps;
  financingBodyFourBefore: StyledTextProps;
  financingCta: LinkItem;
  financingBodyFourAfter: StyledTextProps;
  facilitiesHeading: StyledTextProps;
  facilityItems: FacilityItem[];
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

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const renderParagraph = (
  value: StyledTextProps,
  text: string,
  className = "m-0",
) => (
  <p
    className={className}
    style={{
      fontSize: `${value.fontSize}px`,
      color: value.fontColor,
      fontWeight: value.fontWeight,
      textTransform: cssTextTransform(value.textTransform),
    }}
  >
    {text}
  </p>
);

const renderHeading = (value: StyledTextProps, text: string) => (
  <h2
    className="mb-2 mt-6 font-['Montserrat','Open_Sans',sans-serif] leading-[1.3] first:mt-0"
    style={{
      fontSize: `${value.fontSize}px`,
      color: value.fontColor,
      fontWeight: value.fontWeight,
      textTransform: cssTextTransform(value.textTransform),
    }}
  >
    {text}
  </h2>
);

const Hs1AlbanyOfficeContentSectionFields: Fields<Hs1AlbanyOfficeContentSectionProps> =
  {
    officeImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Office Image",
      filter: {
        types: ["type.image"],
      },
    }),
    introTitle: {
      label: "Intro Title",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    introBody: {
      label: "Intro Body",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    officeName: {
      label: "Office Name",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    officeHoursTitle: {
      label: "Office Hours Title",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    hours: YextEntityFieldSelector<any, HoursType>({
      label: "Hours",
      filter: {
        types: ["type.hours"],
      },
    }),
    appointmentsHeading: {
      label: "Appointments Heading",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    appointmentsBodyBefore: {
      label: "Appointments Body Before",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    appointmentCta: {
      label: "Appointment Call To Action",
      type: "object",
      objectFields: createLinkItemFields(),
    },
    appointmentsBodyAfter: {
      label: "Appointments Body After",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    insuranceHeading: {
      label: "Insurance Heading",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    insuranceBody: {
      label: "Insurance Body",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    paymentHeading: {
      label: "Payment Heading",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    paymentBody: {
      label: "Payment Body",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    financingHeading: {
      label: "Financing Heading",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    financingImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Financing Image",
      filter: {
        types: ["type.image"],
      },
    }),
    financingBodyOne: {
      label: "Financing Body One",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    financingBodyTwo: {
      label: "Financing Body Two",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    financingBodyThree: {
      label: "Financing Body Three",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    financingBodyFourBefore: {
      label: "Financing Body Four Before",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    financingCta: {
      label: "Financing Call To Action",
      type: "object",
      objectFields: createLinkItemFields(),
    },
    financingBodyFourAfter: {
      label: "Financing Body Four After",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    facilitiesHeading: {
      label: "Facilities Heading",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    facilityItems: {
      label: "Facility Items",
      type: "array",
      arrayFields: {
        item: {
          label: "Item",
          type: "object",
          objectFields: createStyledTextObjectFields(),
        },
      },
      defaultItemProps: {
        item: createStyledTextDefault("Digital X-rays", 15, "#4a4a4a", 400),
      },
    },
  };

export const Hs1AlbanyOfficeContentSectionComponent: PuckComponent<
  Hs1AlbanyOfficeContentSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale = (streamDocument.locale as string) ?? "en";
  const address = streamDocument.address as Record<string, unknown> | undefined;
  const officeImage = resolveComponentData(
    props.officeImage,
    locale,
    streamDocument,
  );
  const financingImage = resolveComponentData(
    props.financingImage,
    locale,
    streamDocument,
  );
  const hours = resolveComponentData(props.hours, locale, streamDocument);
  const introTitle = resolveStyledText(
    props.introTitle,
    locale,
    streamDocument,
  );
  const introBody = resolveStyledText(props.introBody, locale, streamDocument);
  const officeName = resolveStyledText(
    props.officeName,
    locale,
    streamDocument,
  );
  const officeHoursTitle = resolveStyledText(
    props.officeHoursTitle,
    locale,
    streamDocument,
  );
  const appointmentsHeading = resolveStyledText(
    props.appointmentsHeading,
    locale,
    streamDocument,
  );
  const appointmentsBodyBefore = resolveStyledText(
    props.appointmentsBodyBefore,
    locale,
    streamDocument,
  );
  const appointmentsBodyAfter = resolveStyledText(
    props.appointmentsBodyAfter,
    locale,
    streamDocument,
  );
  const insuranceHeading = resolveStyledText(
    props.insuranceHeading,
    locale,
    streamDocument,
  );
  const insuranceBody = resolveStyledText(
    props.insuranceBody,
    locale,
    streamDocument,
  );
  const paymentHeading = resolveStyledText(
    props.paymentHeading,
    locale,
    streamDocument,
  );
  const paymentBody = resolveStyledText(
    props.paymentBody,
    locale,
    streamDocument,
  );
  const financingHeading = resolveStyledText(
    props.financingHeading,
    locale,
    streamDocument,
  );
  const financingBodyOne = resolveStyledText(
    props.financingBodyOne,
    locale,
    streamDocument,
  );
  const financingBodyTwo = resolveStyledText(
    props.financingBodyTwo,
    locale,
    streamDocument,
  );
  const financingBodyThree = resolveStyledText(
    props.financingBodyThree,
    locale,
    streamDocument,
  );
  const financingBodyFourBefore = resolveStyledText(
    props.financingBodyFourBefore,
    locale,
    streamDocument,
  );
  const financingBodyFourAfter = resolveStyledText(
    props.financingBodyFourAfter,
    locale,
    streamDocument,
  );
  const facilitiesHeading = resolveStyledText(
    props.facilitiesHeading,
    locale,
    streamDocument,
  );
  const resolvedFacilityItems = props.facilityItems.map((item) =>
    resolveStyledText(item.item, locale, streamDocument),
  );
  const mainPhone = String(streamDocument.mainPhone ?? "");

  return (
    <section className="bg-white font-['Montserrat','Open_Sans',sans-serif]">
      <div className="mx-auto max-w-[1100px] px-6 pb-[50px] pt-[25px] text-[#4a4a4a]">
        {officeImage ? (
          <div className="mb-6 lg:float-right lg:mb-4 lg:ml-8 lg:w-[250px]">
            <div className="overflow-hidden border border-[#ececec] bg-white">
              <Image
                image={officeImage}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}
        {renderHeading(props.introTitle, introTitle)}
        {renderParagraph(
          props.introBody,
          introBody,
          "m-0 max-w-[760px] font-['Arial','Helvetica',sans-serif] leading-[1.7]",
        )}

        {renderHeading(props.officeName, officeName)}
        <div className="space-y-2 font-['Arial','Helvetica',sans-serif] text-[15px] leading-[1.65] text-[#4a4a4a]">
          {address ? (
            <Address
              address={address as never}
              lines={[["line1"], ["city", ",", "region", "postalCode"]]}
              className="not-italic"
            />
          ) : null}
          {mainPhone ? (
            <Link
              cta={{
                link: mainPhone,
                linkType: "PHONE",
              }}
              className="inline-block"
            >
              {mainPhone}
            </Link>
          ) : null}
        </div>

        {renderHeading(props.officeHoursTitle, officeHoursTitle)}
        {hours ? (
          <HoursTable
            hours={hours}
            dayOfWeekNames={{
              monday: "Monday:",
              tuesday: "Tuesday:",
              wednesday: "Wednesday:",
              thursday: "Thursday:",
              friday: "Friday:",
              saturday: "Saturday:",
              sunday: "Sunday:",
            }}
            startOfWeek="monday"
            collapseDays={false}
            timeOptions={{ hour: "numeric", minute: "2-digit", hour12: true }}
            className="w-full max-w-[360px] min-w-0 text-[15px] leading-[1.85] text-[#4a4a4a] [&_.HoursTable-row]:grid [&_.HoursTable-row]:w-full [&_.HoursTable-row]:min-w-0 [&_.HoursTable-row]:grid-cols-[110px_minmax(0,1fr)] [&_.HoursTable-row]:gap-x-2 [&_.HoursTable-day]:font-normal [&_.HoursTable-day]:text-[#4a4a4a] [&_.HoursTable-intervals]:min-w-0 [&_.HoursTable-intervals]:text-left [&_.HoursTable-interval]:whitespace-nowrap [&_.is-today_.HoursTable-day]:font-normal"
          />
        ) : null}

        {renderHeading(props.appointmentsHeading, appointmentsHeading)}
        <p className="m-0 font-['Arial','Helvetica',sans-serif] text-[15px] leading-[1.7] text-[#4a4a4a]">
          <span
            style={{
              fontSize: `${props.appointmentsBodyBefore.fontSize}px`,
              color: props.appointmentsBodyBefore.fontColor,
              fontWeight: props.appointmentsBodyBefore.fontWeight,
              textTransform: cssTextTransform(
                props.appointmentsBodyBefore.textTransform,
              ),
            }}
          >
            {appointmentsBodyBefore}{" "}
          </span>
          <Link
            href={props.appointmentCta.link}
            className="text-[#d3a335] underline-offset-2 hover:underline"
          >
            {props.appointmentCta.label}
          </Link>
          <span
            style={{
              fontSize: `${props.appointmentsBodyAfter.fontSize}px`,
              color: props.appointmentsBodyAfter.fontColor,
              fontWeight: props.appointmentsBodyAfter.fontWeight,
              textTransform: cssTextTransform(
                props.appointmentsBodyAfter.textTransform,
              ),
            }}
          >
            {" "}
            {appointmentsBodyAfter}
          </span>
        </p>

        {renderHeading(props.insuranceHeading, insuranceHeading)}
        {renderParagraph(
          props.insuranceBody,
          insuranceBody,
          "m-0 font-['Arial','Helvetica',sans-serif] leading-[1.7]",
        )}

        {renderHeading(props.paymentHeading, paymentHeading)}
        {renderParagraph(
          props.paymentBody,
          paymentBody,
          "m-0 font-['Arial','Helvetica',sans-serif] leading-[1.7]",
        )}

        {renderHeading(props.financingHeading, financingHeading)}
        {financingImage ? (
          <div className="mb-4 lg:float-right lg:mb-2 lg:ml-8 lg:w-[150px]">
            <Image
              image={financingImage}
              className="h-auto w-full object-contain"
            />
          </div>
        ) : null}
        {renderParagraph(
          props.financingBodyOne,
          financingBodyOne,
          "m-0 font-['Arial','Helvetica',sans-serif] leading-[1.7]",
        )}
        {renderParagraph(
          props.financingBodyTwo,
          financingBodyTwo,
          "mt-4 font-['Arial','Helvetica',sans-serif] leading-[1.7]",
        )}
        {renderParagraph(
          props.financingBodyThree,
          financingBodyThree,
          "mt-4 font-['Arial','Helvetica',sans-serif] leading-[1.7]",
        )}
        <p className="mt-4 font-['Arial','Helvetica',sans-serif] text-[15px] leading-[1.7] text-[#4a4a4a]">
          <span
            style={{
              fontSize: `${props.financingBodyFourBefore.fontSize}px`,
              color: props.financingBodyFourBefore.fontColor,
              fontWeight: props.financingBodyFourBefore.fontWeight,
              textTransform: cssTextTransform(
                props.financingBodyFourBefore.textTransform,
              ),
            }}
          >
            {financingBodyFourBefore}{" "}
          </span>
          <Link
            href={props.financingCta.link}
            className="text-[#d3a335] underline-offset-2 hover:underline"
          >
            {props.financingCta.label}
          </Link>
          <span
            style={{
              fontSize: `${props.financingBodyFourAfter.fontSize}px`,
              color: props.financingBodyFourAfter.fontColor,
              fontWeight: props.financingBodyFourAfter.fontWeight,
              textTransform: cssTextTransform(
                props.financingBodyFourAfter.textTransform,
              ),
            }}
          >
            {" "}
            {financingBodyFourAfter}
          </span>
        </p>

        {renderHeading(props.facilitiesHeading, facilitiesHeading)}
        <ul className="m-0 list-disc pl-6 font-['Arial','Helvetica',sans-serif] text-[15px] leading-[1.7] text-[#4a4a4a]">
          {resolvedFacilityItems.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const Hs1AlbanyOfficeContentSection: ComponentConfig<Hs1AlbanyOfficeContentSectionProps> =
  {
    label: "Hs1 Albany Office Content Section",
    fields: Hs1AlbanyOfficeContentSectionFields,
    defaultProps: {
      officeImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/250x185_80/webmgr/1o/u/o/_SHARED/office.jpg.webp?cff02776815b9c6597f67f95a127592e",
          width: 250,
          height: 185,
        },
        constantValueEnabled: true,
      },
      introTitle: createStyledTextDefault(
        "Downers Grove Dentist - Downers Grove Dental Office",
        22,
        "#d3a335",
        400,
      ),
      introBody: createStyledTextDefault(
        "This page provides you with practical information about our practice. It includes descriptions of our office location, including a map and directions, hours, appointment scheduling, insurance acceptance and billing policies.",
        15,
        "#4a4a4a",
        400,
      ),
      officeName: createStyledTextDefault(
        "Sunny Smiles Dental",
        22,
        "#d3a335",
        400,
      ),
      officeHoursTitle: createStyledTextDefault(
        "Office Hours",
        22,
        "#d3a335",
        400,
      ),
      hours: {
        field: "hours",
        constantValue: {},
      },
      appointmentsHeading: createStyledTextDefault(
        "Appointments",
        22,
        "#d3a335",
        400,
      ),
      appointmentsBodyBefore: createStyledTextDefault(
        "We know you have many choices when choosing a Dentist in Downers Grove, IL so we have made",
        15,
        "#4a4a4a",
        400,
      ),
      appointmentCta: {
        label: "requesting an appointment",
        link: "appointment",
      },
      appointmentsBodyAfter: createStyledTextDefault(
        "a simple process via our Web site. If, for any reason you cannot keep a scheduled appointment, or will be delayed, please call us as soon as possible.",
        15,
        "#4a4a4a",
        400,
      ),
      insuranceHeading: createStyledTextDefault(
        "Insurance and Billing",
        22,
        "#d3a335",
        400,
      ),
      insuranceBody: createStyledTextDefault(
        "We accept most traditional insurance plans, contact our office to verify acceptance of your plan. Sunny Smiles Dental does not participate in Health Management Organizations; however, we will be happy to file your insurance claims for you. We accept checks, cash or credit cards. We also offer a flexible payment plan. Please see our Financial Coordinator for details. We are happy to file insurance for your reimbursement as long as you are free to choose your own dentist.",
        15,
        "#4a4a4a",
        400,
      ),
      paymentHeading: createStyledTextDefault(
        "Payment Options",
        22,
        "#d3a335",
        400,
      ),
      paymentBody: createStyledTextDefault(
        "We accept checks, cash or credit cards. We also offer a flexible payment plan. Please see our Financial Coordinator for details. We are happy to file insurance for your reimbursement as long as you are free to choose your own dentist.",
        15,
        "#4a4a4a",
        400,
      ),
      financingHeading: createStyledTextDefault(
        "Financing Options",
        22,
        "#d3a335",
        400,
      ),
      financingImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/150x31_80/webmgr/1o/u/o/_SHARED/carecredit.gif?47ad7afb5dfa6ee7cdf3e27561e5feb5",
          width: 150,
          height: 31,
        },
        constantValueEnabled: true,
      },
      financingBodyOne: createStyledTextDefault(
        "CareCredit is here to help you pay for treatments and procedures your insurance doesn’t cover. We offer No Interest* financing or low minimum monthly payment options so you can get what you want, when you want it. You can even use CareCredit for your family and favorite pet.",
        15,
        "#4a4a4a",
        400,
      ),
      financingBodyTwo: createStyledTextDefault(
        "With three simple steps, including an instant approval process, it’s easy to apply for CareCredit. After you’re approved, you’re free to use CareCredit for the services you choose including LASIK, veterinary, dentistry, cosmetic, hearing aids and more.",
        15,
        "#4a4a4a",
        400,
      ),
      financingBodyThree: createStyledTextDefault(
        "CareCredit is endorsed by some of the most credible organizations specific to each healthcare profession we support. And CareCredit is a GE Money Company, so you know you can count on us. For over 20 years, we’ve been helping over five million cardholders get the healthcare treatments they want and need.",
        15,
        "#4a4a4a",
        400,
      ),
      financingBodyFourBefore: createStyledTextDefault(
        "Now you don’t have to worry about saving up for the procedures you want and need. With CareCredit, the decision’s in your hands to get what you want, when you want it. For more information or to apply online, visit",
        15,
        "#4a4a4a",
        400,
      ),
      financingCta: {
        label: "carecredit.com",
        link: "//carecredit.com/",
      },
      financingBodyFourAfter: createStyledTextDefault(".", 15, "#4a4a4a", 400),
      facilitiesHeading: createStyledTextDefault(
        "Facilities and Equipment",
        22,
        "#d3a335",
        400,
      ),
      facilityItems: [
        {
          item: createStyledTextDefault("Digital X-rays", 15, "#4a4a4a", 400),
        },
        {
          item: createStyledTextDefault("Invisalign", 15, "#4a4a4a", 400),
        },
      ],
    },
    render: Hs1AlbanyOfficeContentSectionComponent,
  };
