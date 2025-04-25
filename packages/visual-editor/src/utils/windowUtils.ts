import * as React from "react";

export function useIsSmallScreen() {
  const [isSmall, setIsSmall] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const handleChange = () => setIsSmall(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isSmall;
}
