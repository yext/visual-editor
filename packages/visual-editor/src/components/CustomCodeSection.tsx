import React from "react";
import createDOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import { CodeXml } from "lucide-react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { YextField, msg } from "@yext/visual-editor";
import { ComponentConfig, Fields, WithId, WithPuckProps } from "@measured/puck";

export interface CustomCodeSectionProps {
  html: string;
  css: string;
  javascript: string;

  /** @internal */
  analytics?: {
    scope?: string;
  };
}

const customCodeSectionFields: Fields<CustomCodeSectionProps> = {
  html: YextField("HTML", {
    type: "code",
    codeLanguage: "html",
  }),
  css: YextField("CSS", {
    type: "code",
    codeLanguage: "css",
  }),
  javascript: YextField("JavaScript", {
    type: "code",
    codeLanguage: "javascript",
  }),
};

const EmptyCustomCodeSection = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-3 bg-gray-100 rounded-md">
      <CodeXml className="w-12 h-12 text-gray-300" />
      <span className="text-gray-500 text-lg font-medium font-body-fontFamily">
        {t("missingHtmlWidget", "Add HTML to view component")}
      </span>
    </div>
  );
};
const CustomCodeSectionWrapper = ({
  html,
  css,
  javascript,
}: WithId<WithPuckProps<CustomCodeSectionProps>>) => {
  if (!html) {
    return <EmptyCustomCodeSection />;
  }

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [sanitizedHtml, setSanitizedHtml] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const DOMPurify = createDOMPurify(window);
      setSanitizedHtml(DOMPurify.sanitize(html));
    }
  }, [html]);

  React.useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const prevScript = containerRef.current.querySelector(
      "#custom-code-section-script"
    );
    if (prevScript) {
      prevScript.remove();
    }

    if (javascript) {
      const script = document.createElement("script");
      script.id = "custom-code-section-script";
      script.type = "text/javascript";
      script.innerHTML = javascript;
      containerRef.current.appendChild(script);
    }
  }, [javascript, sanitizedHtml]);

  return (
    <div>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
};

export const CustomCodeSection: ComponentConfig<CustomCodeSectionProps> = {
  label: msg("components.customCodeSection", "Custom Code Section"),
  fields: customCodeSectionFields,
  render: (props) => (
    <AnalyticsScopeProvider
      name={props.analytics?.scope ?? "customCodeSection"}
    >
      <CustomCodeSectionWrapper {...props} />
    </AnalyticsScopeProvider>
  ),
};
