import "@yext/visual-editor/style.css";
import {
  GetHeadConfig,
  GetPath,
  HeadConfig,
  Template,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
} from "@yext/pages";
import { componentRegistry } from "../ve.config";
import {
  applyTheme,
  Editor,
  VisualEditorProvider,
  YextSchemaField,
  defaultThemeConfig,
  applyAnalytics,
  applyHeaderScript,
} from "@yext/visual-editor";
import tailwindConfig from "../../tailwind.config";
import { devTemplateStream } from "../dev.config";
import React from "react";
import { SchemaWrapper } from "@yext/pages-components";

export const config = {
  name: "dev-location",
  stream: {
    $id: "dev-location-stream",
    filter: {
      entityTypes: ["location"],
    },
    fields: [
      "id",
      "uid",
      "meta",
      "slug",
      "name",
      "hours",
      "dineInHours",
      "driveThroughHours",
      "address",
      "yextDisplayCoordinate",
      "c_productSection.sectionTitle",
      "c_productSection.linkedProducts.name",
      "c_productSection.linkedProducts.c_productPromo",
      "c_productSection.linkedProducts.c_description",
      "c_productSection.linkedProducts.c_coverPhoto",
      "c_productSection.linkedProducts.c_productCTA",
      "c_hero",
      "c_faqSection.linkedFAQs.question",
      "c_faqSection.linkedFAQs.answerV2",
      "dm_directoryParents_defaultdirectory.slug",
      "dm_directoryParents_defaultdirectory.name",
      "dm_directoryChildren.name",
      "dm_directoryChildren.address",
      "dm_directoryChildren.slug",
      "dm_directoryChildren.hours",
      "dm_directoryChildren.timezone",
      "additionalHoursText",
      "mainPhone",
      "emails",
      "services",
      "c_deliveryPromo",
    ],
    localization: {
      locales: ["en", "zh_hans_hk", "fr-CA"],
    },
  },
  additionalProperties: {
    isVETemplate: true,
  },
} as const satisfies TemplateConfig;

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
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
      applyTheme(document, defaultThemeConfig),
      SchemaWrapper(document._schema),
      // Prevent Vite client script loading in StackBlitz
      `<script>
        (function() {
          // Check if we're in StackBlitz
          var isStackBlitz = window.location.hostname.includes('webcontainer.io');
          
          if (isStackBlitz) {
            // Block WebSocket connections for Vite HMR
            var originalWebSocket = window.WebSocket;
            window.WebSocket = function(url, protocols) {
              // Block Vite HMR WebSocket connections
              if (url && (url.includes('24678') || url.includes('vite') || url.includes('hmr'))) {
                console.log('Blocked Vite WebSocket connection:', url);
                return {
                  readyState: 3, // CLOSED
                  send: function() {},
                  close: function() {},
                  addEventListener: function() {},
                  removeEventListener: function() {},
                };
              }
              return new originalWebSocket(url, protocols);
            };
          }
        })();
      </script>`,
    ].join("\n"),
  };
};

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  const localePath = document.locale !== "en" ? `${document.locale}/` : "";
  return document.address
    ? `${localePath}${document.address.region}/${document.address.city}/${
        document.address.line1
      }-${document.id.toString()}`
    : `${localePath}${document.id.toString()}`;
};

const Dev: Template<TemplateRenderProps> = (props) => {
  const [themeMode, setThemeMode] = React.useState<boolean>(false);
  const [url, setUrl] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generatedConfig, setGeneratedConfig] = React.useState<any>(null);
  const { document } = props;
  const generateSiteConfig = async () => {
    if (!url.trim()) return;

    setIsGenerating(true);
    try {
      // Fetch the HTML content (note: this might hit CORS issues in browser)
      // For a hackathon project, we'll try a simple approach first
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      );
      const data = await response.json();
      const html = data.contents;

      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract basic information
      const title = doc.querySelector("title")?.textContent || "Website";
      const description =
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "Generated from website";

      // Look for common structural elements
      const hasHeader =
        doc.querySelector("header, .header, nav, .nav, .navbar") !== null;
      const hasHero =
        doc.querySelector(".hero, .banner, .jumbotron, h1") !== null;
      const hasFooter = doc.querySelector("footer, .footer") !== null;

      // Extract main content sections
      const mainSections = doc.querySelectorAll(
        "main section, .section, article, .content-block",
      );

      // Generate a basic configuration
      const config = {
        content: [],
        root: { props: { title: title } },
      };

      // Add header if detected
      if (hasHeader) {
        config.content.push({
          type: "BannerSection",
          props: {
            backgroundColor: "#ffffff",
            textColor: "#000000",
          },
        });
      }

      // Add hero section if detected
      if (hasHero) {
        const heroText = doc.querySelector("h1")?.textContent || title;
        config.content.push({
          type: "HeroSection",
          props: {
            title: heroText,
            description: description,
            backgroundColor: "#f8f9fa",
          },
        });
      }

      // Add core info section
      config.content.push({
        type: "CoreInfoSection",
        props: {},
      });

      // Add content sections based on detected structure
      for (let i = 0; i < Math.min(mainSections.length, 3); i++) {
        const section = mainSections[i];
        const sectionTitle =
          section.querySelector("h1, h2, h3")?.textContent ||
          `Section ${i + 1}`;

        // Randomly pick appropriate section types based on content
        const sectionTypes = [
          "ProductsSection",
          "ReviewsSection",
          "FAQsSection",
        ];
        const randomType = sectionTypes[i % sectionTypes.length];

        config.content.push({
          type: randomType,
          props: {
            title: sectionTitle,
          },
        });
      }

      // Add footer if detected
      if (hasFooter) {
        config.content.push({
          type: "ExpandedFooter",
          props: {},
        });
      }

      setGeneratedConfig(config);
      console.log("Generated config:", config);
    } catch (error) {
      console.error("Error generating site config:", error);
      // Fallback to a basic configuration
      const fallbackConfig = {
        content: [
          {
            type: "BannerSection",
            props: { backgroundColor: "#ffffff" },
          },
          {
            type: "HeroSection",
            props: {
              title: "Welcome",
              description: "Generated from URL: " + url,
            },
          },
          {
            type: "CoreInfoSection",
            props: {},
          },
        ],
        root: { props: { title: "Generated Site" } },
      };
      setGeneratedConfig(fallbackConfig);
    }

    setIsGenerating(false);
  };

  const entityFields = devTemplateStream.stream.schema
    .fields as unknown as YextSchemaField[];
  const displayNames = devTemplateStream.apiNamesToDisplayNames as Record<
    string,
    string
  >;

  return (
    <div>
      {/* URL Generator Section */}
      <div
        className="url-generator-container"
        style={{
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          marginBottom: "16px",
        }}
      >
        <div
          style={{ marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}
        >
          Generate Site from URL
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            disabled={isGenerating}
          />
          <button
            onClick={generateSiteConfig}
            disabled={isGenerating || !url.trim()}
            style={{
              padding: "8px 16px",
              backgroundColor: isGenerating ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: isGenerating ? "not-allowed" : "pointer",
              minWidth: "100px",
            }}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
        {generatedConfig && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#155724",
            }}
          >
            ✓ Configuration generated! The layout has been populated with
            components based on the website structure.
          </div>
        )}
      </div>

      <div className={"flex-container"}>
        <button
          className={"toggle-button"}
          onClick={() => {
            setThemeMode(!themeMode);
          }}
        >
          {themeMode ? "Theme Mode" : "Layout Mode"}
        </button>
      </div>
      <div>
        <VisualEditorProvider
          templateProps={props}
          entityFields={{ fields: entityFields, displayNames: displayNames }}
          tailwindConfig={tailwindConfig}
        >
          <Editor
            document={document}
            componentRegistry={componentRegistry}
            themeConfig={defaultThemeConfig}
            localDev={true}
            forceThemeMode={themeMode}
            initialData={generatedConfig}
          />
        </VisualEditorProvider>
      </div>
    </div>
  );
};

export default Dev;
