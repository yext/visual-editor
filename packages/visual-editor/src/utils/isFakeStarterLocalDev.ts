type LocationLike = string | URL | { pathname: string };

export const isFakeStarterLocalDevRoute = (locationLike: LocationLike) => {
  if (typeof locationLike === "string") {
    return new URL(locationLike, "http://localhost").pathname.startsWith(
      "/dev-"
    );
  }

  if (locationLike instanceof URL) {
    return locationLike.pathname.startsWith("/dev-");
  }

  return locationLike.pathname.startsWith("/dev-");
};

export const isLocalDev = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    isFakeStarterLocalDevRoute(window.location) ||
    window.location.pathname === "/local-editor"
  );
};
