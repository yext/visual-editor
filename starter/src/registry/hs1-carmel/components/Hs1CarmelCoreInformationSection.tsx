import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  AddressType,
  ComplexImageType,
  HoursStatus,
  HoursType,
  ImageType,
} from "@yext/pages-components";
import {
  Image,
  msg,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  YextField,
} from "@yext/visual-editor";
import {
  Chrome,
  Facebook,
  Globe,
  Instagram,
  Map,
  MapPin,
  Phone,
  Tag,
  Twitter,
} from "lucide-react";
import { Link } from "../../shared/SafeLink";

type ActionButton = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<unknown>;
  linkType: "URL" | "PHONE" | "DRIVING_DIRECTIONS";
  icon: "directions" | "phone" | "website";
  variant: "solid" | "outline";
};

type SocialLink = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<unknown>;
  icon: "google" | "facebook" | "instagram" | "twitter";
};

export type Hs1CarmelCoreInformationSectionProps = {
  actionButtons: ActionButton[];
  businessDetailsHeading: YextEntityField<TranslatableString>;
  address: YextEntityField<AddressType>;
  phone: YextEntityField<string>;
  websiteLabel: YextEntityField<TranslatableString>;
  websiteLink: YextEntityField<unknown>;
  socialLinks: SocialLink[];
  aboutHeading: YextEntityField<TranslatableString>;
  aboutCategory: YextEntityField<TranslatableString>;
  aboutItems: YextEntityField<TranslatableString[]>;
  hoursHeading: YextEntityField<TranslatableString>;
  hours: YextEntityField<HoursType>;
  locationHeading: YextEntityField<TranslatableString>;
  locationImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  locationTitle: YextEntityField<TranslatableString>;
  locationAddress: YextEntityField<AddressType>;
  locationCtaLabel: YextEntityField<TranslatableString>;
  locationCtaLink: YextEntityField<unknown>;
};

const createTextField = (label: string) =>
  YextEntityFieldSelector<any, TranslatableString>({
    label,
    filter: {
      types: ["type.string"],
    },
  });

const createLinkField = (label: string, types: string[]) =>
  YextEntityFieldSelector<any, unknown>({
    label,
    filter: {
      types: types as ("type.string" | "type.phone")[],
    },
  });

const createAddressField = (label: string) =>
  YextEntityFieldSelector<any, AddressType>({
    label,
    filter: {
      types: ["type.address"],
    },
  });

const createPhoneField = (label: string) =>
  YextEntityFieldSelector<any, string>({
    label,
    filter: {
      types: ["type.phone"],
    },
  });

const createHoursField = (label: string) =>
  YextEntityFieldSelector<any, HoursType>({
    label,
    filter: {
      types: ["type.hours"],
    },
  });

const actionButtonFields = {
  label: createTextField("Label"),
  link: createLinkField("Link", ["type.string", "type.phone"]),
  linkType: {
    label: "Link Type",
    type: "select" as const,
    options: [
      { label: "URL", value: "URL" },
      { label: "Phone", value: "PHONE" },
      { label: "Directions", value: "DRIVING_DIRECTIONS" },
    ],
  },
  icon: {
    label: "Icon",
    type: "select" as const,
    options: [
      { label: "Directions", value: "directions" },
      { label: "Phone", value: "phone" },
      { label: "Website", value: "website" },
    ],
  },
  variant: {
    label: "Variant",
    type: "select" as const,
    options: [
      { label: "Solid", value: "solid" },
      { label: "Outline", value: "outline" },
    ],
  },
};

const socialLinkFields = {
  label: createTextField("Label"),
  link: createLinkField("Link", ["type.string"]),
  icon: {
    label: "Icon",
    type: "select" as const,
    options: [
      { label: "Google", value: "google" },
      { label: "Facebook", value: "facebook" },
      { label: "Instagram", value: "instagram" },
      { label: "Twitter", value: "twitter" },
    ],
  },
};

const Hs1CarmelCoreInformationSectionFields: Fields<Hs1CarmelCoreInformationSectionProps> =
  {
    actionButtons: {
      label: "Action Buttons",
      type: "array",
      arrayFields: actionButtonFields,
      defaultItemProps: {
        label: {
          field: "",
          constantValue: {
            defaultValue: "Button",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        link: {
          field: "",
          constantValue: "#",
          constantValueEnabled: true,
        },
        linkType: "URL",
        icon: "website",
        variant: "outline",
      },
      getItemSummary: (item: ActionButton) =>
        item.icon ? `${item.icon} button` : "Action Button",
    },
    businessDetailsHeading: createTextField("Business Details Heading"),
    address: createAddressField("Address"),
    phone: createPhoneField("Phone"),
    websiteLabel: createTextField("Website Label"),
    websiteLink: createLinkField("Website Link", ["type.string"]),
    socialLinks: {
      label: "Social Links",
      type: "array",
      arrayFields: socialLinkFields,
      defaultItemProps: {
        label: {
          field: "",
          constantValue: {
            defaultValue: "Social Link",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        link: {
          field: "",
          constantValue: "#",
          constantValueEnabled: true,
        },
        icon: "google",
      },
      getItemSummary: (item: SocialLink) => item.icon || "Social Link",
    },
    aboutHeading: createTextField("About Heading"),
    aboutCategory: createTextField("About Category"),
    aboutItems: YextField(msg("fields.aboutItems", "About Items"), {
      type: "entityField",
      filter: {
        types: ["type.string"],
        includeListsOnly: true,
      },
    }),
    hoursHeading: createTextField("Hours Heading"),
    hours: createHoursField("Hours"),
    locationHeading: createTextField("Location Heading"),
    locationImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Location Image",
      filter: {
        types: ["type.image"],
      },
    }),
    locationTitle: createTextField("Location Title"),
    locationAddress: createAddressField("Location Address"),
    locationCtaLabel: createTextField("Location CTA Label"),
    locationCtaLink: createLinkField("Location CTA Link", ["type.string"]),
  };

const actionIconMap = {
  directions: Map,
  phone: Phone,
  website: Globe,
} as const;

const socialIconMap = {
  google: Chrome,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
} as const;

const socialIconColorMap = {
  google: "text-[#4285F4]",
  facebook: "text-[#1877F2]",
  instagram: "text-[#E4405F]",
  twitter: "text-[#111827]",
} as const;

const orderedDays = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
] as const;

const createTextDefault = (
  text: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue: text,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const createLinkDefault = (link: string): YextEntityField<unknown> => ({
  field: "",
  constantValue: link,
  constantValueEnabled: true,
});

const formatAddress = (address: AddressType | undefined): string => {
  if (!address) {
    return "";
  }

  return [
    address.line1,
    address.line2,
    [address.city, address.region, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.countryCode,
  ]
    .filter(Boolean)
    .join("\n");
};

const getDirectionsLink = (addressText: string): string =>
  addressText
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText.replace(/\n/g, " "))}`
    : "#";

const getResolvedText = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: Record<string, unknown>,
) => String(resolveComponentData(field, locale, streamDocument) || "");

const getResolvedLink = (
  field: YextEntityField<unknown>,
  locale: string,
  streamDocument: Record<string, unknown>,
): string => {
  const value = resolveComponentData(field, locale, streamDocument) as
    | string
    | { url?: string; displayUrl?: string; preferDisplayUrl?: boolean }
    | undefined;

  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    if (typeof value.url === "string") {
      return value.url;
    }
    if (typeof value.displayUrl === "string") {
      return value.displayUrl;
    }
  }

  return "";
};

const getDisplayLinkText = (
  field: YextEntityField<unknown>,
  locale: string,
  streamDocument: Record<string, unknown>,
): string => {
  const value = resolveComponentData(field, locale, streamDocument) as
    | string
    | { url?: string; displayUrl?: string; preferDisplayUrl?: boolean }
    | undefined;

  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    if (value.preferDisplayUrl && typeof value.displayUrl === "string") {
      return value.displayUrl;
    }
    if (typeof value.displayUrl === "string") {
      return value.displayUrl;
    }
    if (typeof value.url === "string") {
      return value.url;
    }
  }

  return "";
};

const getResolvedTextList = (
  field: YextEntityField<TranslatableString[]>,
  locale: string,
  streamDocument: Record<string, unknown>,
): string[] => {
  const resolved = resolveComponentData(field, locale, streamDocument) as
    | TranslatableString[]
    | string[]
    | TranslatableString
    | string
    | undefined;

  const items = Array.isArray(resolved) ? resolved : resolved ? [resolved] : [];

  return items
    .map((item) =>
      typeof item === "string"
        ? item
        : String(resolveComponentData(item, locale, streamDocument) || ""),
    )
    .filter(Boolean);
};

const formatPhoneHref = (phoneNumber: string): string =>
  phoneNumber.startsWith("tel:")
    ? phoneNumber
    : `tel:${phoneNumber.replace(/[^\d+]/g, "")}`;

const formatHourLabel = (time: string) => {
  const [hourPart, minutePart] = time.split(":");
  const hour = Number.parseInt(hourPart, 10);
  const minute = Number.parseInt(minutePart, 10);
  const date = new Date(Date.UTC(2024, 0, 1, hour, minute));

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
};

const renderDetailRow = (Icon: typeof MapPin, text: string, link: string) => {
  if (!text) {
    return null;
  }

  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-1 h-4 w-4 shrink-0 text-[#7B7F86]"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <Link
          cta={{ link, linkType: "URL" }}
          className="whitespace-pre-line break-words text-[17px] leading-[1.45] text-[#4458F8] no-underline hover:underline"
        >
          {text}
        </Link>
      </div>
    </div>
  );
};

export const Hs1CarmelCoreInformationSectionComponent: PuckComponent<
  Hs1CarmelCoreInformationSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown> & {
    locale?: string;
    timezone?: string;
  };
  const locale = streamDocument.locale ?? "en";

  const resolvedBusinessDetailsHeading = getResolvedText(
    props.businessDetailsHeading,
    locale,
    streamDocument,
  );
  const resolvedAddress =
    (resolveComponentData(props.address, locale, streamDocument) as
      | AddressType
      | undefined) ?? undefined;
  const resolvedAddressText = formatAddress(resolvedAddress);
  const resolvedDirectionsLink = getDirectionsLink(resolvedAddressText);
  const resolvedPhone = String(
    resolveComponentData(props.phone, locale, streamDocument) || "",
  );
  const resolvedPhoneLink = resolvedPhone
    ? formatPhoneHref(resolvedPhone)
    : "#";
  const resolvedWebsiteLink =
    getResolvedLink(props.websiteLink, locale, streamDocument) || "#";
  const resolvedWebsiteLabel =
    getResolvedText(props.websiteLabel, locale, streamDocument) ||
    getDisplayLinkText(props.websiteLink, locale, streamDocument) ||
    resolvedWebsiteLink;
  const resolvedAboutHeading = getResolvedText(
    props.aboutHeading,
    locale,
    streamDocument,
  );
  const resolvedAboutCategory = getResolvedText(
    props.aboutCategory,
    locale,
    streamDocument,
  );
  const resolvedAboutItems = getResolvedTextList(
    props.aboutItems,
    locale,
    streamDocument,
  );
  const resolvedHoursHeading = getResolvedText(
    props.hoursHeading,
    locale,
    streamDocument,
  );
  const resolvedHours =
    (resolveComponentData(props.hours, locale, streamDocument) as
      | HoursType
      | undefined) ?? undefined;
  const resolvedTimezone = streamDocument.timezone ?? "America/New_York";
  const resolvedLocationHeading = getResolvedText(
    props.locationHeading,
    locale,
    streamDocument,
  );
  const resolvedLocationImage = resolveComponentData(
    props.locationImage,
    locale,
    streamDocument,
  );
  const resolvedLocationTitle =
    getResolvedText(props.locationTitle, locale, streamDocument) || "";
  const resolvedLocationAddress =
    (resolveComponentData(props.locationAddress, locale, streamDocument) as
      | AddressType
      | undefined) ?? undefined;
  const resolvedLocationAddressText = formatAddress(resolvedLocationAddress);
  const resolvedLocationCtaLabel = getResolvedText(
    props.locationCtaLabel,
    locale,
    streamDocument,
  );
  const resolvedLocationCtaLink =
    getResolvedLink(props.locationCtaLink, locale, streamDocument) ||
    getDirectionsLink(resolvedLocationAddressText);
  const locationMapQuery = [
    resolvedLocationAddress?.line1,
    resolvedLocationAddress?.city,
    resolvedLocationAddress?.region,
    resolvedLocationAddress?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const resolvedHourRows = orderedDays.map(([key, label]) => {
    const day = resolvedHours?.[
      key as keyof Pick<
        HoursType,
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      >
    ] as
      | { isClosed?: boolean; openIntervals?: { start: string; end: string }[] }
      | undefined;
    const hoursText =
      day?.isClosed || !day?.openIntervals?.length
        ? "Closed"
        : day.openIntervals
            .map(
              (interval) =>
                `${formatHourLabel(interval.start)} - ${formatHourLabel(interval.end)}`,
            )
            .join(", ");

    return {
      label,
      hoursText,
    };
  });
  const locationImageValue =
    (resolvedLocationImage as
      | ImageType
      | ComplexImageType
      | TranslatableAssetImage
      | undefined) &&
    (resolvedLocationImage as { url?: string } | undefined)?.url
      ? (resolvedLocationImage as
          | ImageType
          | ComplexImageType
          | TranslatableAssetImage)
      : undefined;
  const shouldShowHoursStatus = Boolean(resolvedHours && resolvedTimezone);

  return (
    <section className="bg-white px-4 py-16 lg:px-6">
      <div className="mx-auto grid max-w-[1140px] gap-14 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-['Gothic_A1','Open_Sans',sans-serif] text-[18px] leading-none">
            {shouldShowHoursStatus ? (
              <div className="text-[#2F8A3B] [&_.HoursStatus-label]:text-[#2F8A3B] [&_.HoursStatus-text]:text-[#1F2933]">
                <HoursStatus
                  hours={resolvedHours as HoursType}
                  timezone={resolvedTimezone}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            {props.actionButtons.map((button, index) => {
              const Icon = actionIconMap[button.icon];
              const resolvedButtonLabel = getResolvedText(
                button.label,
                locale,
                streamDocument,
              );
              const rawButtonLink = getResolvedLink(
                button.link,
                locale,
                streamDocument,
              );
              const resolvedButtonLink =
                rawButtonLink ||
                (button.linkType === "DRIVING_DIRECTIONS"
                  ? resolvedDirectionsLink
                  : button.linkType === "PHONE"
                    ? resolvedPhoneLink
                    : resolvedWebsiteLink);
              const normalizedButtonLink =
                button.linkType === "PHONE"
                  ? formatPhoneHref(resolvedButtonLink)
                  : resolvedButtonLink;

              return (
                <Link
                  key={`${button.icon}-${index}`}
                  cta={{
                    link: normalizedButtonLink,
                    linkType: button.linkType,
                  }}
                  className={[
                    "inline-flex min-h-[52px] items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold no-underline transition",
                    button.variant === "solid"
                      ? "bg-[#1D1F24] text-white hover:bg-[#04364E]"
                      : "border border-[#1D1F24] bg-white text-[#1D1F24] hover:border-[#04364E] hover:text-[#04364E]",
                  ].join(" ")}
                >
                  <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                  <span>{resolvedButtonLabel}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-11">
            <h2 className="m-0 font-['Poppins','Open_Sans',sans-serif] text-[26px] font-semibold leading-none text-[#5F6368]">
              {resolvedBusinessDetailsHeading}
            </h2>
            <div className="mt-6 space-y-5">
              {renderDetailRow(
                MapPin,
                resolvedAddressText,
                resolvedDirectionsLink,
              )}
              {renderDetailRow(Phone, resolvedPhone, resolvedPhoneLink)}
              {renderDetailRow(
                Globe,
                resolvedWebsiteLabel,
                resolvedWebsiteLink,
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {props.socialLinks.map((item, index) => {
                const Icon = socialIconMap[item.icon];
                const resolvedLabel = getResolvedText(
                  item.label,
                  locale,
                  streamDocument,
                );
                const resolvedLink =
                  getResolvedLink(item.link, locale, streamDocument) || "#";

                return (
                  <Link
                    key={`${item.icon}-${index}`}
                    cta={{ link: resolvedLink, linkType: "URL" }}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#9CA3AF] px-4 py-2 text-[15px] font-medium text-[#1F2933] no-underline transition hover:border-[#04364E] hover:text-[#04364E]"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon
                      className={`h-4 w-4 ${socialIconColorMap[item.icon]}`}
                      aria-hidden="true"
                    />
                    <span>{resolvedLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-11">
            <div>
              <h2 className="m-0 font-['Poppins','Open_Sans',sans-serif] text-[26px] font-semibold leading-none text-[#5F6368]">
                {resolvedAboutHeading}
              </h2>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[#5F6368]">
              <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-['Gothic_A1','Open_Sans',sans-serif] text-[16px] leading-none">
                {resolvedAboutCategory}
              </span>
            </div>
            <p className="mt-5 whitespace-pre-line font-['Gothic_A1','Open_Sans',sans-serif] text-[18px] leading-[1.5] text-[#1D1F24]">
              {resolvedAboutItems.join(" • ")}
            </p>
          </div>

          <div className="mt-11">
            <div>
              <h2 className="m-0 font-['Poppins','Open_Sans',sans-serif] text-[26px] font-semibold leading-none text-[#5F6368]">
                {resolvedLocationHeading}
              </h2>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
              <div className="relative min-h-[220px] overflow-hidden rounded-[18px] bg-[#E9EFF3]">
                {locationMapQuery ? (
                  <iframe
                    title="Carmel core information location map"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(locationMapQuery)}&output=embed`}
                    className="h-full min-h-[220px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : locationImageValue ? (
                  <Image
                    image={locationImageValue}
                    className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(124,176,211,0.25)_1px,transparent_1px),linear-gradient(rgba(124,176,211,0.22)_1px,transparent_1px)] bg-[size:42px_42px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.9),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(4,54,78,0.08),transparent_30%)]" />
                    <div className="absolute left-[44%] top-[44%] flex h-12 w-12 items-center justify-center rounded-full bg-[#E04E39] text-white shadow-[0_14px_30px_rgba(224,78,57,0.35)]">
                      <MapPin
                        className="h-6 w-6 fill-current"
                        aria-hidden="true"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="m-0 font-['Poppins','Open_Sans',sans-serif] text-[18px] font-semibold text-[#111827]">
                  {resolvedLocationTitle}
                </h3>
                <p className="mt-4 whitespace-pre-line font-['Gothic_A1','Open_Sans',sans-serif] text-[17px] leading-[1.45] text-[#1F2933]">
                  {resolvedLocationAddressText}
                </p>
                <div className="mt-5">
                  <Link
                    cta={{ link: resolvedLocationCtaLink, linkType: "URL" }}
                    className="inline-flex items-center gap-2 text-[16px] font-semibold text-[#4458F8] no-underline hover:underline"
                  >
                    <span>{resolvedLocationCtaLabel}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:pt-[128px]">
          <div>
            <h2 className="m-0 font-['Poppins','Open_Sans',sans-serif] text-[28px] font-semibold leading-none text-[#5F6368]">
              {resolvedHoursHeading}
            </h2>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 font-['Gothic_A1','Open_Sans',sans-serif] text-[18px] leading-none">
            {shouldShowHoursStatus ? (
              <div className="text-[#2F8A3B] [&_.HoursStatus-label]:text-[#2F8A3B] [&_.HoursStatus-text]:text-[#1F2933]">
                <HoursStatus
                  hours={resolvedHours as HoursType}
                  timezone={resolvedTimezone}
                />
              </div>
            ) : null}
          </div>
          <div className="mt-6 space-y-4">
            {resolvedHourRows.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className="grid grid-cols-[minmax(110px,132px)_minmax(0,1fr)] items-start gap-4 font-['Gothic_A1','Open_Sans',sans-serif] text-[17px] leading-none text-[#111827]"
              >
                <div className={index === 0 ? "font-semibold" : "font-normal"}>
                  {row.label}
                </div>
                <div className={index === 0 ? "font-semibold" : "font-normal"}>
                  {row.hoursText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1CarmelCoreInformationSection: ComponentConfig<Hs1CarmelCoreInformationSectionProps> =
  {
    label: "HS1 Carmel Core Information Section",
    fields: Hs1CarmelCoreInformationSectionFields,
    defaultProps: {
      actionButtons: [
        {
          label: createTextDefault("Get Directions"),
          link: createLinkDefault(""),
          linkType: "DRIVING_DIRECTIONS",
          icon: "directions",
          variant: "solid",
        },
        {
          label: createTextDefault("Call"),
          link: {
            field: "mainPhone",
            constantValue: "",
          },
          linkType: "PHONE",
          icon: "phone",
          variant: "outline",
        },
        {
          label: createTextDefault("Website"),
          link: {
            field: "websiteUrl",
            constantValue: "",
          },
          linkType: "URL",
          icon: "website",
          variant: "outline",
        },
      ],
      businessDetailsHeading: createTextDefault("Business Details"),
      address: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
        },
      },
      phone: {
        field: "mainPhone",
        constantValue: "",
      },
      websiteLabel: createTextDefault(""),
      websiteLink: {
        field: "websiteUrl",
        constantValue: "",
      },
      socialLinks: [
        {
          label: createTextDefault("Google"),
          link: createLinkDefault("https://www.google.com"),
          icon: "google",
        },
        {
          label: createTextDefault("Facebook"),
          link: {
            field: "facebookPageUrl",
            constantValue: "{SOCM.icon1pagelink}",
          },
          icon: "facebook",
        },
        {
          label: createTextDefault("Instagram"),
          link: createLinkDefault("//instagram.com/"),
          icon: "instagram",
        },
        {
          label: createTextDefault("Twitter"),
          link: createLinkDefault("{SOCM.icon2pagelink}"),
          icon: "twitter",
        },
      ],
      aboutHeading: createTextDefault("About"),
      aboutCategory: createTextDefault("Dental Practice"),
      aboutItems: {
        field: "",
        constantValue: [
          "Comprehensive preventive dental exams and cleanings",
          "Cosmetic dentistry and whitening treatments",
          "Restorative care to protect long-term oral health",
          "Friendly scheduling support and patient education",
        ],
        constantValueEnabled: true,
      },
      hoursHeading: createTextDefault("Hours"),
      hours: {
        field: "hours",
        constantValue: {},
      },
      locationHeading: createTextDefault("Location"),
      locationImage: {
        field: "",
        constantValue: {
          url: "",
          width: 0,
          height: 0,
        },
        constantValueEnabled: false,
      },
      locationTitle: {
        field: "name",
        constantValue: {
          defaultValue: "Round Valley Dental Center",
          hasLocalizedValue: "true",
        },
      },
      locationAddress: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
        },
      },
      locationCtaLabel: createTextDefault("Get Directions"),
      locationCtaLink: createLinkDefault(""),
    },
    render: Hs1CarmelCoreInformationSectionComponent,
  };
