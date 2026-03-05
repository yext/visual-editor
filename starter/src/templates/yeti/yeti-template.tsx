import "@yext/visual-editor/editor.css";
import {
  GetHeadConfig,
  GetPath,
  HeadConfig,
  Template,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
  TransformProps,
} from "@yext/pages";
import React from "react";
import { Render } from "@puckeditor/core";
import { SchemaWrapper } from "@yext/pages-components";
import {
  VisualEditorProvider,
  applyTheme,
  defaultThemeConfig,
  applyAnalytics,
  applyHeaderScript,
  getSchema,
  injectTranslations,
  YetiHeaderSection,
  YetiLocationHeroSection,
  YetiStoreInfoSection,
  YetiPromoBannerSection,
  defaultYetiReservePromoBannerSectionProps,
  YetiExploreCarouselSection,
  YetiFaqSection,
  YetiFooterSection,
} from "@yext/visual-editor";
import { yetiConfig } from "./yeti-config";

export const config = {
  name: "yeti-location",
  stream: {
    $id: "yeti-location-stream",
    filter: {
      entityTypes: ["location"],
    },
    fields: [
      "id",
      "uid",
      "meta",
      "slug",
      "locale",
      "name",
      "address",
      "mainPhone",
      "hours",
      "yextDisplayCoordinate",
    ],
    localization: {
      locales: ["en"],
    },
  },
  additionalProperties: {
    isVETemplate: true,
  },
} as const satisfies TemplateConfig;

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (
  data,
): HeadConfig => {
  const { document, relativePrefixToRoot } = data;
  const schema = getSchema(data);

  return {
    title: document.name,
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    tags: [
      {
        type: "link",
        attributes: {
          rel: "icon",
          type: "image/x-icon",
        },
      },
    ],
    other: [
      applyAnalytics(document),
      applyHeaderScript(document),
      applyTheme(document, relativePrefixToRoot, defaultThemeConfig),
      SchemaWrapper(schema),
    ].join("\n"),
  };
};

export const transformProps: TransformProps<TemplateProps<any>> = async (
  data,
) => {
  const translations = await injectTranslations(data.document);
  return { ...data, translations };
};

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  const localePath = document.locale !== "en" ? `${document.locale}/` : "";
  return document.address
    ? `${localePath}${document.address.region}/${document.address.city}/${document.address.line1}-${document.id.toString()}`
    : `${localePath}${document.id.toString()}`;
};

const defaultLayoutData = {
  root: { props: {} },
  content: [
    {
      type: "YetiHeaderSection",
      props: YetiHeaderSection.defaultProps,
    },
    {
      type: "YetiLocationHeroSection",
      props: YetiLocationHeroSection.defaultProps,
    },
    {
      type: "YetiStoreInfoSection",
      props: YetiStoreInfoSection.defaultProps,
    },
    {
      type: "YetiPromoBannerSection",
      props: YetiPromoBannerSection.defaultProps,
    },
    {
      type: "YetiExploreCarouselSection",
      props: YetiExploreCarouselSection.defaultProps,
    },
    {
      type: "YetiPromoBannerSection",
      props: defaultYetiReservePromoBannerSectionProps,
    },
    {
      type: "YetiFaqSection",
      props: YetiFaqSection.defaultProps,
    },
    {
      type: "YetiFooterSection",
      props: YetiFooterSection.defaultProps,
    },
  ],
};

const YetiLocationTemplate: Template<TemplateRenderProps> = (props) => {
  const { document } = props;

  const layoutData =
    (document as { __?: { layout?: typeof defaultLayoutData } }).__?.layout ??
    defaultLayoutData;

  return (
    <VisualEditorProvider templateProps={props}>
      <Render
        config={yetiConfig}
        data={layoutData}
        metadata={{ streamDocument: document }}
      />
    </VisualEditorProvider>
  );
};

export default YetiLocationTemplate;
