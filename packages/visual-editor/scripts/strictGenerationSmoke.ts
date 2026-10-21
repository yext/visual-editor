/** Manual gateway check: sends only the synthetic catalog and prompt below. */
import assert from "node:assert/strict";
import { z } from "zod";
import { executeGeneration } from "../src/internal/generation/transport/executeGeneration.ts";
import { createPuckGenerationCatalog } from "../src/utils/generationCatalog.ts";
import { GENERATION_GATEWAY_URL } from "../src/vite-plugin/layout-generation/modelProxy.ts";

const model = process.argv[2] ?? "gpt-6-luna";
const color = z.enum(["blue", "green"]);
const greetingProps = z.object({
  greeting: z
    .object({
      defaultValue: z.string().min(1).max(80),
      hasLocalizedValue: z.literal("true").optional(),
    })
    .catchall(z.string().optional()),
  color: z.enum(["blue", "green"]).describe("The visual color of the greeting"),
  emphasized: z.boolean().optional(),
});
const catalog = createPuckGenerationCatalog({
  SyntheticSection: {
    description:
      "A synthetic section containing a greeting in its heading slot.",
    generation: {
      props: z.object({
        color,
        slots: z.object({ heading: z.array(z.unknown()) }),
      }),
    },
    fields: {
      slots: {
        type: "object",
        objectFields: {
          heading: { type: "slot", allow: ["GreetingSlot"] },
        },
      },
    },
  },
  GreetingSlot: {
    nestedOnly: true,
    generation: { props: z.object({ data: greetingProps }) },
  },
});
const controller = new AbortController();
const timeout = setTimeout(
  () => controller.abort(new Error("Smoke check timed out")),
  30_000
);
try {
  const accepted = await executeGeneration(
    {
      layoutId: "synthetic",
      currentData: { content: [] },
      mode: "create",
      messages: [
        {
          role: "user",
          content:
            "Create MainContent containing one SyntheticSection with color blue and one GreetingSlot in its heading slot. In that slot's props.data set greeting defaultValue Hello, fr Bonjour, color blue, and no emphasis.",
        },
      ],
    },
    {
      model,
      catalog,
      locales: ["en", "fr"],
      diagnostics: { log: () => {}, report: () => {} },
      transport: async (body, signal, correlationId) => {
        const response = await fetch(GENERATION_GATEWAY_URL, {
          method: "POST",
          signal,
          headers: {
            "Content-Type": "application/json",
            "Yext-Business-Id": "1000152098",
            "Yext-Source": "vle-ai-layout-generation-poc",
            "Correlation-Id": correlationId,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          throw new Error(`Gateway HTTP ${response.status}`);
        }
        return {
          contentType:
            response.headers.get("Content-Type") ?? "application/json",
          body: response.body!,
        };
      },
    },
    controller.signal,
    crypto.randomUUID(),
    () => {}
  );
  if (accepted.type !== "accepted" || !accepted.spec?.content.length) {
    throw new Error("No accepted content");
  }
  const content = accepted.spec.content;
  assert.equal(content.length, 1);
  assert.equal(content[0].type, "MainContent");
  const sections = content[0].props.content;
  assert.equal(sections.length, 1);
  assert.equal(sections[0].type, "SyntheticSection");
  assert.equal(sections[0].props.color, "blue");
  const headings = sections[0].props.slots.heading;
  assert.equal(headings.length, 1);
  assert.equal(headings[0].type, "GreetingSlot");
  assert.equal(headings[0].props.data.greeting.defaultValue, "Hello");
  assert.equal(headings[0].props.data.greeting.fr, "Bonjour");
  assert.equal(headings[0].props.data.color, "blue");
  assert.ok(!headings[0].props.data.emphasized);
  console.log(
    `Strict generation smoke check passed for ${model}. Synthetic data only.`
  );
} catch (error) {
  console.error(`Strict generation smoke check failed for ${model}:`, error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}
