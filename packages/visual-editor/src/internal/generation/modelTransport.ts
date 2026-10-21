/** Prepared Responses API request; prompts and schemas remain editor-owned. */
export type ModelRequestBody = {
  model: string;
  stream: true;
  max_output_tokens: number;
  instructions: string;
  input: { role: "user" | "assistant"; content: string }[];
  text: {
    format: {
      type: "json_schema";
      name: string;
      strict: true;
      schema: Record<string, unknown>;
    };
  };
};

export type ModelResponse = {
  contentType: string;
  body: ReadableStream<Uint8Array>;
};

export type ModelTransport = (
  body: ModelRequestBody,
  signal: AbortSignal,
  /** Local diagnostics only; the iframe adapter does not transmit this value. */
  diagnosticId: string
) => Promise<ModelResponse>;

export class ModelTransportError extends Error {
  constructor(
    message: string,
    readonly transport: boolean,
    readonly status?: number
  ) {
    super(message);
  }
}

export const isTransportStatus = (status: number) =>
  status >= 500 || status === 408 || status === 429;
