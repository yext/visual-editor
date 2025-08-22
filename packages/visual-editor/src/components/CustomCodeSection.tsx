import React from "react";
import Handlebars from "handlebars";
import { useTranslation } from "react-i18next";
import { CodeXml } from "lucide-react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  VisibilityWrapper,
  YextField,
  msg,
  useDocument,
  StreamDocument,
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
 * Compiles and renders a Handlebars template string with the provided data if Handlebars syntax is detected.
 *
 * If the HTML string contains Handlebars expressions (e.g., {{name}}), this function will compile and render
 * the template using the given data (typically the stream document). If compilation or rendering fails, or if
 * no Handlebars expressions are present, the original HTML string is returned.
 *
 * @param html - The HTML string, possibly containing Handlebars template syntax.
 * @param data - The data object to use for template rendering (e.g., streamDocument).
 * @returns The processed HTML string with Handlebars expressions replaced, or the original HTML if not applicable.
 */
function processHandlebarsTemplate(html: string, data: StreamDocument): string {
  console.log("process data", data);

  if (!html) {
    return html;
  }
  // Only process if handlebars syntax is present
  if (/{{[^}]+}}/.test(html)) {
    try {
      const template = Handlebars.compile(html);
      return template(data);
    } catch {
      return html;
    }
  }
  return html;
}

const CustomCodeSectionWrapper = ({
  html,
  css,
  javascript,
  puck,
}: WithId<WithPuckProps<CustomCodeSectionProps>>) => {
  const streamDocument = useDocument();
  console.log("Stream Document on Live Page:", streamDocument);
  const processedHtml = React.useMemo(
    () => processHandlebarsTemplate(html, streamDocument),
    [html, streamDocument]
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

    if (javascript) {
      const script = document.createElement("script");
      script.id = scriptTagId;
      script.type = "text/javascript";
      script.innerHTML = javascript;
      containerRef.current.appendChild(script);
    }
  }, [javascript, processedHtml]);

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
    </div>
  );
};

/**
 * The CustomCodeSection component allows you to add custom HTML, CSS, and JavaScript to your page.
 *
 * ### Handlebars Template Support
 *
 * The html field supports [Handlebars](https://handlebarsjs.com/) template syntax. If your HTML contains Handlebars expressions (e.g., {{name}}),
 * they will be rendered using the current document data ("streamDocument"). This allows you to dynamically display data from the entity or stream.
 *
 * #### Example Usage
 *
 * Suppose your document data contains a list of products:
 *
 * ```json
 * {
 *   "c_exampleProducts": {
 *     "products": [
 *       { "name": "Galaxy Burger", "image": { "url": "https://example.com/burger.jpg" } },
 *       { "name": "Galaxy Salad", "image": { "url": "https://example.com/salad.jpg" } }
 *     ]
 *   }
 * }
 * ```
 *
 * You can use the following HTML template in the CustomCodeSection:
 *
 * ```html
 * <ul>
 *   {{#each c_exampleProducts.products}}
 *     <li>
 *       <strong>{{name}}</strong>
 *       {{#if image.url}}
 *         <br />
 *         <img src="{{image.url}}" alt="{{name}}" style="max-width:200px;" />
 *       {{/if}}
 *     </li>
 *   {{/each}}
 * </ul>
 * ```
 *
 * This will render a list of product names and images from your document data.
 *
 * #### Notes
 * - You can use any valid Handlebars syntax, including #each, #if, and triple-stash {{{...}}} for raw HTML.
 * - The template is rendered server-side with the document data available to the component.
 * - If the HTML does not contain Handlebars expressions, it will be rendered as static HTML.
 *
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
