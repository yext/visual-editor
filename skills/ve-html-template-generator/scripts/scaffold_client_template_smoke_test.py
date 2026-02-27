#!/usr/bin/env python3
"""Scaffold a lightweight screenshot smoke test for a generated client template."""

from __future__ import annotations

import argparse
import os
from pathlib import Path


def to_pascal_case(value: str) -> str:
    parts = [part for part in value.replace("_", "-").split("-") if part]
    return "".join(part[:1].upper() + part[1:] for part in parts)


def normalize_import_path(from_file: Path, to_file: Path) -> str:
    final = Path(os.path.relpath(str(to_file), str(from_file.parent)))
    normalized = final.as_posix()
    if not normalized.startswith("."):
        normalized = f"./{normalized}"
    return normalized


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--client-slug", required=True, help="Client slug (example: yeti)")
    parser.add_argument(
        "--template-path",
        required=True,
        help="Path to generated client template file (<client>-template.tsx)",
    )
    parser.add_argument(
        "--config-path",
        required=True,
        help="Path to generated client config file (<client>-config.tsx)",
    )
    parser.add_argument(
        "--output-path",
        default="",
        help=(
            "Optional output test file path. "
            "Defaults to packages/visual-editor/src/components/generated/<Client>Template.smoke.test.tsx"
        ),
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite output file if it already exists.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    client_slug = args.client_slug.strip()
    client_pascal = to_pascal_case(client_slug)

    workspace_root = Path.cwd()
    template_path = (workspace_root / args.template_path).resolve()
    config_path = (workspace_root / args.config_path).resolve()

    if not template_path.exists():
        raise FileNotFoundError(f"Template path not found: {template_path}")
    if not config_path.exists():
        raise FileNotFoundError(f"Config path not found: {config_path}")

    default_output = (
        workspace_root
        / "packages/visual-editor/src/components/generated"
        / f"{client_pascal}Template.smoke.test.tsx"
    )
    output_path = (
        (workspace_root / args.output_path).resolve()
        if args.output_path
        else default_output
    )

    if output_path.exists() and not args.overwrite:
        raise FileExistsError(
            f"Output already exists: {output_path} (use --overwrite to replace)"
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)

    config_import = normalize_import_path(output_path, config_path)
    template_import = normalize_import_path(output_path, template_path)
    config_symbol = f"{client_slug}Config"

    test_content_template = """import * as React from "react";
import { describe, it, expect } from "vitest";
import { Render } from "@puckeditor/core";
import { render as reactRender } from "@testing-library/react";
import { commands, page } from "@vitest/browser/context";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { axe, viewports } from "../testing/componentTests.setup.ts";
import { __CONFIG_SYMBOL__ } from "__CONFIG_IMPORT__";

// Template source reference:
// __TEMPLATE_IMPORT__

const testDocument = {
  locale: "en",
  id: "client-template-smoke",
  name: "__CLIENT_PASCAL__ Test Location",
  description: "Smoke test content for generated client template",
  address: {
    line1: "123 Test St",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    countryCode: "US",
  },
  mainPhone: "+15125551212",
  yextDisplayCoordinate: {
    latitude: 30.2672,
    longitude: -97.7431,
  },
  hours: {
    monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
    tuesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
    wednesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
    thursday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
    friday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
    saturday: { isClosed: true },
    sunday: { isClosed: true },
  },
};

const sectionEntries = Object.entries(__CONFIG_SYMBOL__.components).filter(
  ([name]) => name.endsWith("Section"),
);

const smokeData = {
  root: { props: {} },
  content: sectionEntries.map(([type, component]) => {
    const typed = component as { defaultProps?: Record<string, unknown> };
    return {
      type,
      props: typed.defaultProps ?? {},
    };
  }),
};

const isScreenshotMatch = (result: unknown): boolean => {
  if (typeof result === "boolean") {
    return result;
  }
  if (typeof result === "number") {
    return result === 0;
  }
  if (!result || typeof result !== "object") {
    return false;
  }

  const typed = result as {
    added?: unknown;
    pass?: unknown;
    passes?: unknown;
    numDiffPixels?: unknown;
    updated?: unknown;
  };

  if (typeof typed.passes === "boolean") {
    return typed.passes;
  }
  if (typeof typed.pass === "boolean") {
    return typed.pass;
  }
  if (typeof typed.numDiffPixels === "number") {
    return typed.numDiffPixels === 0;
  }
  if (typed.added === true || typed.updated === true) {
    return true;
  }
  return false;
};

const captureScreenshotData = async () => {
  const frame = window.frameElement as HTMLIFrameElement | null;
  if (frame) {
    frame.style.height = `${document.body.offsetHeight}px`;
  }

  const screenshot = await page.screenshot({ save: false });

  if (frame) {
    frame.style.height = "";
  }

  return screenshot;
};

describe("__CLIENT_PASCAL__ template smoke screenshots", () => {
  const targetViewports = [viewports.desktop, viewports.tablet, viewports.mobile];

  it.each(targetViewports)(
    "$name viewport smoke",
    async (viewport) => {
      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document: testDocument }}>
          <Render config={__CONFIG_SYMBOL__} data={smokeData} />
        </VisualEditorProvider>,
      );

      await page.viewport(viewport.width, viewport.height);
      const screenshot = await captureScreenshotData();
      const screenshotResult = await commands.compareScreenshot(
        `__CLIENT_PASCAL__Template/[${viewport.name}] smoke`,
        screenshot,
        0,
        undefined,
      );
      expect(isScreenshotMatch(screenshotResult)).toBe(true);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    },
  );
});
"""

    test_content = (
        test_content_template.replace("__CONFIG_SYMBOL__", config_symbol)
        .replace("__CONFIG_IMPORT__", config_import)
        .replace("__TEMPLATE_IMPORT__", template_import)
        .replace("__CLIENT_PASCAL__", client_pascal)
    )

    output_path.write_text(test_content, encoding="utf-8")
    print(f"[OK] Wrote smoke test: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
