export const getCanonicalUrl = (data): string => {
  let pagePath = data?.path;

  // Same logic that consulting uses to generate canonical URLs
  if (pagePath === "index.html") {
    pagePath = "";
  }

  return `https://${data?.document?.siteDomain}/${pagePath}`;
};
