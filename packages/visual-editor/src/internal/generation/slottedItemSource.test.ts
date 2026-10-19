// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { compileGenerationSchema } from "../../vite-plugin/layout-generation/generationSchema.ts";
import { buildGenerationPrompt } from "../../vite-plugin/layout-generation/generationValidation.ts";
import { slottedItemSourceGuidance } from "../../vite-plugin/layout-generation/prompts.ts";
import {
  assertAuthoredPreserved,
  clone,
  extractAuthored,
  collectAuthoredIds,
  validateAuthored,
} from "./authored.ts";

import { slottedFixture } from "./slottedGenerationTestUtils.ts";

const defaults = { $default: true };

describe("slotted source generation", () => {
  it("canonicalizes absent optional values while preserving explicit null", async () => {
    const f = slottedFixture();
    const cardConfig = f.components.FAQCard;
    cardConfig.generation.props = cardConfig.generation.props.extend({
      styles: cardConfig.generation.props.shape.styles.extend({
        accent: z.string().nullable().optional(),
      }),
    });
    cardConfig.defaultProps.styles.accent = undefined;
    const candidate = f.materialize();
    const resolved = await f.resolve(candidate);
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).not.toThrow();
    resolved.content[0].props.slots.CardSlot[0].props.styles.accent = null;
    resolved.content[0].props.manualSlots.CardSlot[0].props.styles.accent =
      null;
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).toThrow(/accent/);
  });

  it.each(["FAQCard", "EventCard"])(
    "materializes and resolves default %s cards",
    async (type) => {
      const f = slottedFixture(type);
      const candidate = f.materialize();
      const cards = candidate.content[0].props.slots.CardSlot;
      expect(cards).toHaveLength(3);
      expect(cards[0].type).toBe(type);
      expect(cards[0].props.slots.BodySlot[0].props.id).toBe(
        `${cards[0].props.id}-BodySlot-0`
      );
      const resolved = await f.resolve(candidate);
      expect(() =>
        assertAuthoredPreserved(f.catalog, resolved, candidate)
      ).not.toThrow();
      expect(candidate.content[0].props.data.constantValue).toEqual(
        cards.map((card: any) => ({ id: card.props.id }))
      );
    }
  );

  it("preserves explicit cards, translations, styling and order instead of using stale defaults", async () => {
    const f = slottedFixture();
    f.components.Section.defaultProps.data.constantValue = [{ id: "obsolete" }];
    const candidate = f.materialize([
      f.section([f.card("Second", "red"), f.card("First", "green")]),
    ]);
    const resolved = await f.resolve(candidate);
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).not.toThrow();
    expect(
      resolved.content[0].props.slots.CardSlot.map(
        (card: any) => card.props.data.question.defaultValue
      )
    ).toEqual(["Second", "First"]);
    expect(resolved.content[0].props.slots.CardSlot[0].props.styles.color).toBe(
      "red"
    );
    expect(
      resolved.content[0].props.slots.CardSlot[0].props.data.question.fr
    ).toBe("Traduction");
  });

  it("distinguishes an explicit empty list from default placeholder cards", async () => {
    const f = slottedFixture();
    const candidate = f.materialize([f.section([])]);
    const resolved = await f.resolve(candidate);
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).not.toThrow();
    expect(resolved.content[0].props.data.constantValue).toEqual([]);
    expect(resolved.content[0].props.slots.CardSlot).toEqual([]);
  });

  it("allocates unique identities in copied defaults and rewrites their references", async () => {
    const f = slottedFixture();
    const saved = f.materialize().content[0].props;
    f.components.Section.defaultProps = saved;
    const candidate = f.materialize([f.section(), f.section()]);
    expect(collectAuthoredIds(f.catalog, candidate).size).toBe(14);
    const resolved = await f.resolve(candidate);
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).not.toThrow();
    for (const section of candidate.content) {
      expect(section.props.data.constantValue).toEqual(
        section.props.slots.CardSlot.map((card: any) => ({ id: card.props.id }))
      );
      expect(section.props.slots.CardSlot[0].props.id).not.toBe(
        saved.slots.CardSlot[0].props.id
      );
    }
  });

  it.each([
    undefined,
    [],
    [{ name: "Linked first" }, { name: "Linked second" }],
  ])("resolves linked sources using library defaults (%j)", async (items) => {
    const f = slottedFixture();
    const candidate = f.materialize([f.section(defaults, f.linked)]);
    expect(candidate.content[0].props.slots.CardSlot).toEqual([]);
    const resolved = await f.resolve(candidate, {
      locale: "en",
      c_items: items,
    });
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).not.toThrow();
    expect(resolved.content[0].props.slots.CardSlot).toHaveLength(
      items?.length ?? 0
    );
    if (items?.length)
      expect(
        resolved.content[0].props.slots.CardSlot[0].props.styles.color
      ).toBe("blue");
    const again = await f.resolve(resolved, { locale: "en", c_items: items });
    expect(() =>
      assertAuthoredPreserved(f.catalog, again, candidate)
    ).not.toThrow();
    expect(again.content[0].props.manualSlots.CardSlot).toEqual([]);
  });

  it("preserves an inactive manual backup through linked resolution and switching back", async () => {
    const f = slottedFixture();
    const manual = f.materialize([f.section([f.card("Keep me")])]);
    f.components.Section.defaultProps = manual.content[0].props;
    const candidate = f.materialize([f.section(defaults, f.linked)]);
    const resolved = await f.resolve(candidate, {
      locale: "en",
      c_items: [{ name: "Entity question" }],
    });
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).not.toThrow();
    resolved.content[0].props.data.constantValueEnabled = true;
    const restored = await f.resolve(resolved);
    expect(
      restored.content[0].props.slots.CardSlot[0].props.data.question
        .defaultValue
    ).toBe("Keep me");
    validateAuthored(f.catalog, restored);
  });

  it("rejects explicitly authored linked cards and wrong manual card types", () => {
    const f = slottedFixture();
    expect(() => f.materialize([f.section([f.card()], f.linked)])).toThrow(
      /linked sources cannot author/
    );
    expect(() =>
      f.materialize([f.section([{ type: "Text", props: { text: "wrong" } }])])
    ).toThrow();
    expect(
      f.components.Section.fields.slots.objectFields.CardSlot.allow
    ).toEqual([]);
  });

  it.each([
    "content",
    "style",
    "order",
    "binding",
    "reference",
    "backup",
    "identity",
    "type",
  ])("rejects resolver changes to %s", async (change) => {
    const f = slottedFixture();
    const candidate = f.materialize([
      f.section([f.card("One"), f.card("Two")]),
    ]);
    const resolved = await f.resolve(candidate);
    const props = resolved.content[0].props;
    if (change === "content")
      props.slots.CardSlot[0].props.data.answer = "Replaced";
    if (change === "style") props.slots.CardSlot[0].props.styles.color = "red";
    if (change === "order") props.slots.CardSlot.reverse();
    if (change === "binding") props.data.field = "other";
    if (change === "reference") props.data.constantValue[0].id = "missing";
    if (change === "backup")
      props.manualSlots.CardSlot[0].props.data.answer = "Lost";
    if (change === "identity") props.slots.CardSlot[0].props.id = "replacement";
    if (change === "type") props.slots.CardSlot[0].type = "Text";
    expect(() =>
      assertAuthoredPreserved(f.catalog, resolved, candidate)
    ).toThrow();
  });

  it("protects the linked backup and validates derived card structure", async () => {
    const f = slottedFixture();
    f.components.Section.defaultProps = f.materialize().content[0].props;
    const candidate = f.materialize([f.section(defaults, f.linked)]);
    const resolved = await f.resolve(candidate, {
      locale: "en",
      c_items: [{ name: "Entity" }],
    });
    const changed = clone(resolved);
    changed.content[0].props.manualSlots.CardSlot[0].props.data.answer = "Lost";
    expect(() =>
      assertAuthoredPreserved(f.catalog, changed, candidate)
    ).toThrow(/FAQCard.*props\/data\/answer/);
    const malformed = clone(resolved);
    malformed.content[0].props.slots.CardSlot[0].props.id =
      candidate.content[0].props.id;
    expect(() => validateAuthored(f.catalog, malformed)).toThrow(/props\/id/);
    const child = clone(resolved);
    child.content[0].props.slots.CardSlot[0].props.slots.BodySlot[0].type =
      "Missing";
    expect(() => validateAuthored(f.catalog, child)).toThrow(/type/);
  });

  it("reports the changed location without including authored values", () => {
    const f = slottedFixture();
    const candidate = f.materialize([f.section([])]);
    const changed = clone(candidate);
    changed.content[0].props.title = "PRIVATE GENERATED CONTENT";
    expect(() =>
      assertAuthoredPreserved(f.catalog, changed, candidate)
    ).toThrow(/Section \(generated-.*props\/title/);
    try {
      assertAuthoredPreserved(f.catalog, changed, candidate);
    } catch (error) {
      expect(String(error)).not.toContain("PRIVATE GENERATED CONTENT");
    }
  });

  it("includes card authoring guidance once and only for available slotted sources", () => {
    const catalog = slottedFixture().catalog;
    catalog.data.components.OtherSection = catalog.data.components.Section;
    const prompt = buildGenerationPrompt(catalog);
    expect(prompt.split(slottedItemSourceGuidance)).toHaveLength(2);
    expect(prompt).toContain('"cardType":"FAQCard"');
    expect(
      prompt.slice(prompt.indexOf("Component descriptions and defaults:"))
    ).not.toContain(slottedItemSourceGuidance);
    expect(buildGenerationPrompt(catalog, ["MainContent"])).not.toContain(
      slottedItemSourceGuidance
    );
  });

  it("keeps references and backup storage out of model context", () => {
    const f = slottedFixture();
    const compiled = compileGenerationSchema(f.catalog, ["en"]);
    expect(JSON.stringify(compiled.jsonSchema)).not.toContain('"manualSlots"');
    f.components.Section.defaultProps = f.materialize().content[0].props;
    const prompt = buildGenerationPrompt(f.catalog);
    expect(prompt).toContain('"defaultManualItems":3');
    expect(prompt).not.toContain('"manualSlots"');
    expect(prompt).not.toContain('"id":');
    expect(
      extractAuthored(f.catalog, f.materialize()).content[0].props.data
        .constantValue
    ).toBeUndefined();
  });

  it.each([
    "missing card",
    "references",
    "backup",
    "slot restriction",
    "missing slot",
  ])("preflights invalid metadata: %s", (change) => {
    const f = slottedFixture();
    const config = f.components.Section;
    if (change === "missing card")
      config.generation.slottedItemSource = { cardType: "Missing" };
    if (change === "references")
      config.generation.props = config.generation.props.extend({
        data: config.generation.props.shape.data.extend({
          constantValue: z.array(z.unknown()),
        }),
      });
    if (change === "backup")
      config.generation.props = config.generation.props.extend({
        manualSlots: z.object({}),
      });
    if (change === "slot restriction")
      config.fields.slots.objectFields.CardSlot.disallow = ["FAQCard"];
    if (change === "missing slot")
      delete config.fields.slots.objectFields.CardSlot;
    expect(() => compileGenerationSchema(f.catalog, ["en"])).toThrow(
      /slottedItemSource/
    );
  });
});
