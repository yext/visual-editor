import * as React from "react";

const TemplatePropsContext = React.createContext<any | undefined>(undefined);

const useTemplateProps = <T,>(): T => {
  const context = React.useContext(TemplatePropsContext);
  if (!context) {
    throw new Error(
      "useTemplateProps must be used within VisualEditorProvider"
    );
  }

  return context as T;
};

const useDocument = <T,>(): T => {
  const context = React.useContext(TemplatePropsContext);
  if (!context) {
    throw new Error("useDocument must be used within VisualEditorProvider");
  }
  if (!context.document) {
    throw new Error("document does not exist on TemplateProps");
  }

  return context.document as T;
};

export { useDocument, useTemplateProps, TemplatePropsContext };
