import React from "react";
import { useTranslation } from "react-i18next";
import { CodeXml } from "lucide-react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  VisibilityWrapper,
  YextField,
  msg,
  useDocument,
} from "@yext/visual-editor";
import { ComponentConfig, Fields, WithId, WithPuckProps } from "@measured/puck";

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

const customCodeSectionFields: Fields<CustomCodeSectionProps> = {
  html: YextField(msg("fields.html", "HTML"), {
    type: "code",
    codeLanguage: "html",
  }),
  css: YextField(msg("fields.css", "CSS"), {
    type: "code",
    codeLanguage: "css",
  }),
  javascript: YextField(msg("fields.javascript", "JavaScript"), {
    type: "code",
    codeLanguage: "javascript",
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
};

const EmptyCustomCodeSection = () => {
  const { t } = useTranslation();

  return (
    <div className="p-3">
      <div className="flex flex-col items-center justify-center gap-4 p-3 bg-gray-100 rounded-md">
        <CodeXml className="w-12 h-12 text-gray-300" />
        <span className="text-gray-500 text-lg font-medium font-body-fontFamily">
          {t("missingHtmlWidget", "Add HTML to view component")}
        </span>
      </div>
    </div>
  );
};

/**
 * Safely resolves a nested property path from an object.
 * @param path The path to resolve (e.g., "address.city").
 * @param obj The object to resolve the path from.
 * @returns The value at the specified path, or the original path wrapped in braces if not found.
 */
const resolvePath = (path: string, obj: any): any => {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
};

/**
 * Escapes special characters in a string for use in HTML.
 * @param str The string to escape.
 * @returns The escaped string.
 */
const escapeHtml = (str: any): string => {
  if (typeof str !== "string") {
    // If the value is not a string (e.g., a number), convert it to one.
    str = String(str);
  }
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Replaces placeholders in an HTML string with escaped data from an object.
 * @param templateString The HTML string containing placeholders.
 * @param data The data object to source values from.
 * @returns The interpolated HTML string.
 */
const interpolateHtmlString = (templateString: string, data: any): string => {
  if (!templateString) {
    return "";
  }
  return templateString.replace(/{{(.*?)}}/g, (match, path) => {
    const value = resolvePath(path.trim(), data);
    return value !== undefined ? escapeHtml(value) : match;
  });
};

/**
 * Replaces placeholders in a JavaScript string with JSON-stringified data from an object.
 * This makes the data safe to be embedded directly into JavaScript code.
 * Note: Placeholders in the JS template should NOT be wrapped in quotes.
 * E.g., use `const name = {{name}};` instead of `const name = '{{name}}';`
 * @param templateString The JavaScript string containing placeholders.
 * @param data The data object to source values from.
 * @returns The interpolated JavaScript string.
 */
const interpolateJsString = (templateString: string, data: any): string => {
  if (!templateString) {
    return "";
  }
  return templateString.replace(/{{(.*?)}}/g, (match, path) => {
    const value = resolvePath(path.trim(), data);
    if (value === undefined) {
      return match; // Keep placeholder if value not found
    }

    // If the value is a string, escape its content for injection into another string.
    // This assumes the user will provide quotes in the template, e.g., '{{myString}}'.
    if (typeof value === "string") {
      return value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
    }

    // For all other types (number, boolean, object, array, null),
    // JSON.stringify is the safest way to create a literal representation.
    // This assumes the user will NOT provide quotes, e.g., const user = {{userObject}};
    return JSON.stringify(value);
  });
};

const CustomCodeSectionWrapper = ({
  html,
  css,
  javascript,
  puck,
}: WithId<WithPuckProps<CustomCodeSectionProps>>) => {
  if (!html) {
    return puck.isEditing ? <EmptyCustomCodeSection /> : null;
  }

  const streamDocument = useDocument();

  // Use the context-specific interpolation functions
  const resolvedHtml = React.useMemo(
    () => interpolateHtmlString(html, streamDocument),
    [html, streamDocument]
  );

  const resolvedJavascript = React.useMemo(
    () => interpolateJsString(javascript, streamDocument),
    [javascript, streamDocument]
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scriptIdRef = React.useRef<number>(Math.floor(Math.random() * 1e9));
  const scriptTagId = `custom-code-section-script-${scriptIdRef.current}`;

  React.useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const prevScript = containerRef.current.querySelector(`#${scriptTagId}`);
    if (prevScript) {
      prevScript.remove();
    }

    if (resolvedJavascript) {
      const script = document.createElement("script");
      script.id = scriptTagId;
      script.type = "text/javascript";
      script.innerHTML = resolvedJavascript;
      containerRef.current.appendChild(script);
    }
  }, [resolvedJavascript, resolvedHtml]);

  return (
    <div>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: resolvedHtml }}
      />
    </div>
  );
};

/**
 * The CustomCodeSection component allows you to add custom HTML, CSS, and JavaScript to your page.
 * It is useful for integrating third-party widgets or custom scripts that are not supported by the visual editor natively.
 * Only available with additional feature flag enabled.
 */
export const CustomCodeSection: ComponentConfig<CustomCodeSectionProps> = {
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
