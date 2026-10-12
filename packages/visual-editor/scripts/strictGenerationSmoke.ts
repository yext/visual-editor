/** Manual gateway check: sends only the synthetic catalog and prompt below. */
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../src/vite-plugin/layout-generation/puckGenerationCatalog.ts";
import { handleLocalEditorGenerationRequest } from "../src/vite-plugin/layout-generation/generation.ts";

const model = process.argv[2] ?? "gpt-6-luna";
const color = z.enum(["blue", "green"]);
const greetingProps = z.object({
  greeting: z
    .object({
      defaultValue: z.string().min(1).max(80),
      hasLocalizedValue: z.literal("true").optional(),
    })
    .catchall(z.string().optional()),
  color: color.describe("The visual color of the greeting"),
  emphasized: z.boolean().optional(),
});
const catalog = createPuckGenerationCatalog({
  SyntheticSection: {
    description:
      "A synthetic section containing a greeting in its heading slot.",
    props: z.object({
      color,
      slots: z.object({
        heading: z.array(
          z.object({
            type: z.literal("GreetingSlot"),
            props: z.object({ data: greetingProps }),
          })
        ),
      }),
    }),
    fields: {
      slots: {
        type: "object",
        objectFields: {
          heading: { type: "slot", allow: ["GreetingSlot"] },
        },
      },
    },
  },
  GreetingSlot: { nestedOnly: true },
});
const request = Readable.from([
  Buffer.from(
    JSON.stringify({
      layoutId: "synthetic",
      messages: [
        {
          role: "user",
          content:
            "Create MainContent containing one SyntheticSection with color blue and one GreetingSlot in its heading slot. In that slot's props.data set greeting defaultValue Hello, fr Bonjour, color blue, and no emphasis.",
        },
      ],
    })
  ),
]) as IncomingMessage;
request.method = "POST";
const events: {
  type: string;
  spec?: { content: unknown[] };
  error?: string;
}[] = [];
let errorBody = "";
const response = Object.assign(new EventEmitter(), {
  statusCode: 0,
  setHeader: () => {},
  flushHeaders: () => {},
  write: (line: string) => events.push(JSON.parse(line)),
  end: (body?: string) => {
    errorBody = body ?? "";
  },
});
const timeout = setTimeout(() => response.emit("close"), 30_000);
try {
  await handleLocalEditorGenerationRequest(
    request,
    response as unknown as ServerResponse,
    {
      model,
      loadContext: async () => ({ catalog, locales: ["en", "fr"] }),
      log: () => {},
    }
  );
  const accepted = events.find((event) => event.type === "accepted");
  if (!accepted?.spec?.content.length)
    throw new Error(
      events.find((event) => event.type === "error")?.error ??
        (errorBody || "No accepted content")
    );
  console.log(
    `Strict generation smoke check passed for ${model}. Synthetic data only.`
  );
} catch (error) {
  console.error(`Strict generation smoke check failed for ${model}:`, error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}
