// Extracts the name of a theme color from a tailwind bg- or text- class
export const normalizeThemeColor = (token?: string): string | undefined => {
  if (!token) {
    return undefined;
  }

  if (token.startsWith("bg-")) {
    return token.replace("bg-", "") || undefined;
  }

  if (token.startsWith("text-")) {
    return token.replace("text-", "") || undefined;
  }

  return undefined;
};
