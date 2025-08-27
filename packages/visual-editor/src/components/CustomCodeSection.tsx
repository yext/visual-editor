import React from "react";
import { useTranslation } from "react-i18next";
import { CodeXml } from "lucide-react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { VisibilityWrapper, YextField, msg } from "@yext/visual-editor";
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

const CustomCodeSectionWrapper = ({
  html,
  css,
  javascript,
  puck,
}: WithId<WithPuckProps<CustomCodeSectionProps>>) => {
  if (!html) {
    return puck.isEditing ? <EmptyCustomCodeSection /> : null;
  }

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
  }, [javascript, html]);

  return (
    <div>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

/**
 * The CustomCodeSection component allows you to add custom HTML, CSS, and JavaScript to your page.
 * It is useful for integrating third-party widgets or custom scripts that are not supported by the visual editor natively.
 * Only available with additional feature flag enabled.
 */
export const CustomCodeSection: ComponentConfig<{
  props: CustomCodeSectionProps;
}> = {
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
