/**
 * Validation script to test AI schema generation
 * Run with: tsx src/editor/validateAiSchemas.ts
 */

import { z } from "zod/v4";
import {
  yextEntityFieldTranslatableStringSchema,
  yextEntityFieldImageSchema,
  yextEntityFieldCTASchema,
} from "./aiSchemas.ts";

console.log("=== Validating AI Schemas ===\n");

// Test TranslatableString schema
console.log("1. TranslatableString Schema:");
try {
  const schema1 = z.toJSONSchema(yextEntityFieldTranslatableStringSchema);
  console.log(JSON.stringify(schema1, null, 2));
  console.log("\n✓ Schema generated successfully\n");
} catch (error) {
  console.error("✗ Error generating schema:", error);
}

// Test Image schema
console.log("2. Image Schema:");
try {
  const schema2 = z.toJSONSchema(yextEntityFieldImageSchema);
  console.log(JSON.stringify(schema2, null, 2));
  console.log("\n✓ Schema generated successfully\n");
} catch (error) {
  console.error("✗ Error generating schema:", error);
}

// Test CTA schema
console.log("3. CTA Schema:");
try {
  const schema3 = z.toJSONSchema(yextEntityFieldCTASchema);
  console.log(JSON.stringify(schema3, null, 2));
  console.log("\n✓ Schema generated successfully\n");
} catch (error) {
  console.error("✗ Error generating schema:", error);
}

// Test with getSchemaForYextEntityField
console.log("4. Testing getSchemaForYextEntityField:");
import { getSchemaForYextEntityField } from "./aiSchemas.ts";

const stringFilter = { types: ["type.string"] };
const imageFilter = { types: ["type.image"] };
const ctaFilter = { types: ["type.cta"] };

console.log("\n  String filter result:");
const stringSchema = getSchemaForYextEntityField(stringFilter);
if (stringSchema) {
  console.log(JSON.stringify(stringSchema, null, 2));
} else {
  console.log("  ✗ No schema returned");
}

console.log("\n  Image filter result:");
const imageSchema = getSchemaForYextEntityField(imageFilter);
if (imageSchema) {
  console.log(JSON.stringify(imageSchema, null, 2));
} else {
  console.log("  ✗ No schema returned");
}

console.log("\n  CTA filter result:");
const ctaSchema = getSchemaForYextEntityField(ctaFilter);
if (ctaSchema) {
  console.log(JSON.stringify(ctaSchema, null, 2));
} else {
  console.log("  ✗ No schema returned");
}

// Test the cleaned schema output
console.log("\n5. Testing cleaned schema (what Puck AI receives):");
const cleanedStringSchema = getSchemaForYextEntityField(stringFilter);
if (cleanedStringSchema) {
  console.log("\n  Cleaned String Schema:");
  console.log(JSON.stringify(cleanedStringSchema, null, 2));

  // Check for potential issues
  const hasSchema = "$schema" in cleanedStringSchema;
  const hasEmptyAdditionalProps = JSON.stringify(cleanedStringSchema).includes(
    '"additionalProperties":{}'
  );

  console.log("\n  Validation checks:");
  console.log(
    `  - Has $schema property: ${hasSchema} ${hasSchema ? "⚠️" : "✓"}`
  );
  console.log(
    `  - Has empty additionalProperties: ${hasEmptyAdditionalProps} ${hasEmptyAdditionalProps ? "⚠️" : "✓"}`
  );
}

console.log("\n=== Validation Complete ===");
