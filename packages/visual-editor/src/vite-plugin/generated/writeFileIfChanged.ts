import fs from "fs-extra";

export const writeFileIfChanged = (
  filePath: string,
  content: string
): boolean => {
  if (fs.existsSync(filePath)) {
    const existingContent = fs.readFileSync(filePath, "utf8");
    if (existingContent === content) {
      return false;
    }
  }

  fs.writeFileSync(filePath, content);
  return true;
};
