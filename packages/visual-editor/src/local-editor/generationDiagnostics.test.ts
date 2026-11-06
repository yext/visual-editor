import { afterEach, expect, it, vi } from "vitest";
import {
  createLocalGenerationDiagnostics,
  reportChatDiagnostic,
  reportChatError,
} from "./generationDiagnostics.ts";

afterEach(() => vi.unstubAllGlobals());

it.each([
  { endpoint: "diagnostics", send: reportChatDiagnostic },
  { endpoint: "error", send: reportChatError },
])(
  "sends $endpoint reports to the local session log",
  async ({ endpoint, send }) => {
    const fetchMock = vi.fn(async () => new Response("{}"));

    vi.stubGlobal("fetch", fetchMock);

    const report = { correlationId: "turn", phase: "resolved" };

    send("/generate", report);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      `/generate/${endpoint}`,
      expect.objectContaining({ method: "POST", body: JSON.stringify(report) })
    );
  }
);

it.each([
  {
    endpoint: "diagnostics",
    send: reportChatDiagnostic,
    message: "Unable to record chat diagnostics:",
  },
  {
    endpoint: "error",
    send: reportChatError,
    message: "Unable to report chat error:",
  },
])(
  "contains failures when posting $endpoint reports",
  async ({ send, message }) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 }))
    );

    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      expect(() => send("/generate", {})).not.toThrow();
      await vi.waitFor(() =>
        expect(logged).toHaveBeenCalledWith(
          message,
          expect.objectContaining({ message: "HTTP error: 500" })
        )
      );
    } finally {
      logged.mockRestore();
    }
  }
);

it.each([200, 500])(
  "records inference omissions without console output (HTTP %s)",
  async (status) => {
    const fetchMock = vi.fn(async () => new Response("{}", { status }));

    vi.stubGlobal("fetch", fetchMock);

    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const diagnostics = createLocalGenerationDiagnostics(
        "/generate",
        "location"
      );

      diagnostics.schemaOmissions!({
        correlationId: "turn",
        fields: [
          { component: "Hero", path: "props.custom", fieldType: "custom" },
        ],
      });
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
      await new Promise((resolve) => setTimeout(resolve, 0));

      const [url, request] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];

      expect(url).toBe("/generate/diagnostics");
      expect(JSON.parse(request.body as string)).toMatchObject({
        layoutId: "location",
        correlationId: "turn",
        details: { fields: [{ path: "props.custom" }] },
      });
      expect(logged).not.toHaveBeenCalled();
    } finally {
      logged.mockRestore();
    }
  }
);
