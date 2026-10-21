// @vitest-environment node
import { expect, it } from "vitest";
import { withGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { clone, validateAuthored } from "./authoredValues.ts";
import { slottedFixture } from "../testing/slottedFixtures.ts";
import { synchronizeManualCardSlots } from "./synchronizeManualCardSlots.ts";

it("repairs nested manual backups without changing visible cards, references, or unrelated storage", () => {
  const f = slottedFixture();
  const section = f.materialize().content[0];
  const props = section.props;
  props.slots.CardSlot[0].props.styles.color = "red";
  props.slots.CardSlot[0].props.slots.BodySlot[0].props.text = "Synchronized";
  props.manualSlots.editorOwned = { keep: true };
  const data = {
    root: { props: { title: "", version: 83 } },
    content: [
      { type: "MainContent", props: { id: "main", content: [section] } },
    ],
  };
  const before = clone(data);
  const { generation: _, ...sectionConfig } = f.components.Section;
  const config = withGenerationCatalog(
    {
      components: {
        ...f.components,
        Section: sectionConfig,
        MainContent: {
          fields: { content: { type: "slot" } },
          render: f.components.Section.render,
        },
      },
    },
    f.catalog
  );
  expect(() => validateAuthored(f.catalog, data)).toThrow(/manualSlots/);
  const result = synchronizeManualCardSlots(data, config);
  const repaired = result.content[0].props.content[0].props;
  expect(() => validateAuthored(f.catalog, result)).not.toThrow();
  expect(repaired.slots).toEqual(props.slots);
  expect(repaired.data).toEqual(props.data);
  expect(repaired.manualSlots.editorOwned).toEqual({ keep: true });
  expect(repaired.manualSlots.CardSlot).toEqual(props.slots.CardSlot);
  expect(repaired.manualSlots.CardSlot).not.toBe(repaired.slots.CardSlot);
  expect(data).toEqual(before);
  expect(synchronizeManualCardSlots(result, config)).toBe(result);
});

it("preserves the inactive manual backup for linked cards", async () => {
  const f = slottedFixture();
  const data = await f.resolve(
    f.materialize([f.section({ $default: true }, f.linked)]),
    { locale: "en", c_items: [{ name: "Linked item" }] }
  );
  const before = clone(data);
  expect(synchronizeManualCardSlots(data, { components: f.components })).toBe(
    data
  );
  expect(data).toEqual(before);
});

it("does not repair invalid card references or accept invalid visible props", () => {
  const f = slottedFixture();
  const data = { content: f.materialize().content, root: { props: {} } };
  data.content[0].props.slots.CardSlot[0].props.styles.color = 123;
  const result = synchronizeManualCardSlots(data, { components: f.components });
  expect(() => validateAuthored(f.catalog, result)).toThrow(/color/);
  result.content[0].props.slots.CardSlot[0].props.styles.color = "blue";
  result.content[0].props.data.constantValue = [];
  const invalidReferences = synchronizeManualCardSlots(result, {
    components: f.components,
  });
  expect(() => validateAuthored(f.catalog, invalidReferences)).toThrow(
    /constantValue/
  );
});
