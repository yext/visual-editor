#!/usr/bin/env python3
"""Scaffold a visual parity test for source HTML vs generated client template."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from shutil import copyfile


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
        "--html-path",
        required=True,
        help="Path to source HTML file used for generation",
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
            "Defaults to packages/visual-editor/src/components/generated/<Client>Template.visual-parity.test.tsx"
        ),
    )
    parser.add_argument(
        "--source-copy-path",
        default="",
        help=(
            "Optional path where source HTML should be copied for test import. "
            "Defaults to packages/visual-editor/src/components/generated/<Client>Template.source.html"
        ),
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite output files if they already exist.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    client_slug = args.client_slug.strip()
    client_pascal = to_pascal_case(client_slug)

    workspace_root = Path.cwd()
    html_path = (workspace_root / args.html_path).resolve()
    config_path = (workspace_root / args.config_path).resolve()

    if not html_path.exists():
        raise FileNotFoundError(f"Source HTML path not found: {html_path}")
    if not config_path.exists():
        raise FileNotFoundError(f"Config path not found: {config_path}")

    generated_dir = workspace_root / "packages/visual-editor/src/components/generated"
    default_output = generated_dir / f"{client_pascal}Template.visual-parity.test.tsx"
    default_source_copy = generated_dir / f"{client_pascal}Template.source.html"

    output_path = (
        (workspace_root / args.output_path).resolve()
        if args.output_path
        else default_output
    )
    source_copy_path = (
        (workspace_root / args.source_copy_path).resolve()
        if args.source_copy_path
        else default_source_copy
    )

    if output_path.exists() and not args.overwrite:
        raise FileExistsError(
            f"Output already exists: {output_path} (use --overwrite to replace)"
        )
    if source_copy_path.exists() and not args.overwrite:
        raise FileExistsError(
            f"Source copy already exists: {source_copy_path} (use --overwrite to replace)"
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    source_copy_path.parent.mkdir(parents=True, exist_ok=True)
    copyfile(html_path, source_copy_path)

    config_import = normalize_import_path(output_path, config_path)
    source_import = normalize_import_path(output_path, source_copy_path) + "?raw"
    config_symbol = f"{client_slug}Config"

    test_content_template = """import * as React from "react";
import { describe, it, expect } from "vitest";
import { Render } from "@puckeditor/core";
import { render as reactRender } from "@testing-library/react";
import { commands, page } from "@vitest/browser/context";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { axe, delay, viewports } from "../testing/componentTests.setup.ts";
import { __CONFIG_SYMBOL__ } from "__CONFIG_IMPORT__";
import sourceHtml from "__SOURCE_IMPORT__";

const testDocument = {
  locale: "en",
  id: "client-template-parity",
  name: "__CLIENT_PASCAL__ Test Location",
  description: "Visual parity test content for generated client template",
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

const captureScreenshotData = async () => {
  const frame = window.frameElement as HTMLIFrameElement | null;
  if (frame) {
    frame.style.height = `${document.body.offsetHeight}px`;
  }

  const screenshot = await page.screenshot({
    save: false,
  });

  if (frame) {
    frame.style.height = "";
  }

  return screenshot;
};

const mountSourceHtml = () => {
  const parsed = new DOMParser().parseFromString(sourceHtml, "text/html");

  document.head
    .querySelectorAll("[data-parity-source-head]")
    .forEach((node) => node.remove());
  document.body.innerHTML = "";

  parsed.head
    .querySelectorAll("style, link[rel='stylesheet']")
    .forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-parity-source-head", "true");
      document.head.appendChild(clone);
    });

  const sourceRoot = document.createElement("div");
  sourceRoot.setAttribute("data-parity-source-root", "true");
  const bodyHtml = parsed.body?.innerHTML?.trim();
  sourceRoot.innerHTML = bodyHtml && bodyHtml.length > 0 ? bodyHtml : sourceHtml;
  document.body.appendChild(sourceRoot);
};

const readDiffPixels = (result: unknown): number => {
  if (typeof result === "number") {
    return result;
  }
  if (
    result &&
    typeof result === "object" &&
    "numDiffPixels" in (result as Record<string, unknown>)
  ) {
    const value = (result as { numDiffPixels?: unknown }).numDiffPixels;
    return typeof value === "number" ? value : 0;
  }
  return 0;
};

const getRuntimeEnv = (key: string): string | undefined => {
  const viteEnv = (
    import.meta as ImportMeta & { env?: Record<string, unknown> }
  ).env?.[key];
  if (typeof viteEnv === "string") {
    return viteEnv;
  }

  const processEnv = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.[key];
  return typeof processEnv === "string" ? processEnv : undefined;
};

describe("__CLIENT_PASCAL__ template visual parity", () => {
  const targetViewports = [viewports.desktop, viewports.tablet, viewports.mobile];
  const maxDiff = Number(getRuntimeEnv("CLIENT_TEMPLATE_PARITY_MAX_DIFF") ?? "-1");

  it.each(targetViewports)(
    "$name viewport parity",
    async (viewport) => {
      await page.viewport(viewport.width, viewport.height);

      mountSourceHtml();
      await delay(250);

      const sourceBaselineName =
        `__CLIENT_PASCAL__TemplateParity/[${viewport.name}] source-baseline`;
      const sourceScreenshot = await captureScreenshotData();
      await commands.compareScreenshot(sourceBaselineName, sourceScreenshot, 0, undefined);

      document.body.innerHTML = "";
      const { container, unmount } = reactRender(
        <VisualEditorProvider templateProps={{ document: testDocument }}>
          <Render config={__CONFIG_SYMBOL__} data={smokeData} />
        </VisualEditorProvider>,
      );

      await delay(250);
      const generatedScreenshot = await captureScreenshotData();
      const parityResult = await commands.compareScreenshot(
        sourceBaselineName,
        generatedScreenshot,
        Number.MAX_SAFE_INTEGER,
        undefined,
      );
      const diffPixels = readDiffPixels(parityResult);
      console.info(
        `[VisualParity] __CLIENT_PASCAL__ ${viewport.name} diff pixels: ${diffPixels}`,
      );

      await commands.compareScreenshot(
        `__CLIENT_PASCAL__TemplateParity/[${viewport.name}] generated-preview`,
        generatedScreenshot,
        0,
        undefined,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
      expect(diffPixels).toBeGreaterThanOrEqual(0);
      if (maxDiff >= 0) {
        expect(diffPixels).toBeLessThanOrEqual(maxDiff);
      }

      unmount();
      document.body.innerHTML = "";
      document.head
        .querySelectorAll("[data-parity-source-head]")
        .forEach((node) => node.remove());
    },
  );
});
"""

    test_content = (
        test_content_template.replace("__CONFIG_SYMBOL__", config_symbol)
        .replace("__CONFIG_IMPORT__", config_import)
        .replace("__SOURCE_IMPORT__", source_import)
        .replace("__CLIENT_PASCAL__", client_pascal)
    )

    output_path.write_text(test_content, encoding="utf-8")
    print(f"[OK] Copied source HTML to: {source_copy_path}")
    print(f"[OK] Wrote visual parity test: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
