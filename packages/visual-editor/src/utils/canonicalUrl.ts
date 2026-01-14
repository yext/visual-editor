export const getCanonicalUrl = (path: string, siteDomain: string): string => {
  let pagePath = path;

  // Same logic that consulting uses to generate canonical URLs
  if (pagePath === "index.html") {
    pagePath = "";
  }

  return `https://${siteDomain}/${pagePath}`;
};
