import * as React from "react";

export const VIEWPORT_BREAKPOINTS = {
  md: 768,
  lg: 1024,
} as const;

export const getViewport = (width: number) => {
  const isMobile = width < VIEWPORT_BREAKPOINTS.md;
  const isDesktop = width >= VIEWPORT_BREAKPOINTS.lg;
  const isTablet = !isMobile && !isDesktop;

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};

export const useWindowWidth = (externalWindow?: Window | null) => {
  const [width, setWidth] = React.useState(externalWindow?.innerWidth ?? 1024);

  React.useLayoutEffect(() => {
    const targetWindow = externalWindow || window;
    const handleResize = () => setWidth(targetWindow.innerWidth);
    handleResize();
    targetWindow.addEventListener("resize", handleResize);

    return () => {
      targetWindow.removeEventListener("resize", handleResize);
    };
  }, [externalWindow]);

  return width;
};
