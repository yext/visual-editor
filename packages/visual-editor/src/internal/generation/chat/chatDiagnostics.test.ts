import { afterEach, expect, it, vi } from "vitest";
import {
  reportChatDiagnostic,
  reportChatError,
} from "../../../local-editor/generationDiagnostics.ts";
import { changedChatPaths } from "./chatDiagnostics.ts";

afterEach(() => vi.unstubAllGlobals());

it("locates differences between visible slots and manual card backups", () => {
  const before = {
    props: {
      slots: { CardSlot: [{ props: { color: "primary" } }] },
      manualSlots: { CardSlot: [{ props: { color: "primary" } }] },
    },
  };
  const after = structuredClone(before);
  after.props.slots.CardSlot[0].props.color = "secondary";
  expect(changedChatPaths(before, after)).toEqual([
    "/props/slots/CardSlot/0/props/color",
  ]);
  expect(before.props.manualSlots).toEqual(after.props.manualSlots);
});

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
