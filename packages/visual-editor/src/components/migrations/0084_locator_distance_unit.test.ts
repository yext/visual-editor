import { type Config } from "@puckeditor/core";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "./migrationRegistry.ts";

describe("Locator distance unit migration", () => {
  const config = {
    components: {
      Locator: {
        render: () => createElement("div"),
      },
    },
  } as Config;

  it.each([
    {
      name: "sets the previous page-language behavior",
      distanceUnit: undefined,
      expected: "locale",
    },
    {
      name: "preserves a selected distance unit",
      distanceUnit: "mile",
      expected: "mile",
    },
  ])("$name", ({ distanceUnit, expected }) => {
    const result = migrate(
      config,
      {
        root: { props: { version: migrationRegistry.length - 1 } },
        content: [
          { type: "Locator", props: { id: "Locator-test", distanceUnit } },
        ],
        zones: {},
      },
      {} as any
    );

    expect(result.content[0].props.distanceUnit).toBe(expected);
    expect((result.root.props as { version?: number })?.version).toBe(
      migrationRegistry.length
    );
  });
});
