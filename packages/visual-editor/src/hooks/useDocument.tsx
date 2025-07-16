import * as React from "react";
import { normalizeLocalesInObject } from "../utils/normalizeLocale.ts";

const TemplatePropsContext = React.createContext<any | undefined>(undefined);

const useTemplateProps = <
  T = { document: Record<string, any>; relativePrefixToRoot?: string },
>(): T => {
  const context = React.useContext(TemplatePropsContext);
  if (!context) {
    throw new Error(
      "useTemplateProps must be used within VisualEditorProvider"
    );
  }

  const normalized = React.useMemo(
    () => normalizeLocalesInObject(context),
    [context]
  );

  return normalized as T;
};

const useDocument = <T,>(): T => {
  const context = React.useContext(TemplatePropsContext);
  if (!context) {
    throw new Error("useDocument must be used within VisualEditorProvider");
  }
  if (!context.document) {
    throw new Error("document does not exist on TemplateProps");
  }

  const normalized = React.useMemo(
    () => normalizeLocalesInObject(context.document),
    [context.document]
  );

  return normalized as T;
};

export { useDocument, useTemplateProps, TemplatePropsContext };
