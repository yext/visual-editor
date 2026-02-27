#!/usr/bin/env python3
"""Extract candidate page sections from an HTML file.

This is a best-effort helper for planning generated template components.
It favors semantic tags (<header>, <section>, <main>, <article>, <footer>)
and emits a JSON summary with suggested component names.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from html import unescape
from pathlib import Path
from typing import Iterable, List


NOISE_PATTERN = re.compile(
    r"<!--.*?-->|<(script|style|noscript|template)\b[^>]*>.*?</\1>",
    re.IGNORECASE | re.DOTALL,
)

SEMANTIC_BLOCK_PATTERN = re.compile(
    r"<(header|section|main|article|footer)\b([^>]*)>(.*?)</\1>",
    re.IGNORECASE | re.DOTALL,
)

TAG_PATTERN = re.compile(r"<[^>]+>")
HEADING_PATTERN = re.compile(r"<h[1-4]\b[^>]*>(.*?)</h[1-4]>", re.IGNORECASE | re.DOTALL)


@dataclass
class SectionCandidate:
    index: int
    tag: str
    section_kind: str
    title: str
    suggested_component: str
    image_count: int
    link_count: int
    text_preview: str
    html_snippet: str


def collapse_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def strip_tags(html_fragment: str) -> str:
    return collapse_whitespace(unescape(TAG_PATTERN.sub(" ", html_fragment)))


def to_slug(text: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", normalized)


def to_pascal_case(text: str) -> str:
    parts = [part for part in to_slug(text).split("-") if part]
    return "".join(part.capitalize() for part in parts) or "Section"


def classify_section(tag: str, attrs: str, title: str, preview: str) -> str:
    haystack = " ".join([tag, attrs, title, preview]).lower()
    if any(keyword in haystack for keyword in ("hero", "masthead", "headline")):
        return "hero"

    rules = [
        ("footer", ("footer",)),
        ("header", ("header", "navigation", "nav")),
        ("features", ("feature", "benefit", "service")),
        ("testimonials", ("testimonial", "review", "quote")),
        ("faq", ("faq", "questions", "accordion")),
        ("cta", ("call to action", "get started", "book now", "contact")),
    ]
    for label, keywords in rules:
        if any(keyword in haystack for keyword in keywords):
            return label
    return "content"


def dedupe_component_name(name: str, used: set[str]) -> str:
    if name not in used:
        used.add(name)
        return name

    suffix = 2
    while True:
        candidate = f"{name}{suffix}"
        if candidate not in used:
            used.add(candidate)
            return candidate
        suffix += 1


def iter_semantic_blocks(html: str) -> Iterable[tuple[str, str, str]]:
    for match in SEMANTIC_BLOCK_PATTERN.finditer(html):
        tag = match.group(1).lower()
        attrs = match.group(2) or ""
        inner = match.group(3) or ""
        yield tag, attrs, inner


def extract_sections(
    html: str, min_text_chars: int, max_snippet_chars: int
) -> List[SectionCandidate]:
    cleaned_html = NOISE_PATTERN.sub(" ", html)
    used_component_names: set[str] = set()
    candidates: List[SectionCandidate] = []

    for tag, attrs, inner in iter_semantic_blocks(cleaned_html):
        text_content = strip_tags(inner)
        image_count = len(re.findall(r"<img\b", inner, re.IGNORECASE))
        link_count = len(re.findall(r"<a\b", inner, re.IGNORECASE))

        if len(text_content) < min_text_chars and image_count == 0 and link_count == 0:
            continue

        heading_match = HEADING_PATTERN.search(inner)
        heading = strip_tags(heading_match.group(1)) if heading_match else ""
        fallback_title = f"{tag.title()} {len(candidates) + 1}"
        title = heading if heading else fallback_title

        section_kind = classify_section(tag, attrs, title, text_content[:200])
        base_name = section_kind if heading == "" else title
        pascal_name = to_pascal_case(base_name)
        suggested_component = (
            pascal_name
            if pascal_name.lower().endswith("section")
            else f"{pascal_name}Section"
        )
        suggested_component = dedupe_component_name(
            suggested_component, used_component_names
        )

        candidates.append(
            SectionCandidate(
                index=len(candidates) + 1,
                tag=tag,
                section_kind=section_kind,
                title=title,
                suggested_component=suggested_component,
                image_count=image_count,
                link_count=link_count,
                text_preview=text_content[:280],
                html_snippet=collapse_whitespace(inner)[:max_snippet_chars],
            )
        )

    return candidates


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Path to source HTML file")
    parser.add_argument("--output", required=True, help="Path to output JSON file")
    parser.add_argument(
        "--min-text-chars",
        type=int,
        default=40,
        help="Minimum text characters for a section candidate (default: 40)",
    )
    parser.add_argument(
        "--max-snippet-chars",
        type=int,
        default=1800,
        help="Max chars to keep for each html_snippet (default: 1800)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"Input HTML file not found: {input_path}")

    html = input_path.read_text(encoding="utf-8", errors="ignore")
    sections = extract_sections(
        html=html,
        min_text_chars=args.min_text_chars,
        max_snippet_chars=args.max_snippet_chars,
    )

    payload = {
        "source_html": str(input_path),
        "candidate_count": len(sections),
        "sections": [section.__dict__ for section in sections],
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(sections)} section candidates to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
