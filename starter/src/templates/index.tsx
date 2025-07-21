import React from "react";
import {
  GetHeadConfig,
  GetPath,
  HeadConfig,
  Template,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
} from "@yext/pages";

export const config: TemplateConfig = {
  name: "index",
  stream: {
    $id: "index",
    filter: {
      entityTypes: ["ce_root"],
    },
    fields: [],
    localization: {
      locales: ["en"],
    },
  },
} as const;

export const getPath: GetPath<TemplateProps> = () => {
  return "index";
};

export const getHeadConfig: GetHeadConfig<
  TemplateRenderProps
> = (): HeadConfig => {
  return {
    title: "Visual Editor Starter",
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    other: [
      // StackBlitz redirect script - runs immediately when page loads
      `<script>
        (function() {
          // Check if we're in StackBlitz
          var isStackBlitz = window.location.hostname.includes('webcontainer.io');
          
          if (isStackBlitz) {
            // Redirect to entity page in StackBlitz
            window.location.replace('/dev-location/dm-city-arlington');
          }
        })();
      </script>`,
    ].join("\n"),
  };
};

const Index: Template<TemplateRenderProps> = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Visual Editor Starter
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the Yext Visual Editor starter template.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            In StackBlitz, you'll be redirected to an entity page automatically.
          </p>
          <p className="text-sm text-gray-500">
            Locally, you can navigate to entity pages manually.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
