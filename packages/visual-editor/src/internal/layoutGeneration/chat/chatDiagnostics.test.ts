import { expect, it } from "vitest";
import { changedChatPaths } from "./chatDiagnostics.ts";

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
