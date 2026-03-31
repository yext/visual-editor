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
 * Compiles and renders a Handlebars template string with the provided data if Handlebars syntax is detected.
 *
 * If the HTML string contains Handlebars expressions (e.g., {{name}}), this function will compile and render
 * the template using the given data (typically the stream document). If compilation or rendering fails, or if
 * no Handlebars expressions are present, the original HTML string is returned.
 *
 * The template can use the helpers registered by `registerCustomCodeHandlebarsHelpers`.
 *
 * @param html - The HTML string, possibly containing Handlebars template syntax.
 * @param data - The data object to use for template rendering (e.g., streamDocument).
 * @returns The processed HTML string with Handlebars expressions replaced, or the original HTML if not applicable.
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
