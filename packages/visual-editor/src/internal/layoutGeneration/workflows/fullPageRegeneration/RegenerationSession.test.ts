import { expect, it } from "vitest";
import type { Data } from "@puckeditor/core";
import { clone, type Content } from "../../shared/authoredValues.ts";
import type { RegenerationStep } from "./contracts.ts";
import {
  regenerationLayout,
  regenerationSessionFixture,
  savedHeading,
  newHeading,
  bodySections,
} from "../../testing/regenerationFixtures.ts";

it.each(["insert", "reorder"] as const)(
  "reports a removed %s anchor while retaining completed work",
  async (operation) => {
    const current = regenerationSessionFixture();
    const signal = new AbortController().signal;
    await current.session.apply(
      { kind: "remove", sectionId: "hero" },
      0,
      signal
    );
    const before = clone(current.data());
    const anchor = { position: "after" as const, componentId: "hero" };
    const step: RegenerationStep =
      operation === "insert"
        ? {
            kind: operation,
            collection: { ownerId: "main", slotPath: "/content" },
            anchor,
            sections: [newHeading("new")],
          }
        : { kind: operation, sectionId: "testimonials", anchor };
    let error: Error | undefined;
    try {
      await current.session.apply(step, 1, signal);
    } catch (cause) {
      error = cause as Error;
    }
    expect(error?.message).toContain(
      "Regeneration step 1 failed: Anchor is not in the permitted collection."
    );
    expect(error?.message).toContain(`Anchor: ${JSON.stringify(anchor)}`);
    expect(error?.message).toContain(`"kind":"${operation}"`);
    const siblingIds = bodySections(before as Content)
      .map((item) => item.props.id)
      .filter((id) => operation !== "reorder" || id !== "testimonials");
    expect(error?.message).toContain(
      `Available sibling Ids: ${JSON.stringify(siblingIds)}`
    );
    expect(error?.message).not.toContain('"sections"');
    expect(current.data()).toEqual(before);
    expect(current.session.stepCount).toBe(1);
    current.session.finish();
    expect(current.commit).toHaveBeenCalledOnce();
    expect(current.data()).toEqual(before);
  }
);

it.each(["start", "end", "before", "after"] as const)(
  "reorders a replacement block at %s using the original section Id",
  async (position) => {
    const current = regenerationSessionFixture();
    const signal = new AbortController().signal;
    await current.session.apply(
      {
        kind: "replace",
        sectionId: "hero",
        sections: [newHeading("replacement-a"), newHeading("replacement-b")],
      },
      0,
      signal
    );
    const step: RegenerationStep = {
      kind: "reorder",
      sectionId: "hero",
      anchor:
        position === "before" || position === "after"
          ? { position, componentId: "testimonials" }
          : { position },
    };
    await current.session.apply(step, 1, signal);
    await current.session.apply(step, 1, signal);
    const block = ["replacement-a", "replacement-b"];
    expect(
      bodySections(current.data() as Content).map((item) => item.props.id)
    ).toEqual(
      position === "start"
        ? [...block, "services", "testimonials"]
        : position === "before"
          ? ["services", ...block, "testimonials"]
          : ["services", "testimonials", ...block]
    );
    expect(current.preview).toHaveBeenCalledTimes(position === "start" ? 1 : 2);
    expect(current.session.stepCount).toBe(2);
    current.session.finish();
    expect(current.commit).toHaveBeenCalledOnce();
    expect(current.commit.mock.calls[0][1]).toEqual(regenerationLayout());
  }
);

it.each(["insert", "reorder"] as const)(
  "resolves replaced anchors on either side of a replacement block for %s",
  async (kind) => {
    for (const position of ["before", "after"] as const) {
      const current = regenerationSessionFixture();
      const signal = new AbortController().signal;
      await current.session.apply(
        {
          kind: "replace",
          sectionId: "hero",
          sections: [newHeading("replacement-a"), newHeading("replacement-b")],
        },
        0,
        signal
      );
      const anchor = { position, componentId: "hero" };
      await current.session.apply(
        kind === "insert"
          ? {
              kind,
              collection: { ownerId: "main", slotPath: "/content" },
              anchor,
              sections: [newHeading("new")],
            }
          : { kind, sectionId: "testimonials", anchor },
        1,
        signal
      );
      const block = ["replacement-a", "replacement-b"];
      const moved = kind === "insert" ? "new" : "testimonials";
      expect(
        bodySections(current.data() as Content).map((item) => item.props.id)
      ).toEqual([
        ...(position === "before" ? [moved, ...block] : [...block, moved]),
        "services",
        ...(kind === "insert" ? ["testimonials"] : []),
      ]);
    }
  }
);

it("keeps a replacement block unchanged when reordering relative to itself", async () => {
  const current = regenerationSessionFixture();
  const signal = new AbortController().signal;
  await current.session.apply(
    {
      kind: "replace",
      sectionId: "hero",
      sections: [newHeading("replacement-a"), newHeading("replacement-b")],
    },
    0,
    signal
  );
  const before = clone(current.data());
  await expect(
    current.session.apply(
      {
        kind: "reorder",
        sectionId: "hero",
        anchor: { position: "after", componentId: "hero" },
      },
      1,
      signal
    )
  ).rejects.toThrow("relative to itself");
  expect(current.data()).toEqual(before);
  expect(current.session.stepCount).toBe(1);
});

it("retains completed streamed changes on stop with one undo baseline", async () => {
  const current = regenerationSessionFixture();
  const signal = new AbortController().signal;
  await current.session.apply(
    { kind: "remove", sectionId: "services" },
    0,
    signal
  );
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
  expect(current.data().content[2].props.id).toBe("footer");
  await current.session.apply(
    {
      kind: "reorder",
      sectionId: "testimonials",
      anchor: { position: "start" },
    },
    1,
    signal
  );
  expect(current.commit).not.toHaveBeenCalled();
  current.session.finish();
  current.session.finish();
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.commit.mock.calls[0][1]).toEqual(regenerationLayout());
  expect(bodySections(current.data() as Content)[0].props.id).toBe(
    "testimonials"
  );
});

it("deduplicates steps and prevents late resolution after cancellation", async () => {
  const current = regenerationSessionFixture();
  const controller = new AbortController();
  const step: RegenerationStep = { kind: "remove", sectionId: "services" };
  await current.session.apply(step, 0, controller.signal);
  await current.session.apply(step, 0, controller.signal);
  expect(current.preview).toHaveBeenCalledOnce();
  let release!: (data: Data) => void;
  current.adapter.resolve.mockImplementationOnce(
    (data) =>
      new Promise((resolve) => {
        release = () => resolve(data);
      })
  );
  const pending = current.session.apply(
    { kind: "remove", sectionId: "hero" },
    1,
    controller.signal
  );
  controller.abort();
  current.session.finish();
  release(regenerationLayout());
  await expect(pending).rejects.toThrow();
  expect(current.preview).toHaveBeenCalledOnce();
  expect(current.commit).toHaveBeenCalledOnce();
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
});

it("rejects resolution that loses generated content and retains earlier changes", async () => {
  const current = regenerationSessionFixture();
  const signal = new AbortController().signal;
  await current.session.apply(
    { kind: "remove", sectionId: "services" },
    0,
    signal
  );
  current.adapter.resolve.mockImplementationOnce(async (data) => {
    bodySections(data as Content)[0].props.text = "Corrupted";
    return data;
  });
  await expect(
    current.session.apply(
      { kind: "remove", sectionId: "testimonials" },
      1,
      signal
    )
  ).rejects.toThrow();
  current.session.finish();
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
  expect(current.commit).toHaveBeenCalledOnce();
});

it("does not overwrite a different editor context when ending a partial session", async () => {
  const current = regenerationSessionFixture();
  await current.session.apply(
    { kind: "remove", sectionId: "services" },
    0,
    new AbortController().signal
  );
  const otherPage: Data = { root: {}, content: [savedHeading("other")] };
  current.adapter.preview(otherPage);
  current.session.finish();
  expect(current.data()).toEqual(otherPage);
  expect(current.commit).not.toHaveBeenCalled();
});
