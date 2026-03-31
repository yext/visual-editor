import Handlebars from "handlebars";
import { StreamDocument } from "../utils/types/StreamDocument.ts";
import { normalizeSlug } from "../utils/slugifier.ts";

let customCodeHandlebarsHelpersRegistered = false;

/**
 * Registers Handlebars helpers that are available in CustomCodeSection HTML.
 *
 * `slugify` joins its arguments in order and normalizes the resulting string,
 * which makes it a good fit for single slugs or mixed constant + field output.
 *
 * `slugifyPath` normalizes each argument as a path segment, omits empty segments,
 * and joins the result with `/`, which makes it useful for authoring URL paths.
 */
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

/**
 * Renders CustomCodeSection HTML with Handlebars when template syntax is present.
 *
 * The template receives the current stream document as its data context and can
 * use the helpers registered by `registerCustomCodeHandlebarsHelpers`.
 *
 * If compilation fails, the original HTML is returned unchanged so custom code
 * continues to render as raw markup instead of failing the whole section.
 */
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
