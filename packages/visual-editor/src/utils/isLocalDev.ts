export const isLocalDev = () => {
  if (typeof window === "undefined") {
    return false;
  }

  // `/local-editor` should use the same local-only fallbacks as the fake starter.
  return (
    window.location.pathname === "/local-editor" ||
    window.location.pathname.startsWith("/dev-")
  );
};
