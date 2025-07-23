import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider, LinkType } from "@yext/pages-components";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  Image,
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  CTA,
  Heading,
  PageSection,
  YextField,
  VisibilityWrapper,
  CTAProps,
  resolveYextStructField,
  YextStructFieldSelector,
  YextStructEntityField,
  ComponentFields,
  TranslatableString,
  resolveTranslatableString,
  msg,
  pt,
} from "@yext/visual-editor";

const PLACEHOLDER_IMAGES = {
  default: {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  "simple-centered": {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  "split-w-image": {
    url: "https://placehold.co/2102x1401",
    height: 1401,
    width: 2102,
  },
  "angled-image": {
    url: "https://placehold.co/1587x1058",
    height: 1058,
    width: 1587,
  },
  "offset-image": {
    url: "https://placehold.co/1280x1067",
    height: 1067,
    width: 1280,
  },
  "image-tiles": {
    url: "https://placehold.co/528x792",
    height: 792,
    width: 528,
  },
};

export interface TestHeroProps {
  data: {
    businessName: YextEntityField<TranslatableString>;
    localGeoModifier: YextEntityField<TranslatableString>;
    hero: YextStructEntityField<{
      primaryCta?: {
        label: TranslatableString;
        link: string;
        linkType: LinkType;
      };
      image?: {
        url: string;
        height: number;
        width: number;
      };
    }>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    imageOrientation: "left" | "right";
    businessNameLevel: HeadingLevel;
    localGeoModifierLevel: HeadingLevel;
    primaryCTA: CTAProps["variant"];
    variant:
      | "default"
      | "simple-centered"
      | "split-w-image"
      | "angled-image"
      | "offset-image"
      | "image-tiles";
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility?: boolean;
}

const testHeroFields: Fields<TestHeroProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      businessName: YextField<any, TranslatableString>(
        msg("fields.businessName", "Business Name"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        },
      ),
      localGeoModifier: YextField<any, TranslatableString>(
        msg("fields.localGeomodifier", "Local GeoModifier"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        },
      ),
      hero: YextStructFieldSelector({
        label: msg("fields.hero", "Hero"),
        filter: {
          type: ComponentFields.HeroSection.type,
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "select",
        options: [
          { label: msg("fields.options.default", "Default"), value: "default" },
          {
            label: msg("fields.options.simpleCentered", "Simple Centered"),
            value: "simple-centered",
          },
          {
            label: msg("fields.options.splitWithImage", "Split with Image"),
            value: "split-w-image",
          },
          {
            label: msg("fields.options.angledImage", "Angled Image"),
            value: "angled-image",
          },
          {
            label: msg("fields.options.offsetImage", "Offset Image"),
            value: "offset-image",
          },
          {
            label: msg("fields.options.imageTiles", "Image Tiles"),
            value: "image-tiles",
          },
        ],
      }),
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        },
      ),
      imageOrientation: YextField(
        msg("fields.imageOrientation", "Image Orientation"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.left", "Left"), value: "left" },
            { label: msg("fields.options.right", "Right"), value: "right" },
          ],
        },
      ),
      businessNameLevel: YextField(
        msg("fields.businessNameHeadingLevel", "Business Name Heading Level"),
        {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        },
      ),
      localGeoModifierLevel: YextField(
        msg(
          "fields.localGeomodifierHeadingLevel",
          "Local GeoModifier Heading Level",
        ),
        {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        },
      ),
      primaryCTA: YextField(
        msg("fields.primaryCTAVariant", "Primary CTA Variant"),
        {
          type: "radio",
          options: "CTA_VARIANT",
        },
      ),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    },
  ),
};

const TestHeroWrapper = ({ data, styles }: TestHeroProps) => {
  const document = useDocument() as any;
  const resolvedBusinessName = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(document, data?.businessName),
    "en",
  );
  const resolvedLocalGeoModifier = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(
      document,
      data?.localGeoModifier,
    ),
    "en",
  );
  const resolvedHero = resolveYextStructField(document, data?.hero);

  const renderContent = () => (
    <div className="flex flex-col justify-center gap-y-6 w-full break-words md:gap-y-8">
      <header className="flex flex-col gap-y-4" aria-label="Hero Header">
        <section
          className="flex flex-col gap-y-0"
          aria-label="Business Information"
        >
          {resolvedBusinessName && (
            <EntityField
              displayName={pt("fields.businessName", "Business Name")}
              fieldId={data?.businessName.field}
              constantValueEnabled={data?.businessName.constantValueEnabled}
            >
              <Heading level={styles?.businessNameLevel}>
                {resolvedBusinessName}
              </Heading>
            </EntityField>
          )}
          {resolvedLocalGeoModifier && (
            <EntityField
              displayName={pt("fields.localGeomodifier", "Local GeoModifier")}
              fieldId={data?.localGeoModifier.field}
              constantValueEnabled={data?.localGeoModifier.constantValueEnabled}
            >
              <Heading level={styles?.localGeoModifierLevel}>
                {resolvedLocalGeoModifier}
              </Heading>
            </EntityField>
          )}
        </section>
      </header>
      {resolvedHero?.primaryCta?.label && (
        <div
          className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
          aria-label="Call to Actions"
        >
          <EntityField
            displayName={pt("fields.primaryCta", "Primary CTA")}
            fieldId={data.hero.field}
            constantValueEnabled={data.hero.constantValueOverride.primaryCta}
          >
            <CTA
              eventName={`primaryCta`}
              variant={styles?.primaryCTA}
              label={resolveTranslatableString(
                resolvedHero.primaryCta.label,
                "en",
              )}
              link={resolvedHero.primaryCta.link}
              linkType={resolvedHero.primaryCta.linkType}
              className={"py-3"}
            />
          </EntityField>
        </div>
      )}
    </div>
  );

  const renderImage = () => {
    if (!resolvedHero?.image) return null;

    return (
      <EntityField
        displayName={pt("fields.image", "Image")}
        fieldId={data.hero.field}
        constantValueEnabled={data.hero.constantValueOverride.image}
      >
        <div className="w-full" role="region" aria-label="Hero Image">
          <Image
            image={resolvedHero?.image}
            layout="auto"
            aspectRatio={resolvedHero?.image.width / resolvedHero?.image.height}
          />
        </div>
      </EntityField>
    );
  };

  switch (styles.variant) {
    case "simple-centered":
      return (
        <PageSection
          background={styles.backgroundColor}
          aria-label="Test Hero Banner"
          className="relative isolate px-6 pt-14 lg:px-8"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
            />
          </div>
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">{renderContent()}</div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
            />
          </div>
        </PageSection>
      );

    case "split-w-image":
      return (
        <PageSection
          background={styles.backgroundColor}
          aria-label="Test Hero Banner"
          className="relative"
        >
          <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
            <div className="px-6 pt-10 pb-24 sm:pb-32 lg:col-span-7 lg:px-0 lg:pt-40 lg:pb-48 xl:col-span-6">
              <div className="mx-auto max-w-lg lg:mx-0">{renderContent()}</div>
            </div>
            <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
              {renderImage()}
            </div>
          </div>
        </PageSection>
      );

    case "angled-image":
      return (
        <PageSection
          background={styles.backgroundColor}
          aria-label="Test Hero Banner"
          className="relative"
        >
          <div className="mx-auto max-w-7xl">
            <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block"
              >
                <polygon points="0,0 90,0 50,100 0,100" />
              </svg>
              <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            {renderImage()}
          </div>
        </PageSection>
      );

    case "offset-image":
      return (
        <PageSection
          background={styles.backgroundColor}
          aria-label="Test Hero Banner"
          className="relative isolate overflow-hidden bg-linear-to-b from-indigo-100/20 pt-14"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl ring-1 shadow-indigo-600/10 ring-indigo-50 sm:-mr-80 lg:-mr-96"
          />
          <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
              <div className="lg:col-span-2 xl:col-auto">
                {resolvedLocalGeoModifier && (
                  <EntityField
                    displayName={pt(
                      "fields.localGeomodifier",
                      "Local GeoModifier",
                    )}
                    fieldId={data?.localGeoModifier.field}
                    constantValueEnabled={
                      data?.localGeoModifier.constantValueEnabled
                    }
                  >
                    <Heading level={styles?.localGeoModifierLevel}>
                      {resolvedLocalGeoModifier}
                    </Heading>
                  </EntityField>
                )}
              </div>
              <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
                {resolvedBusinessName && (
                  <EntityField
                    displayName={pt("fields.businessName", "Business Name")}
                    fieldId={data?.businessName.field}
                    constantValueEnabled={
                      data?.businessName.constantValueEnabled
                    }
                  >
                    <Heading level={styles?.businessNameLevel}>
                      {resolvedBusinessName}
                    </Heading>
                  </EntityField>
                )}
                {resolvedHero?.primaryCta?.label && (
                  <div className="mt-10 flex items-center gap-x-6">
                    <EntityField
                      displayName={pt("fields.primaryCta", "Primary CTA")}
                      fieldId={data.hero.field}
                      constantValueEnabled={
                        data.hero.constantValueOverride.primaryCta
                      }
                    >
                      <CTA
                        eventName={`primaryCta`}
                        variant={styles?.primaryCTA}
                        label={resolveTranslatableString(
                          resolvedHero.primaryCta.label,
                          "en",
                        )}
                        link={resolvedHero.primaryCta.link}
                        linkType={resolvedHero.primaryCta.linkType}
                        className={"py-3"}
                      />
                    </EntityField>
                  </div>
                )}
              </div>
              <div className="mt-10 aspect-6/5 w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2 xl:mt-36">
                {renderImage()}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-white sm:h-32" />
        </PageSection>
      );

    case "image-tiles":
      return (
        <PageSection
          background={styles.backgroundColor}
          aria-label="Test Hero Banner"
          className="relative isolate"
        >
          <svg
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-256 w-full mask-[radial-gradient(32rem_32rem_at_center,white,transparent)] stroke-gray-200"
          >
            <defs>
              <pattern
                x="50%"
                y={-1}
                id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
                width={200}
                height={200}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect
              fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)"
              width="100%"
              height="100%"
              strokeWidth={0}
            />
          </svg>
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 left-1/2 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
          >
            <div
              style={{
                clipPath:
                  "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
              }}
              className="aspect-801/1036 w-200.25 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            />
          </div>
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pt-36 pb-32 sm:pt-60 lg:px-8 lg:pt-32">
              <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
                  {renderContent()}
                </div>
                <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                  <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-0 xl:pt-80">
                    <div className="relative">
                      {renderImage()}
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageSection>
      );

    default:
      return (
        <PageSection
          background={styles.backgroundColor}
          aria-label="Test Hero Banner"
          className={`flex flex-col gap-6 md:gap-10 ${
            styles.imageOrientation === "right"
              ? "md:flex-row"
              : "md:flex-row-reverse"
          }`}
        >
          {renderContent()}
          {renderImage()}
        </PageSection>
      );
  }
};

export const TestHero: ComponentConfig<TestHeroProps> = {
  label: msg("components.testHero", "Test Hero"),
  fields: testHeroFields,
  defaultProps: {
    data: {
      businessName: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "Test Business Name",
        },
      },
      localGeoModifier: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "Test GeoModifier",
        },
      },
      hero: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          primaryCta: {
            label: {
              en: "Test Call To Action",
            },
            link: "#",
            linkType: "URL",
          },
          image: PLACEHOLDER_IMAGES.default,
        },
        constantValueOverride: {
          image: true,
          primaryCta: true,
        },
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      imageOrientation: "right",
      businessNameLevel: 3,
      localGeoModifierLevel: 1,
      primaryCTA: "primary",
      variant: "default",
    },
    analytics: {
      scope: "testHeroSection",
    },
    liveVisibility: true,
  },
  resolveFields: (data, { lastData }) => {
    if (
      !data.props.data.hero.constantValueEnabled &&
      data.props.data.hero.field === ""
    ) {
      data.props.liveVisibility = false;
      return {
        ...testHeroFields,
        liveVisibility: undefined,
      };
    }

    if (
      (data.props.data.hero.constantValueEnabled &&
        !lastData?.props.data.hero.constantValueEnabled &&
        data.props.data.hero.field === "") ||
      (lastData?.props.data.hero.field === "" &&
        data.props.data.hero.field !== "")
    ) {
      data.props.liveVisibility = true;
    }

    // Update placeholder image based on variant
    if (data.props.data.hero.constantValueEnabled) {
      data.props.data.hero.constantValue.image =
        PLACEHOLDER_IMAGES[data.props.styles.variant];
    }

    return testHeroFields;
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "testHeroSection"}>
      <VisibilityWrapper
        liveVisibility={!!props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <TestHeroWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
