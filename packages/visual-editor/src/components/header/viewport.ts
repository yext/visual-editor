export const HEADER_BREAKPOINTS = {
  md: 768,
  lg: 1024,
} as const;

export const getHeaderViewport = (width: number) => {
  const isMobile = width < HEADER_BREAKPOINTS.md;
  const isDesktop = width >= HEADER_BREAKPOINTS.lg;
  const isTablet = !isMobile && !isDesktop;

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};
