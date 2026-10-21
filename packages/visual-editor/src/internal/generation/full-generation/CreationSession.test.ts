import type { Data } from "@puckeditor/core";
import { describe, expect, it, vi } from "vitest";
import type { ChatCanvasAdapter } from "../chat/LayoutGenerationChatCanvas.ts";
import { CreationSession } from "./CreationSession.ts";

const content = (count = 1): Data => ({
  root: { props: { title: "Page" } },
  content: [
    {
      type: "MainContent",
      props: {
        id: "main",
        content: Array.from({ length: count }, (_, index) => ({
          type: "Heading",
          props: { id: `heading-${index}`, text: `Heading ${index}` },
        })),
      },
    },
  ],
});
const setup = () => {
  const baseline = content(0);
  let displayed = baseline;
  const adapter: ChatCanvasAdapter = {
    read: () => displayed,
    resolve: vi.fn(async (candidate) => candidate),
    validate: vi.fn(),
    preview: vi.fn((data) => {
      displayed = data;
    }),
    commit: vi.fn(),
  };
  return {
    baseline,
    adapter,
    session: new CreationSession(adapter, baseline),
    signal: new AbortController().signal,
  };
};

describe("creation session", () => {
  it("previews validated sections without history and commits a single retained snapshot", async () => {
    const { session, adapter, baseline, signal } = setup();
    await session.reveal(content(), signal);
    expect(adapter.commit).not.toHaveBeenCalled();
    await session.reveal(content(2), signal);
    expect(adapter.preview).toHaveBeenCalledTimes(2);
    expect(session.sectionCount).toBe(2);
    // The final full-page check does not resolve or repaint identical content.
    await session.reveal(content(2), signal);
    expect(adapter.resolve).toHaveBeenCalledTimes(2);
    session.finish();
    session.finish();
    expect(adapter.commit).toHaveBeenCalledExactlyOnceWith(
      content(2),
      baseline
    );
  });

  it("keeps the earlier snapshot when a later section fails resolution", async () => {
    const { session, adapter, baseline, signal } = setup();
    await session.reveal(content(), signal);
    vi.mocked(adapter.resolve).mockRejectedValueOnce(
      new Error("Resolver failed")
    );
    await expect(session.reveal(content(2), signal)).rejects.toThrow(
      "Resolver failed"
    );
    session.finish();
    expect(adapter.commit).toHaveBeenCalledExactlyOnceWith(content(), baseline);
  });

  it("does not confuse resolver metadata with a rewrite of already accepted copy", async () => {
    const { session, adapter, signal } = setup();
    vi.mocked(adapter.resolve).mockImplementation(async (candidate) => ({
      ...candidate,
      content: candidate.content.map((component) => ({
        ...component,
        readOnly: { content: false },
      })),
    }));
    await session.reveal(content(), signal);
    await session.reveal(content(2), signal);
    expect(session.sectionCount).toBe(2);
  });

  it("rejects rewriting the accepted prefix", async () => {
    const { session, signal } = setup();
    await session.reveal(content(), signal);
    const changed = content(2);
    changed.content[0].props.content[0].props.text = "Rewritten";
    await expect(session.reveal(changed, signal)).rejects.toThrow(
      "already applied"
    );
    expect(session.sectionCount).toBe(1);
  });

  it.each(["cancel", "discard"])(
    "ignores late resolution after %s",
    async (reason) => {
      const { session, adapter } = setup();
      const controller = new AbortController();
      let deliver!: (data: Data) => void;
      vi.mocked(adapter.resolve).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            deliver = resolve;
          })
      );
      const pending = session.reveal(content(), controller.signal);
      if (reason === "cancel") {
        controller.abort();
      } else {
        session.discard();
      }
      deliver(content());
      await expect(pending).rejects.toThrow();
      session.finish();
      expect(adapter.preview).not.toHaveBeenCalled();
      expect(adapter.commit).not.toHaveBeenCalled();
    }
  );
});

it("restores an unsaved preview when its editor context is discarded", async () => {
  const { session, adapter, baseline, signal } = setup();
  await session.reveal(content(), signal);
  session.discard();
  expect(adapter.read()).toEqual(baseline);
  expect(adapter.commit).not.toHaveBeenCalled();
});

it("never restores an old baseline into a newly selected layout", async () => {
  const { session, adapter, signal } = setup();
  await session.reveal(content(), signal);
  const next = content(3);
  adapter.read = () => next;
  session.discard();
  expect(adapter.preview).toHaveBeenCalledTimes(1);
  expect(adapter.commit).not.toHaveBeenCalled();
});
