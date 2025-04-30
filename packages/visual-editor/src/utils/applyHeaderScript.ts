export const applyHeaderScript = (document: Record<string, any>) => {
  if (!document?.__?.visualEditorConfig) {
    return;
  }

  const headerScript: string = JSON.parse(
    document.__.visualEditorConfig
  )?.headerScript;

  if (headerScript) {
    return `<script>${headerScript}</script>`;
  }
};
