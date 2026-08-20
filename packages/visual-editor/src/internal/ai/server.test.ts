import { describe, expect, it, vi } from "vitest";
import { yextAiFieldTypes } from "./fieldTypes.ts";
import {
  puckAiDesignModeInstructions,
  puckAiSystemContext,
} from "./systemPrompt.ts";
import { handlePuckAiRequest } from "./server.ts";

describe("handlePuckAiRequest", () => {
  it("forwards fieldTypes and design mode options to Puck Cloud", async () => {
    vi.stubEnv("PUCK_API_KEY", "test-api-key");

    const fetchMock = vi.fn(async () => new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handlePuckAiRequest(
      new Request("http://localhost/api/puck/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-puck-plugin-ai-version": "0.9.0-canary.d8bdabee",
        },
        body: JSON.stringify({
          mode: "design",
          messages: [{ role: "user", parts: [{ type: "text", text: "hi" }] }],
          config: {
            components: {
              MiniHero: {
                fields: {
                  title: {
                    type: "testEntityField",
                  },
                },
              },
              HeroSection: {
                fields: {
                  title: {
                    type: "text",
                  },
                },
              },
            },
          },
          pageData: {
            root: {
              props: {},
              type: "root",
            },
            content: [],
            zones: {},
          },
        }),
      })
    );

    expect(response).toBeInstanceOf(Response);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://cloud.puckeditor.com/api/chat");

    const body = JSON.parse(options.body as string);
    expect(body.fieldTypes).toEqual(yextAiFieldTypes);
    expect(body.designMode).toEqual({
      allowed: true,
      instructions: puckAiDesignModeInstructions,
    });
    expect(body.context).toBe(puckAiSystemContext);
    expect(Object.keys(body.config.components)).toEqual(["MiniHero"]);
  });
});
