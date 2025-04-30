export const applyHeaderScript = (document: Record<string, any>) => {
  if (!document?.__?.visualEditorConfig) {
    return;
  }

  return JSON.parse(document.__.visualEditorConfig)?.headerScript;
};
