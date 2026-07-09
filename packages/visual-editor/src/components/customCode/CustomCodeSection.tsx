import React from "react";
import { CodeXml } from "lucide-react";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { WithId, WithPuckProps } from "@puckeditor/core";
import { resolveEmbeddedFieldsInString } from "../../utils/resolveYextEntityField.ts";
import { processHandlebarsTemplate } from "./customCodeHandlebars.ts";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

type AnalyticsTrackProps = Parameters<
  NonNullable<ReturnType<typeof useAnalytics>>["track"]
>[0];

type CustomCodeAnalyticsData = Record<string, unknown> & {
  action?: AnalyticsTrackProps["action"];
};

/** The default analytics action used when Custom Code scripts do not provide one. */
const DEFAULT_CUSTOM_CODE_ANALYTICS_ACTION: AnalyticsTrackProps["action"] =
  "C_CUSTOM";

type CustomCodeAnalyticsBridge = {
  track: (eventName: string, data?: CustomCodeAnalyticsData) => void;
};

type YextCustomCodeAnalytics = {
  register: (
    componentId: string,
    analyticsBridge: CustomCodeAnalyticsBridge
  ) => void;
  unregister: (componentId: string) => void;
  track: (
    componentId: string,
    eventName: string,
    data?: CustomCodeAnalyticsData
  ) => void;
};

declare global {
  interface Window {
    YextCustomCodeAnalytics?: YextCustomCodeAnalytics;
  }
}

/**
 * Creates or returns the shared browser analytics bridge used by CustomCodeSection scripts.
 * Each CustomCodeSection registers its scoped analytics instance by componentId so multiple
 * custom code components can coexist without overwriting each other's analytics handlers.
 */
const getYextCustomCodeAnalytics = (): YextCustomCodeAnalytics => {
  if (window.YextCustomCodeAnalytics) {
    return window.YextCustomCodeAnalytics;
  }

  const scopes: Record<string, CustomCodeAnalyticsBridge> = {};

  window.YextCustomCodeAnalytics = {
    register(componentId, analyticsBridge) {
      scopes[componentId] = analyticsBridge;
    },
    unregister(componentId) {
      delete scopes[componentId];
    },
    track(componentId, eventName, data) {
      const scope = scopes[componentId];

      if (!scope) {
        console.warn(
          `No Custom Code analytics scope found for componentId: ${componentId}`
        );
        return;
      }

      scope.track(eventName, data);
    },
  };

  return window.YextCustomCodeAnalytics;
};

export interface CustomCodeSectionProps {
  /**
   * The HTML content to be rendered. Must be present for the component to display.
   * If not provided, the component will display a message prompting the user to add HTML.
   * This data is expected to have already been sanitized.
   */
  html: string;

  /**
   * The CSS styles to be applied to the component.
   */
  css: string;

  /**
   * The JavaScript code to be added as a script tag in the component.
   */
  javascript: string;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;

  /** @internal */
  analytics: {
    scope?: string;
  };
}

const customCodeSectionFields: YextFields<CustomCodeSectionProps> = {
  html: {
    label: msg("fields.html", "HTML"),
    type: "code",
    codeLanguage: "html",
  },
  css: {
    label: msg("fields.css", "CSS"),
    type: "code",
    codeLanguage: "css",
  },
  javascript: {
    label: msg("fields.javascript", "JavaScript"),
    type: "code",
    codeLanguage: "javascript",
  },
  liveVisibility: {
    label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
    type: "radio",
    options: [
      { label: msg("fields.options.show", "Show"), value: true },
      { label: msg("fields.options.hide", "Hide"), value: false },
    ],
  },
  analytics: {
    type: "object",
    label: msg("fields.analytics", "Analytics"),
    visible: false,
    objectFields: {
      scope: {
        label: msg("fields.scope", "Scope"),
        type: "text",
      },
    },
  },
};

const EmptyCustomCodeSection = () => {
  return (
    <div className="p-3">
      <div className="flex flex-col items-center justify-center gap-4 p-3 bg-gray-100 rounded-md">
        <CodeXml className="w-12 h-12 text-gray-300" />
        <span className="text-gray-500 text-lg font-medium font-body-fontFamily">
          {pt("missingHtmlWidget", "Add HTML to view component")}
        </span>
      </div>
    </div>
  );
};

/**
 * Registers the current component's scoped analytics bridge before executing user JavaScript.
 * This ensures injected scripts can call `yextAnalytics.track(...)` immediately while still
 * using the AnalyticsScopeProvider context for this CustomCodeSection instance.
 */
const CustomCodeAnalyticsBridgeAndScriptRunner = ({
  componentId,
  containerRef,
  processedJavascript,
  scriptTagId,
}: {
  componentId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  processedJavascript: string;
  scriptTagId: string;
}) => {
  const analytics = useAnalytics();

  React.useEffect(() => {
    if (!containerRef.current || !processedJavascript) {
      return;
    }

    const customCodeAnalytics = getYextCustomCodeAnalytics();
    customCodeAnalytics.register(componentId, {
      track: (eventName, data) => {
        analytics?.track({
          ...data,
          action: data?.action ?? DEFAULT_CUSTOM_CODE_ANALYTICS_ACTION,
          eventName,
        });
      },
    });

    const prevScript = containerRef.current.querySelector(`#${scriptTagId}`);
    if (prevScript) {
      prevScript.remove();
    }

    const script = document.createElement("script");
    script.id = scriptTagId;
    script.type = "text/javascript";
    // Wrap user code in a block so each component gets a local yextAnalytics helper without leaking a global.
    script.text = `
{
  const yextAnalytics = {
    track: (eventName, data) =>
      window.YextCustomCodeAnalytics.track(${JSON.stringify(componentId)}, eventName, data),
  };

${processedJavascript}
}
`;
    containerRef.current.appendChild(script);

    return () => {
      script.remove();
      customCodeAnalytics.unregister(componentId);
    };
  }, [analytics, componentId, processedJavascript, scriptTagId]);

  return null;
};

const CustomCodeSectionWrapper = ({
  id,
  html,
  css,
  javascript,
  puck,
}: WithId<WithPuckProps<CustomCodeSectionProps>>) => {
  const streamDocument = useDocument();
  const locale = streamDocument?.locale;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scriptIdRef = React.useRef<number>(Math.floor(Math.random() * 1e9));
  const scriptTagId = `custom-code-section-script-${scriptIdRef.current}`;

  const processedHtml = processHandlebarsTemplate(html, streamDocument);
  const processedJavascript = resolveEmbeddedFieldsInString(
    javascript,
    streamDocument,
    locale
  );

  if (!processedHtml) {
    return puck.isEditing ? <EmptyCustomCodeSection /> : null;
  }

  return (
    <div>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      <CustomCodeAnalyticsBridgeAndScriptRunner
        componentId={id}
        containerRef={containerRef}
        processedJavascript={processedJavascript}
        scriptTagId={scriptTagId}
      />
    </div>
  );
};

/**
 * The CustomCodeSection component allows you to add custom HTML, CSS, and JavaScript to your page.
 * It is useful for integrating third-party widgets or custom scripts that are not supported by the visual editor natively.
 */
export const CustomCodeSection: YextComponentConfig<CustomCodeSectionProps> = {
  label: msg("components.customCodeSection", "Custom Code Section"),
  fields: customCodeSectionFields,
  defaultProps: {
    html: "",
    css: "",
    javascript: "",
    liveVisibility: true,
    analytics: {
      scope: "customCodeSection",
    },
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={props.analytics?.scope ?? "customCodeSection"}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
        iconSize="md"
      >
        <CustomCodeSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
