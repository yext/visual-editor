import type { GenerationRequest } from "../messageTransport.ts";

/** Synthetic protocol examples shared with the platform handoff documentation. */
export const generationRequestFixture: GenerationRequest = {
  type: "aiPageGenerationRequest",
  payload: {
    requestId: "11111111-1111-4111-8111-111111111111",
    body: {
      model: "configured-model",
      stream: true,
      max_output_tokens: 2048,
      instructions: "Return the requested synthetic text.",
      input: [{ role: "user", content: "Return Hello." }],
      text: {
        format: {
          type: "json_schema",
          name: "synthetic",
          strict: true,
          schema: {
            type: "object",
            properties: { text: { type: "string" } },
            required: ["text"],
            additionalProperties: false,
          },
        },
      },
    },
  },
};

export const modelCompletionFixture = (output: unknown) => {
  const outputText = JSON.stringify(output);
  const response = {
    status: "completed",
    output_text: outputText,
    usage: {
      input_tokens: 12,
      input_tokens_details: { cached_tokens: 2 },
      output_tokens: 4,
    },
  };
  const events = [
    { type: "response.output_text.delta", delta: outputText },
    { type: "response.completed", response },
  ];
  return {
    response,
    wire: events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""),
  };
};
