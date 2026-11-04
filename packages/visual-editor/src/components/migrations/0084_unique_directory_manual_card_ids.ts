import { type Migration } from "../../utils/migrate.ts";

type Component = {
  type: string;
  props: { id: string } & Record<string, unknown>;
};

const isComponent = (value: object): value is Component =>
  "type" in value &&
  typeof value.type === "string" &&
  "props" in value &&
  typeof value.props === "object" &&
  value.props !== null &&
  "id" in value.props &&
  typeof value.props.id === "string";

const collectComponentIds = (
  value: unknown,
  componentIds: Set<string>
): void => {
  if (!value || typeof value !== "object") {
    return;
  }

  if (isComponent(value)) {
    componentIds.add(value.props.id);
  }
  Object.values(value).forEach((child) =>
    collectComponentIds(child, componentIds)
  );
};

const createComponentId = (type: string, reservedIds: Set<string>): string => {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id: string;
  do {
    const suffix = Array.from(
      { length: 5 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join("");
    id = `${type}-${suffix}`;
  } while (reservedIds.has(id));
  reservedIds.add(id);
  return id;
};

const repairComponentIds = (
  value: unknown,
  seenIds: Set<string>,
  reservedIds: Set<string>
): unknown => {
  if (Array.isArray(value)) {
    return value.map((child) =>
      repairComponentIds(child, seenIds, reservedIds)
    );
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const result = { ...value };
  if (isComponent(value)) {
    const id = seenIds.has(value.props.id)
      ? createComponentId(value.type, reservedIds)
      : value.props.id;
    seenIds.add(id);
    Object.assign(result, { props: { ...value.props, id } });
  }

  return Object.fromEntries(
    Object.entries(result).map(([key, child]) => [
      key,
      repairComponentIds(child, seenIds, reservedIds),
    ])
  );
};

export const uniqueDirectoryManualCardIds: Migration = {
  DirectoryGrid: {
    action: "updated",
    propTransformation: (props) => {
      const manualCards = props.manualSlots?.CardSlot;
      if (!manualCards?.length) {
        return props;
      }

      // Migration 77 copied the same cards into both registered slot trees.
      // Rebuild the hidden tree so shared objects cannot change visible IDs.
      const seenIds = new Set<string>([props.id]);
      collectComponentIds(props.slots?.CardSlot, seenIds);
      const reservedIds = new Set(seenIds);
      collectComponentIds(manualCards, reservedIds);

      return {
        ...props,
        manualSlots: {
          ...props.manualSlots,
          CardSlot: repairComponentIds(manualCards, seenIds, reservedIds),
        },
      };
    },
  },
};
