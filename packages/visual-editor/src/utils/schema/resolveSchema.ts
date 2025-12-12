import {
  OpeningHoursSchema,
  OpeningHoursSpecificationSchema,
  PhotoGallerySchema,
} from "@yext/pages-components";
import { StreamDocument } from "../applyTheme";
import { embeddedFieldRegex, findField } from "../resolveYextEntityField";
import { removeEmptyValues } from "./helpers";
import {
  resolvePageSetUrlTemplate,
  resolveUrlTemplateOfChild,
} from "../resolveUrlTemplate";
import { mergeMeta } from "../mergeMeta";
import { TemplateRenderProps } from "./getSchema";

// Recompile the embedded field regex to support matching
const EMBEDDED_FIELD_REGEX = new RegExp(embeddedFieldRegex.source);

const stringifyResolvedField = (fieldValue: any): string => {
  if (fieldValue === undefined || fieldValue === null) {
    return "";
  }

  let stringToEmbed: string;
  if (typeof fieldValue === "string") {
    // If the value is already a string, that's what we want to embed.
    return fieldValue;
  } else if (typeof fieldValue === "object" && Array.isArray(fieldValue)) {
    stringToEmbed = fieldValue.join(",");
  } else {
    // For non-string types (objects, arrays, numbers, booleans, null),
    // we first convert them to their standard JSON string representation.
    stringToEmbed = JSON.stringify(fieldValue);
  }

  // Now, take the string we want to embed and prepare it to be a value
  // in a JSON string. This requires escaping its special characters (like " and \).
  // JSON.stringify() on a string does exactly this, and wraps the result in quotes.
  const jsonStringLiteral = JSON.stringify(stringToEmbed);

  // We return the content *inside* the quotes, which is the properly escaped string.
  return jsonStringLiteral.slice(1, -1);
};

export const resolveSchemaString = (
  streamDocument: StreamDocument,
  schema: string
): string => {
  return schema.replace(embeddedFieldRegex, (_, fieldName) => {
    const resolvedValue = findField(streamDocument, fieldName);

    if (resolvedValue === undefined || resolvedValue === null) {
      return "";
    }

    return stringifyResolvedField(resolvedValue);
  });
};

export const resolveSchemaJson = (
  data: TemplateRenderProps,
  schema: Record<string, any>
): Record<string, any> => {
  // Move path to the document for schema resolution
  data.document.path = data.path;

  // Handle the case where siteDomain is missing
  let updatedSchema = schema;
  if (!data.document.siteDomain) {
    let schemaString = JSON.stringify(schema);

    schemaString = schemaString.replaceAll(
      `"@id":"https://[[siteDomain]]/`,
      `"@id":"`
    );
    schemaString = schemaString.replaceAll(
      "https://[[siteDomain]]/",
      data.relativePrefixToRoot
    );
    updatedSchema = JSON.parse(schemaString);
  }

  const resolvedValues = resolveNode(data, updatedSchema) as Record<
    string,
    any
  >;
  return removeEmptyValues(resolvedValues);
};

const resolveNode = (data: TemplateRenderProps, node: any): any => {
  const { document: streamDocument } = data;

  // Case 1: Handle primitives other than objects/arrays
  if (node === null || typeof node !== "object") {
    // Return numbers, booleans, undefined, and null directly.
    // If it's a string, resolve potential entity values
    if (typeof node === "string") {
      return resolveSchemaString(streamDocument, node);
    }
    return node;
  }

  // Case 2: Handle Arrays
  if (Array.isArray(node)) {
    // Recursively resolve each item in the array
    return node.map((child) => resolveNode(data, child));
  }

  // Case 3: Handle Objects
  const newSchema: Record<string, any> = {};
  for (const key in node) {
    if (Object.prototype.hasOwnProperty.call(node, key)) {
      if (node[key] === "[[dm_directoryChildren]]") {
        // handle directory children
        newSchema[key] = resolveDirectoryChildren(data, node[key]);
      } else if (specialCases.includes(key)) {
        // Handle keys with special formatting
        newSchema[key] = resolveSpecialCases(data, key, node[key]);
      } else {
        // Otherwise, recursively resolve each property in the object
        newSchema[key] = resolveNode(data, node[key]);
      }
    }
  }
  return newSchema;
};

const specialCases = [
  "openingHours",
  "openingHoursSpecification",
  "image",
  "hasOfferCatalog",
];

const resolveSpecialCases = (
  data: TemplateRenderProps,
  key: string,
  value: any
): any => {
  if (typeof value !== "string") {
    return resolveNode(data, value);
  }

  const fieldName = value.match(EMBEDDED_FIELD_REGEX)?.[1];
  if (!fieldName) {
    return resolveNode(data, value);
  }

  const resolvedValue = findField(data.document, fieldName) as any;

  switch (key) {
    case "openingHours": {
      const hoursSchema = OpeningHoursSchema(resolvedValue);

      if (Object.keys(hoursSchema).length === 0) {
        return resolveNode(data, value);
      }

      return hoursSchema.openingHours;
    }
    case "openingHoursSpecification": {
      const hoursSpecSchema = OpeningHoursSpecificationSchema(resolvedValue);

      if (Object.keys(hoursSpecSchema).length === 0) {
        return resolveNode(data, value);
      }

      return hoursSpecSchema.openingHoursSpecification;
    }
    case "image": {
      const gallerySchema = PhotoGallerySchema(resolvedValue);

      if (!gallerySchema?.image?.length) {
        return resolveNode(data, value);
      }

      return gallerySchema.image;
    }
    case "hasOfferCatalog": {
      if (!Array.isArray(resolvedValue) || resolvedValue.length === 0) {
        return resolveNode(data, value);
      }

      return {
        "@type": "OfferCatalog",
        itemListElement: resolvedValue.map((item: any) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: typeof item === "string" ? item : JSON.stringify(item),
          },
        })),
      };
    }
    default: {
      return resolveNode(data, value);
    }
  }
};

const resolveDirectoryChildren = (
  data: TemplateRenderProps,
  value: any
): any => {
  const { document: streamDocument } = data;

  if (typeof value !== "string") {
    return resolveNode(data, value);
  }

  const fieldName = value.match(EMBEDDED_FIELD_REGEX)?.[1];
  if (!fieldName) {
    return resolveNode(data, value);
  }

  const resolvedValue = findField(streamDocument, fieldName) as any;
  if (!Array.isArray(resolvedValue) || resolvedValue.length === 0) {
    return resolveNode(data, value);
  }

  return resolvedValue.map((child: any, index: number) => {
    const baseUrl = streamDocument.siteDomain
      ? `https://${streamDocument.siteDomain}/`
      : data.relativePrefixToRoot;

    // if the child has an address, we're at the city level
    const childPath = child.address
      ? resolveUrlTemplateOfChild(mergeMeta(child, streamDocument), "")
      : resolvePageSetUrlTemplate(mergeMeta(child, streamDocument), "");

    const childUrl = `${baseUrl}${childPath}`;

    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: child.name,
        url: childUrl,
        openingHoursSpecification: OpeningHoursSpecificationSchema(child.hours)
          ?.openingHoursSpecification,
        address: child.address && {
          "@type": "PostalAddress",
          streetAddress: child.address.line1,
          addressLocality: child.address.city,
          addressRegion: child.address.region,
          postalCode: child.address.postalCode,
          addressCountry: child.address.countryCode,
        },
        phone: child.mainPhone,
      },
    };
  });
};
