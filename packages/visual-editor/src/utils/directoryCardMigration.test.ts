import {
  type Config,
  type Data,
  type DefaultComponents,
  walkTree,
} from "@puckeditor/core";
import { createElement, Fragment } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { migrationRegistry } from "../components/migrations/migrationRegistry.ts";
import { migrate } from "./migrate.ts";

type LayoutData = Data<DefaultComponents, { title?: string; version?: number }>;

const renderEmpty = () => createElement(Fragment);

const config: Config = {
  components: {
    MainContent: {
      fields: { content: { type: "slot" } },
      render: renderEmpty,
    },
    DirectoryGrid: {
      fields: {
        slots: {
          type: "object",
          objectFields: { CardSlot: { type: "slot" } },
        },
        manualSlots: {
          type: "object",
          objectFields: { CardSlot: { type: "slot" } },
        },
      },
      render: renderEmpty,
    },
    DirectoryCard: {
      fields: {
        slots: {
          type: "object",
          objectFields: {
            HeadingSlot: { type: "slot" },
            AddressSlot: { type: "slot" },
            PhoneSlot: { type: "slot" },
            HoursSlot: { type: "slot" },
          },
        },
      },
      render: renderEmpty,
    },
    HeadingTextSlot: { render: renderEmpty },
    SlotContainer: {
      fields: { content: { type: "slot" } },
      render: renderEmpty,
    },
    AddressSlot: { render: renderEmpty },
    PhoneSlot: { render: renderEmpty },
    HoursStatusSlot: { render: renderEmpty },
  },
};

const createCard = (id: string, headingId = `${id}-heading`) => ({
  type: "DirectoryCard",
  props: {
    id,
    index: 0,
    data: { cardTitle: { defaultValue: "Example office" } },
    styles: { backgroundColor: { selectedColor: "white" } },
    parentData: { childRef: { childId: "office-1", childIndex: 0 } },
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            id: headingId,
            data: {
              text: {
                field: "name",
                constantValue: { defaultValue: "Example office" },
                constantValueEnabled: false,
              },
            },
            styles: { level: 3, align: "left" },
          },
        },
      ],
    },
  },
});

const createLayout = (version: number): LayoutData => {
  const cards = [createCard("DirectoryCard-example")];
  return {
    root: { props: { version } },
    content: [
      {
        type: "DirectoryGrid",
        props: {
          id: "directory-grid",
          slots: { CardSlot: cards },
          ...(version >= 77 ? { manualSlots: { CardSlot: cards } } : {}),
        },
      },
    ],
  };
};

const getGrid = (data: LayoutData) => {
  const grid = data.content
    .flatMap<Data["content"][number]>((component) =>
      component.type === "MainContent" ? component.props.content : [component]
    )
    .find((component) => component.type === "DirectoryGrid");
  expect(grid).toBeDefined();
  return grid!;
};

const collectComponentIds = (data: LayoutData): string[] => {
  const ids: string[] = [];
  walkTree(data, config, (content) => {
    content.forEach((component) => ids.push(component.props.id));
    return content;
  });
  return ids;
};

describe("directory card identity migration", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([72, 77, 83])(
    "repairs duplicated hidden cards in version %i layouts without changing visible cards",
    (version) => {
      const input = createLayout(version);
      const originalInput = structuredClone(input);
      const beforeRepair = migrate(
        config,
        input,
        {},
        migrationRegistry.slice(0, 83)
      );
      const result = migrate(config, input, {});
      const ids = collectComponentIds(result);

      expect(new Set(ids).size).toBe(ids.length);
      expect(getGrid(result).props.slots).toEqual(
        getGrid(beforeRepair).props.slots
      );
      expect(getGrid(result).props.manualSlots.CardSlot[0].props.id).not.toBe(
        "DirectoryCard-example"
      );
      const hiddenCard = getGrid(result).props.manualSlots.CardSlot[0];
      expect(hiddenCard.props.id).toMatch(/^DirectoryCard-[A-Za-z0-9]{5}$/);
      expect(hiddenCard.props.slots.HeadingSlot[0].props.id).toMatch(
        /^HeadingTextSlot-[A-Za-z0-9]{5}$/
      );
      const previousHiddenCard =
        getGrid(beforeRepair).props.manualSlots.CardSlot[0];
      expect(hiddenCard.props.data).toEqual(previousHiddenCard.props.data);
      expect(hiddenCard.props.styles).toEqual(previousHiddenCard.props.styles);
      expect(hiddenCard.props.parentData).toEqual(
        previousHiddenCard.props.parentData
      );
      expect(hiddenCard.props.slots.HeadingSlot[0].props.data).toEqual(
        previousHiddenCard.props.slots.HeadingSlot[0].props.data
      );
      expect(hiddenCard.props.slots.HeadingSlot[0].props.styles).toEqual(
        previousHiddenCard.props.slots.HeadingSlot[0].props.styles
      );
      expect(input).toEqual(originalInput);
      expect(migrate(config, result, {})).toEqual(result);
    }
  );

  it("preserves already-distinct hidden identities and entity references", () => {
    const input = createLayout(83);
    getGrid(input).props.manualSlots.CardSlot = [createCard("manual-card")];

    const result = migrate(config, input, {});

    expect(getGrid(result).props).toEqual(getGrid(input).props);
    expect(
      getGrid(result).props.manualSlots.CardSlot[0].props.parentData.childRef
        .childId
    ).toBe("office-1");
  });

  it("retries short IDs that would collide with a later hidden card", () => {
    const input = createLayout(83);
    const grid = getGrid(input);
    grid.props.manualSlots.CardSlot = [
      ...grid.props.manualSlots.CardSlot,
      createCard("DirectoryCard-aaaaa"),
    ];
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    for (let index = 0; index < 5; index++) {
      random.mockReturnValueOnce(0);
    }
    for (let index = 0; index < 5; index++) {
      random.mockReturnValueOnce(1 / 62);
    }

    const result = migrate(config, input, {});
    const hiddenCards = getGrid(result).props.manualSlots.CardSlot;
    const ids = collectComponentIds(result);

    expect(hiddenCards[0].props.id).toBe("DirectoryCard-bbbbb");
    expect(hiddenCards[1].props.id).toBe("DirectoryCard-aaaaa");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("repairs colliding child identities when card identities are distinct", () => {
    const input = createLayout(83);
    getGrid(input).props.manualSlots.CardSlot = [
      createCard("manual-card", "DirectoryCard-example-heading"),
    ];

    const result = migrate(config, input, {});
    const hiddenCard = getGrid(result).props.manualSlots.CardSlot[0];
    const ids = collectComponentIds(result);

    expect(hiddenCard.props.id).toBe("manual-card");
    expect(hiddenCard.props.slots.HeadingSlot[0].props.id).not.toBe(
      "DirectoryCard-example-heading"
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("repairs descendants in nested slots without mutating shared objects", () => {
    const input = createLayout(83);
    const grid = getGrid(input);
    const heading = grid.props.slots.CardSlot[0].props.slots.HeadingSlot[0];
    grid.props.slots.CardSlot[0].props.slots.HeadingSlot = [
      {
        type: "SlotContainer",
        props: { id: "heading-container", content: [heading] },
      },
    ];
    const originalInput = structuredClone(input);

    const result = migrate(config, input, {});
    const hiddenContainer =
      getGrid(result).props.manualSlots.CardSlot[0].props.slots.HeadingSlot[0];
    const ids = collectComponentIds(result);

    expect(hiddenContainer.props.id).not.toBe("heading-container");
    expect(hiddenContainer.props.content[0].props.id).not.toBe(
      "DirectoryCard-example-heading"
    );
    expect(hiddenContainer.props.content[0].props.data).toEqual(
      heading.props.data
    );
    expect(getGrid(result).props.slots).toEqual(grid.props.slots);
    expect(new Set(ids).size).toBe(ids.length);
    expect(input).toEqual(originalInput);
  });

  it.each([undefined, { CardSlot: [] }])(
    "preserves layouts without hidden cards: %j",
    (manualSlots) => {
      const input = createLayout(83);
      getGrid(input).props.manualSlots = manualSlots;

      expect(getGrid(migrate(config, input, {})).props).toEqual(
        getGrid(input).props
      );
    }
  );
});
