export const getFieldLabel = (fieldName: string, label?: unknown): string => {
  if (typeof label === "string" && label) {
    return label;
  }

  return fieldName
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/\b\w/g, (value) => value.toUpperCase());
};
