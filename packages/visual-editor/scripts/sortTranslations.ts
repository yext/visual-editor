// scripts/sortTranslations.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, "../locales");

function sortObject(obj: any): any {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return obj;
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject(obj[key]);
      return acc;
    }, {});
}

for (const langDir of fs.readdirSync(baseDir)) {
  const langPath = path.join(baseDir, langDir);
  if (!fs.lstatSync(langPath).isDirectory()) continue;

  for (const file of fs.readdirSync(langPath)) {
    const filePath = path.join(langPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sorted = sortObject(data);
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + "\n");
  }
}
