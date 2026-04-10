const LOCAL_DEV_ORIGIN = "http://localhost:5173";

export const shouldUseStandaloneLocalPrompt = (): boolean => {
  return (
    window.parent === window ||
    window.location.href.includes(`${LOCAL_DEV_ORIGIN}/dev-location`)
  );
};
