export const isVisualEditorTestEnv = () =>
  (typeof __VISUAL_EDITOR_TEST__ !== "undefined" &&
    __VISUAL_EDITOR_TEST__ === true) ||
  (globalThis as any).__VISUAL_EDITOR_TEST__ === true;
