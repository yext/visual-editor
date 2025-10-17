/**
 * visualEditorMediaQuery uses JS to determine the current viewport size, taking
 * into account whether the content is inside the editor iframe.
 * During page generation, it will return undefined.
 */
export const visualEditorMediaQuery = (): {
  sm: boolean | undefined;
  md: boolean | undefined;
  lg: boolean | undefined;
  xl: boolean | undefined;
  "2xl": boolean | undefined;
} => {
  if (typeof window === "undefined") {
    return {
      sm: undefined,
      md: undefined,
      lg: undefined,
      xl: undefined,
      "2xl": undefined,
    };
  }

  const iframe = document.getElementById("preview-frame") as HTMLIFrameElement;

  let contentWindow: Window | null = window;
  if (iframe) {
    contentWindow = iframe.contentWindow;
  }

  if (!contentWindow) {
    return {
      sm: undefined,
      md: undefined,
      lg: undefined,
      xl: undefined,
      "2xl": undefined,
    };
  }

  return {
    sm: !contentWindow.matchMedia("(min-width: 640px)").matches,
    md: !contentWindow.matchMedia("(min-width: 768px)").matches,
    lg: !contentWindow.matchMedia("(min-width: 1024px)").matches,
    xl: !contentWindow.matchMedia("(min-width: 1280px)").matches,
    "2xl": !contentWindow.matchMedia("(min-width: 1536px)").matches,
  };
};
