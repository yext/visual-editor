import Handlebars from "handlebars";
import { StreamDocument } from "../utils/types/StreamDocument.ts";
import { normalizeSlug } from "../utils/slugifier.ts";

let customCodeHandlebarsHelpersRegistered = false;

export const registerCustomCodeHandlebarsHelpers = () => {
  if (customCodeHandlebarsHelpersRegistered) {
    return;
  }

  Handlebars.registerHelper("slugify", (...args: unknown[]) => {
    const values = args.slice(0, -1);
    const content = values
      .map((value) => (value == null ? "" : String(value)))
      .join("");

    return normalizeSlug(content);
  });

  Handlebars.registerHelper("slugifyPath", (...args: unknown[]) => {
    const values = args.slice(0, -1);
    const normalizedSegments = values
      .map((value) => (value == null ? "" : normalizeSlug(String(value))))
      .flatMap((value) => value.split("/"))
      .filter(Boolean);

    return normalizedSegments.join("/");
  });

  customCodeHandlebarsHelpersRegistered = true;
};

export const processHandlebarsTemplate = (
  html: string,
  data: StreamDocument
): string => {
  if (!html) {
    return html;
  }

  if (/{{[^}]+}}/.test(html)) {
    try {
      registerCustomCodeHandlebarsHelpers();
      const template = Handlebars.compile(html);
      return template(data);
    } catch {
      return html;
    }
  }

  return html;
};
