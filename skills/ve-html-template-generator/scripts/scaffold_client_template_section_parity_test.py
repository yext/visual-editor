#!/usr/bin/env python3
"""Scaffold a section-level visual parity test for source HTML vs generated client sections."""

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
            "Defaults to packages/visual-editor/src/components/generated/<Client>Template.section-parity.test.tsx"
        ),
    )
    parser.add_argument(
        "--source-copy-path",
        default="",
        help=(
            "Optional path where source HTML should be copied for test import. "
            "Defaults to packages/visual-editor/src/components/generated/<Client>Template.section-parity.source.html"
        ),
    )
    parser.add_argument(
        "--max-sections",
        type=int,
        default=8,
        help="Default maximum section pairs to compare (can be overridden by env).",
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
    default_output = generated_dir / f"{client_pascal}Template.section-parity.test.tsx"
    default_source_copy = generated_dir / f"{client_pascal}Template.section-parity.source.html"

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

    max_sections = args.max_sections if args.max_sections > 0 else 8

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
  id: "client-template-section-parity",
  name: "__CLIENT_PASCAL__ Test Location",
  description: "Section parity test content for generated client template",
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

type SourceSection = {
  html: string;
  label: string;
  text: string;
};

const clearSourceHead = () => {
  document.head
    .querySelectorAll("[data-section-parity-source-head]")
    .forEach((node) => node.remove());
};

const clearBody = () => {
  document.body.innerHTML = "";
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

const isMeaningfulSourceNode = (node: Element): boolean => {
  const text = (node.textContent ?? "").replace(/\\s+/g, " ").trim();
  if (text.length >= 40) {
    return true;
  }
  if (node.querySelector("img, picture, video, iframe, svg")) {
    return true;
  }
  return node.querySelectorAll("a").length >= 2;
};

const isExcludedSourceNode = (node: Element): boolean => {
  const text = (node.textContent ?? "").replace(/\\s+/g, " ").trim().toLowerCase();
  const className = (node.getAttribute("class") ?? "").toLowerCase();
  const id = (node.getAttribute("id") ?? "").toLowerCase();
  const marker = `${className} ${id}`;

  if (node.getAttribute("hidden") !== null) {
    return true;
  }
  if (node.getAttribute("aria-hidden") === "true") {
    return true;
  }

  // Skip consent/cookie overlays that do not represent page template bands.
  if (
    marker.includes("onetrust") ||
    marker.includes("ot-") ||
    text.includes("cookie list") ||
    text.includes("consent")
  ) {
    return true;
  }

  return false;
};

const getSourceDocument = () =>
  new DOMParser().parseFromString(sourceHtml, "text/html");

const collectSourceSections = (): SourceSection[] => {
  const parsed = getSourceDocument();
  const selectors = [
    "header",
    "main > section",
    "main > article",
    "main > div",
    "section",
    "article",
    "footer",
  ];
  const sections: SourceSection[] = [];
  const seen = new Set<Element>();

  selectors.forEach((selector) => {
    parsed.body.querySelectorAll(selector).forEach((node) => {
      if (
        seen.has(node) ||
        isExcludedSourceNode(node) ||
        !isMeaningfulSourceNode(node)
      ) {
        return;
      }
      seen.add(node);
      const heading =
        node.querySelector("h1, h2, h3, h4")?.textContent?.trim() ?? "";
      const tag = node.tagName.toLowerCase();
      const text = (node.textContent ?? "").replace(/\\s+/g, " ").trim();
      sections.push({
        html: (node as HTMLElement).outerHTML,
        label: heading.length > 0 ? `${tag}:${heading}` : tag,
        text,
      });
    });
  });

  if (!sections.length) {
    const fallback = parsed.body.innerHTML?.trim();
    sections.push({
      html: fallback && fallback.length > 0 ? fallback : sourceHtml,
      label: "body:fallback",
      text: (parsed.body.textContent ?? "").replace(/\\s+/g, " ").trim(),
    });
  }

  return sections;
};

const getSectionKeywords = (sectionType: string): string[] => {
  const type = sectionType.toLowerCase();
  if (type.includes("header")) {
    return ["terms", "top links", "menu", "actions", "find your restaurant"];
  }
  if (type.includes("locationhero")) {
    return [
      "order now",
      "get directions",
      "set as my preferred location",
      "deliciousness",
      "westminster",
    ];
  }
  if (type.includes("operations")) {
    return ["store hours", "map", "nearby stores", "drive thru"];
  }
  if (type.includes("amenities") || type.includes("faq")) {
    return ["services available", "question & answers", "mcdelivery", "wi-fi"];
  }
  if (type.includes("about")) {
    return ["about this location", "careers", "apply for a job"];
  }
  if (type.includes("footer")) {
    return [
      "explore mcdonald",
      "social",
      "download app",
      "legal",
      "all rights reserved",
      "privacy",
    ];
  }
  return [];
};

const scoreSectionMatch = (sectionType: string, sourceSection: SourceSection): number => {
  const type = sectionType.toLowerCase();
  const label = sourceSection.label.toLowerCase();
  const text = sourceSection.text.toLowerCase();
  const keywords = getSectionKeywords(sectionType);
  let score = 0;

  keywords.forEach((keyword) => {
    if (text.includes(keyword) || label.includes(keyword)) {
      score += 4;
    }
  });

  if (type.includes("header") && label.startsWith("header")) {
    score += 25;
  }
  if (type.includes("footer") && label.startsWith("footer")) {
    score += 25;
  }

  if (!type.includes("footer") && label.startsWith("footer")) {
    score -= 12;
  }
  if (!type.includes("header") && label.startsWith("header")) {
    score -= 8;
  }

  return score;
};

const pairSections = (
  sourceSections: SourceSection[],
  generatedSections: Array<[string, unknown]>,
): Array<{
  sourceIndex: number;
  sourceSection: SourceSection;
  generated: [string, unknown];
}> => {
  const pairs: Array<{
    sourceIndex: number;
    sourceSection: SourceSection;
    generated: [string, unknown];
  }> = [];

  generatedSections.forEach((generated) => {
    const [sectionType] = generated;
    let bestIndex = -1;
    let bestScore = Number.NEGATIVE_INFINITY;

    sourceSections.forEach((sourceSection, index) => {
      const score = scoreSectionMatch(sectionType, sourceSection);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestIndex === -1) {
      return;
    }

    pairs.push({
      sourceIndex: bestIndex,
      sourceSection: sourceSections[bestIndex],
      generated,
    });
  });

  return pairs;
};

const mountSourceSection = (section: SourceSection) => {
  const parsed = getSourceDocument();
  clearSourceHead();
  clearBody();

  parsed.head
    .querySelectorAll("style, link[rel='stylesheet']")
    .forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-section-parity-source-head", "true");
      document.head.appendChild(clone);
    });

  const root = document.createElement("div");
  root.setAttribute("data-section-parity-source-root", "true");
  root.innerHTML = section.html;
  document.body.appendChild(root);
};

const mountGeneratedSection = (
  sectionType: string,
  sectionProps: Record<string, unknown>,
) => {
  clearSourceHead();
  clearBody();
  return reactRender(
    <VisualEditorProvider templateProps={{ document: testDocument }}>
      <Render
        config={__CONFIG_SYMBOL__}
        data={{
          root: { props: {} },
          content: [{ type: sectionType, props: sectionProps }],
        }}
      />
    </VisualEditorProvider>,
  );
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

describe("__CLIENT_PASCAL__ template section parity", () => {
  const allViewports =
    getRuntimeEnv("CLIENT_TEMPLATE_SECTION_PARITY_ALL_VIEWPORTS") === "1";
  const targetViewports = allViewports
    ? [viewports.desktop, viewports.tablet, viewports.mobile]
    : [viewports.desktop];
  const maxDiff = Number(
    getRuntimeEnv("CLIENT_TEMPLATE_SECTION_PARITY_MAX_DIFF") ?? "-1",
  );
  const maxSectionsFromEnv = Number(
    getRuntimeEnv("CLIENT_TEMPLATE_SECTION_PARITY_LIMIT") ?? "__MAX_SECTIONS__",
  );
  const sectionLimit = Number.isFinite(maxSectionsFromEnv)
    ? Math.max(1, Math.floor(maxSectionsFromEnv))
    : __MAX_SECTIONS__;

  it.each(targetViewports)(
    "$name viewport section parity",
    async (viewport) => {
      await page.viewport(viewport.width, viewport.height);

      const sourceSections = collectSourceSections();
      const generatedSections = sectionEntries.slice(0, sectionLimit);
      const sectionPairs = pairSections(sourceSections, generatedSections);
      const pairCount = sectionPairs.length;

      console.info(
        `[SectionParity] __CLIENT_PASCAL__ ${viewport.name} comparing ${pairCount} section pairs (source=${sourceSections.length}, generated=${generatedSections.length})`,
      );
      expect(pairCount).toBeGreaterThan(0);

      for (let index = 0; index < pairCount; index += 1) {
        const pair = sectionPairs[index];
        const sourceSection = pair.sourceSection;
        const [sectionType, component] = pair.generated;
        const typed = component as { defaultProps?: Record<string, unknown> };

        mountSourceSection(sourceSection);
        await delay(250);

        const sourceBaselineName =
          `__CLIENT_PASCAL__SectionParity/[${viewport.name}] section-${index + 1}-source-${pair.sourceIndex + 1}`;
        const sourceScreenshot = await captureScreenshotData();
        await commands.compareScreenshot(
          sourceBaselineName,
          sourceScreenshot,
          0,
          undefined,
        );

        const { container, unmount } = mountGeneratedSection(
          sectionType,
          typed.defaultProps ?? {},
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
          `[SectionParity] __CLIENT_PASCAL__ ${viewport.name} section ${index + 1} (${sectionType} vs source[${pair.sourceIndex + 1}] ${sourceSection.label}) diff pixels: ${diffPixels}`,
        );

        await commands.compareScreenshot(
          `__CLIENT_PASCAL__SectionParity/[${viewport.name}] section-${index + 1}-${sectionType}-generated`,
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
        clearBody();
      }

      clearSourceHead();
      clearBody();
    },
  );
});
"""

    test_content = (
        test_content_template.replace("__CONFIG_SYMBOL__", config_symbol)
        .replace("__CONFIG_IMPORT__", config_import)
        .replace("__SOURCE_IMPORT__", source_import)
        .replace("__CLIENT_PASCAL__", client_pascal)
        .replace("__MAX_SECTIONS__", str(max_sections))
    )

    output_path.write_text(test_content, encoding="utf-8")
    print(f"[OK] Copied source HTML to: {source_copy_path}")
    print(f"[OK] Wrote section parity test: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
