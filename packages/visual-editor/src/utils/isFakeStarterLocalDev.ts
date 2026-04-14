type LocationLike = string | URL | { pathname: string };

const getPathname = (locationLike: LocationLike) => {
  if (typeof locationLike === "string") {
    return new URL(locationLike, "http://localhost").pathname;
  }

  if (locationLike instanceof URL) {
    return locationLike.pathname;
  }

  return locationLike.pathname;
};

export const isFakeStarterLocalDevRoute = (locationLike: LocationLike) => {
  return getPathname(locationLike).startsWith("/dev-");
};

export const isFakeStarterLocalDev = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return isFakeStarterLocalDevRoute(window.location);
};
