#!/usr/bin/env python3
"""Validate generated client template structure and core conventions."""

from __future__ import annotations

import argparse
import difflib
import re
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--client-path",
        required=True,
        help=(
            "Path to client slug directory. Prefer starter wrapper path "
            "(e.g. starter/src/templates/yeti); package custom path "
            "(packages/visual-editor/src/components/custom/yeti) is also supported."
        ),
    )
    return parser.parse_args()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def fail(message: str, failures: list[str]) -> None:
    failures.append(message)


def to_pascal_case(value: str) -> str:
    parts = re.split(r"[^A-Za-z0-9]+", value)
    return "".join(part[:1].upper() + part[1:] for part in parts if part)


def extract_slot_field_keys(text: str) -> list[str]:
    pattern = re.compile(
        r'^\s*([A-Za-z0-9_]+Slot)\s*:\s*\{\s*type:\s*["\']slot["\']\s*\}',
        re.MULTILINE,
    )
    return sorted(set(pattern.findall(text)))


def extract_object_field_keys(text: str, object_name: str) -> list[str]:
    marker = f"{object_name}: YextField"
    start = text.find(marker)
    if start == -1:
        return []

    object_fields_idx = text.find("objectFields", start)
    if object_fields_idx == -1:
        return []

    brace_start = text.find("{", object_fields_idx)
    if brace_start == -1:
        return []

    depth = 0
    brace_end = -1
    for index in range(brace_start, len(text)):
        char = text[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                brace_end = index
                break

    if brace_end == -1:
        return []

    block = text[brace_start + 1 : brace_end]
    keys = re.findall(r"^\s*([A-Za-z0-9_]+)\s*:\s*YextField", block, re.MULTILINE)
    return sorted(set(keys))


def extract_translatable_entity_keys(text: str) -> list[str]:
    pattern = re.compile(
        r"^\s*([A-Za-z0-9_]+)\s*:\s*YextEntityField<\s*TranslatableString\s*>",
        re.MULTILINE,
    )
    return sorted(set(pattern.findall(text)))


def extract_translatable_richtext_entity_keys(text: str) -> list[str]:
    pattern = re.compile(
        r"^\s*([A-Za-z0-9_]+)\s*:\s*YextEntityField<\s*TranslatableRichText\s*>",
        re.MULTILINE,
    )
    return sorted(set(pattern.findall(text)))


def has_plain_string_constant_for_key(text: str, key: str) -> bool:
    # Detect default object literals where a TranslatableString entity field is initialized
    # with a plain string constantValue instead of localized object shape.
    pattern = re.compile(
        rf"{re.escape(key)}\s*:\s*\{{[\s\S]{{0,1500}}?constantValue\s*:\s*[\"'`]",
        re.MULTILINE,
    )
    return bool(pattern.search(text))


def has_missing_localized_marker_for_key(text: str, key: str) -> bool:
    pattern = re.compile(
        rf"{re.escape(key)}\s*:\s*\{{[\s\S]{{0,2200}}?constantValue\s*:\s*\{{([\s\S]{{0,1200}}?)\}}\s*,\s*constantValueEnabled",
        re.MULTILINE,
    )
    for match in pattern.finditer(text):
        constant_block = match.group(1)
        if re.search(r"\ben\s*:", constant_block) and "hasLocalizedValue" not in constant_block:
            return True
    return False


def extract_slot_invocations(text: str) -> list[tuple[str, str]]:
    pattern = re.compile(r"<slots\.([A-Za-z0-9_]+Slot)([^>]*)>", re.MULTILINE | re.DOTALL)
    return [(match.group(1), match.group(2) or "") for match in pattern.finditer(text)]


def has_allow_empty_array(attrs: str) -> bool:
    return bool(re.search(r"allow\s*=\s*\{\s*\[\s*\]\s*\}", attrs))


def has_auto_height_style(attrs: str) -> bool:
    return bool(
        re.search(
            r"style\s*=\s*\{\{\s*height\s*:\s*['\"]auto['\"]\s*\}\}",
            attrs,
        )
    )


def is_location_stream_template(template_text: str) -> bool:
    return bool(
        re.search(
            r'entityTypes\s*:\s*\[[^\]]*["\']location["\']',
            template_text,
            re.MULTILINE | re.DOTALL,
        )
    )


def has_hardcoded_text_color_classes(text: str) -> bool:
    return bool(
        re.search(
            r"text-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})",
            text,
        )
    )


def has_hardcoded_light_contrast_classes(text: str) -> bool:
    return bool(
        re.search(
            r"(?:text-white(?:/\d+)?|text-neutral-100|text-neutral-50|border-white(?:/\d+)?|placeholder:text-white(?:/\d+)?)",
            text,
        )
    )


def extract_text_field_keys(text: str) -> list[str]:
    pattern = re.compile(
        r"^\s*([A-Za-z0-9_]+)\s*:\s*YextField\([\s\S]{0,70}?\{\s*type\s*:\s*[\"']text[\"']",
        re.MULTILINE,
    )
    return sorted(set(pattern.findall(text)))


def is_likely_copy_text_key(key: str) -> bool:
    key_lower = key.lower()

    infrastructure_tokens = (
        "href",
        "url",
        "class",
        "id",
        "apikey",
        "mapstyle",
        "field",
        "radius",
        "limit",
        "latitude",
        "longitude",
        "env",
    )
    if any(token in key_lower for token in infrastructure_tokens):
        return False

    copy_tokens = (
        "label",
        "title",
        "heading",
        "text",
        "body",
        "description",
        "message",
        "question",
        "answer",
        "status",
        "detail",
        "copy",
        "caption",
        "alt",
    )
    return any(token in key_lower for token in copy_tokens)


def has_rounded_class(text: str) -> bool:
    return bool(re.search(r"rounded(?:-[A-Za-z0-9_[\]/%.-]+)?", text))


def has_html_only_richtext_render(text: str) -> bool:
    has_richtext_field = bool(
        re.search(r'types\s*:\s*\[\s*["\']type\.rich_text_v2["\']\s*\]', text)
    )
    if not has_richtext_field:
        return False
    if "resolveComponentData(" not in text:
        return False
    return "dangerouslySetInnerHTML" in text and "React.isValidElement" not in text


def extract_empty_field_translatable_constants(text: str) -> list[tuple[str, str]]:
    pattern = re.compile(
        r"([A-Za-z0-9_]+)\s*:\s*\{\s*field\s*:\s*[\"']\s*[\"']\s*,\s*constantValue\s*:\s*\{\s*en\s*:\s*[\"']([^\"']+)[\"']",
        re.MULTILINE | re.DOTALL,
    )
    return [(match.group(1), match.group(2)) for match in pattern.finditer(text)]


def is_location_like_constant(key: str, value: str) -> bool:
    if re.search(r"\b\d{5}(?:-\d{4})?\b", value):
        return True
    if re.search(r"\b[A-Z][a-z]+,\s*[A-Z]{2}\b", value):
        return True
    if re.search(
        r"\b\d{1,5}\s+[A-Za-z0-9.'\-\s]+(?:Ave|Avenue|St|Street|Rd|Road|Blvd|Boulevard|Dr|Drive|Way|Ln|Lane|Ct|Court|Pl|Place)\b",
        value,
        re.IGNORECASE,
    ):
        return True
    if "maps.google.com" in value or "google.com/maps" in value:
        return True
    if (
        any(token in key.lower() for token in ("city", "location", "address"))
        and re.fullmatch(r"[A-Z][A-Z\s-]{2,40}", value)
    ):
        return True
    return False


def has_type_image_filter(text: str) -> bool:
    return bool(re.search(r'types\s*:\s*\[\s*["\']type\.image["\']\s*\]', text))


def strip_client_prefix(name: str, client_pascal: str) -> str:
    return name[len(client_pascal) :] if name.startswith(client_pascal) else name


def normalize_client_text_for_similarity(
    text: str, client_slug: str, client_pascal: str
) -> str:
    normalized = text
    for token in sorted({client_slug, client_pascal}, key=len, reverse=True):
        if token:
            normalized = normalized.replace(token, "CLIENT")
    return re.sub(r"\s+", " ", normalized).strip()


def extract_layout_section_sequence(template_text: str, client_pascal: str) -> list[str]:
    section_types = re.findall(
        r'type\s*:\s*["\']([A-Za-z0-9_]+Section)["\']',
        template_text,
        re.MULTILINE,
    )
    return [strip_client_prefix(section_type, client_pascal) for section_type in section_types]


def extract_array_literal_for_key(text: str, key: str) -> str:
    marker_match = re.search(rf"{re.escape(key)}\s*:\s*\[", text)
    if not marker_match:
        return ""

    start = marker_match.end() - 1
    depth = 0

    for index in range(start, len(text)):
        char = text[index]
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return text[start : index + 1]

    return ""


def main() -> int:
    args = parse_args()
    client_path = Path(args.client_path)
    failures: list[str] = []

    if not client_path.exists():
        print(f"[FAIL] Client path does not exist: {client_path}")
        return 1

    client_slug = client_path.name
    client_pascal = to_pascal_case(client_slug)
    starter_templates_root = Path("starter/src/templates")
    package_custom_root = Path("packages/visual-editor/src/components/custom")
    package_categories_root = Path("packages/visual-editor/src/components/categories")

    starter_client_path = starter_templates_root / client_slug
    package_client_path = package_custom_root / client_slug

    legacy_components_dir = client_path / "components"
    legacy_categories_dir = client_path / "categories"
    package_components_dir = package_client_path / "components"

    components_dir = legacy_components_dir if legacy_components_dir.exists() else package_components_dir

    package_sections_file = package_categories_root / f"{client_pascal}SectionsCategory.tsx"
    package_slots_file = package_categories_root / f"{client_pascal}SlotsCategory.tsx"

    category_registry_paths = sorted(legacy_categories_dir.glob("*.tsx"))
    if not category_registry_paths:
        category_registry_paths = [
            path for path in (package_sections_file, package_slots_file) if path.exists()
        ]

    config_file = next(client_path.glob("*-config.tsx"), None)
    template_file = next(client_path.glob("*-template.tsx"), None)
    if not config_file and starter_client_path.exists():
        config_file = next(starter_client_path.glob("*-config.tsx"), None)
    if not template_file and starter_client_path.exists():
        template_file = next(starter_client_path.glob("*-template.tsx"), None)

    template_text = read_text(template_file) if template_file else ""
    is_location_template = is_location_stream_template(template_text)

    sibling_clients: list[tuple[str, Path, Path | None]] = []
    seen_sibling_slugs: set[str] = set()
    if package_custom_root.exists():
        for path in sorted(package_custom_root.iterdir(), key=lambda item: item.name):
            if (
                not path.is_dir()
                or path.name == client_slug
                or path.name in seen_sibling_slugs
                or not (path / "components").exists()
            ):
                continue
            sibling_slug = path.name
            sibling_template = None
            sibling_starter_path = starter_templates_root / sibling_slug
            if sibling_starter_path.exists():
                sibling_template = next(sibling_starter_path.glob("*-template.tsx"), None)
            sibling_clients.append((sibling_slug, path / "components", sibling_template))
            seen_sibling_slugs.add(sibling_slug)
    if starter_templates_root.exists():
        for path in sorted(starter_templates_root.iterdir(), key=lambda item: item.name):
            if not path.is_dir() or path.name == client_slug or path.name in seen_sibling_slugs:
                continue
            sibling_slug = path.name
            sibling_package_components = package_custom_root / sibling_slug / "components"
            sibling_legacy_components = path / "components"
            sibling_components = (
                sibling_package_components
                if sibling_package_components.exists()
                else sibling_legacy_components
            )
            if not sibling_components.exists():
                continue
            sibling_template = next(path.glob("*-template.tsx"), None)
            sibling_clients.append((sibling_slug, sibling_components, sibling_template))
            seen_sibling_slugs.add(sibling_slug)

    if not components_dir.exists():
        fail(
            "Missing components directory under client path and package custom path "
            f"(checked `{legacy_components_dir}` and `{package_components_dir}`)",
            failures,
        )
    if not category_registry_paths:
        fail(
            "Missing category registration files (expected either legacy `categories/*.tsx` "
            f"or package files `{package_sections_file}` + `{package_slots_file}`)",
            failures,
        )
    if not config_file:
        fail(
            "Missing <client>-config.tsx file (expected under provided client path or starter client path)",
            failures,
        )
    if not template_file:
        fail(
            "Missing <client>-template.tsx file (expected under provided client path or starter client path)",
            failures,
        )

    section_files = sorted(components_dir.glob("*Section.tsx"))
    slot_files = sorted(components_dir.glob("*Slot.tsx"))

    if not section_files:
        fail("No section components found (*Section.tsx)", failures)
    if not slot_files:
        fail("No slot components found (*Slot.tsx)", failures)

    slot_field_sections = 0
    slot_render_sections = 0
    sections_with_empty_slot_props: list[str] = []
    sections_with_composite_slots: list[str] = []
    slot_invocations_missing_allow: list[str] = []
    slot_invocations_missing_auto_height: list[str] = []
    nested_slot_invocations_missing_allow: list[str] = []
    nested_slot_invocations_missing_auto_height: list[str] = []
    multi_slot_sections_missing_containment: list[str] = []
    grid_sections_missing_min_w_0: list[str] = []
    text_color_override_risk: list[str] = []
    sections_with_low_slot_toggle_coverage: list[str] = []
    store_info_slot_order_issues: list[str] = []
    promo_cta_slots_missing_toggles: list[str] = []
    promo_cta_toggles_missing_slots: list[str] = []
    section_signatures: dict[
        tuple[tuple[str, ...], tuple[str, ...], tuple[str, ...]], list[str]
    ] = {}
    concern_tokens = ("hours", "location", "parking")
    slot_type_pattern = re.compile(r'type\s*:\s*["\']([A-Za-z0-9_]+Slot)["\']')
    for section_file in section_files:
        text = read_text(section_file)
        if 'slots:' in text and '{ type: "slot" }' in text and "visible: false" in text:
            slot_field_sections += 1
        if "slots." in text and "allow={[]}" in text:
            slot_render_sections += 1
        if re.search(
            r'type\s*:\s*["\'][A-Za-z0-9_]+Slot["\']\s*,\s*props\s*:\s*\{\s*\}',
            text,
            re.DOTALL,
        ):
            sections_with_empty_slot_props.append(section_file.name)

        slot_field_keys = extract_slot_field_keys(text)
        for slot_name in slot_field_keys:
            matched_concerns = [token for token in concern_tokens if token in slot_name.lower()]
            if len(matched_concerns) >= 2:
                sections_with_composite_slots.append(f"{section_file.name}:{slot_name}")

        style_keys = extract_object_field_keys(text, "styles")
        data_keys = extract_object_field_keys(text, "data")
        signature = (tuple(slot_field_keys), tuple(style_keys), tuple(data_keys))
        section_signatures.setdefault(signature, []).append(section_file.name)
        section_slot_types = sorted(set(slot_type_pattern.findall(text)))
        show_style_keys = [
            key for key in style_keys if key.lower().startswith("show")
        ]

        if len(slot_field_keys) >= 2:
            required_show_toggles = max(1, len(slot_field_keys) - 1)
            if len(show_style_keys) < required_show_toggles:
                sections_with_low_slot_toggle_coverage.append(
                    f"{section_file.name}({len(show_style_keys)}/{len(slot_field_keys)} slot toggles)"
                )

        slot_invocations = extract_slot_invocations(text)
        for slot_name, attrs in slot_invocations:
            if not has_allow_empty_array(attrs):
                slot_invocations_missing_allow.append(f"{section_file.name}:{slot_name}")
            if not has_auto_height_style(attrs):
                slot_invocations_missing_auto_height.append(
                    f"{section_file.name}:{slot_name}"
                )

        if {
            "HoursSlot",
            "LocationInfoSlot",
            "MapSlot",
            "ParkingSlot",
        }.issubset(set(slot_field_keys)):
            render_order = [slot_name for slot_name, _ in slot_invocations]
            if all(
                slot_name in render_order
                for slot_name in (
                    "HoursSlot",
                    "LocationInfoSlot",
                    "MapSlot",
                    "ParkingSlot",
                )
            ):
                if not (
                    render_order.index("HoursSlot")
                    < render_order.index("LocationInfoSlot")
                    < render_order.index("MapSlot")
                    < render_order.index("ParkingSlot")
                ):
                    store_info_slot_order_issues.append(
                        f"{section_file.name}(expected Hours -> Location -> Map -> Parking)"
                    )

        if len(slot_invocations) >= 3 and "overflow-hidden" not in text:
            multi_slot_sections_missing_containment.append(section_file.name)

        if (
            re.search(r"(?:md|lg):grid-cols-\d|grid-cols-\d", text)
            and len(slot_invocations) >= 2
            and "min-w-0" not in text
        ):
            grid_sections_missing_min_w_0.append(section_file.name)

        if "PromoSection" in section_file.stem:
            has_cta_slot = any("cta" in slot.lower() for slot in slot_field_keys)
            has_cta_toggle = any(
                key.lower().startswith("show") and "cta" in key.lower()
                for key in style_keys
            )
            if has_cta_slot and not has_cta_toggle:
                promo_cta_slots_missing_toggles.append(section_file.name)
            if has_cta_toggle and not has_cta_slot:
                promo_cta_toggles_missing_slots.append(section_file.name)

        if "textColor" in style_keys:
            for slot_type in section_slot_types:
                slot_file = components_dir / f"{slot_type}.tsx"
                if not slot_file.exists():
                    continue
                slot_text = read_text(slot_file)
                if "styles.textColor" in slot_text:
                    continue
                if has_hardcoded_text_color_classes(slot_text):
                    text_color_override_risk.append(f"{section_file.name}:{slot_type}")

    for slot_file in slot_files:
        text = read_text(slot_file)
        slot_invocations = extract_slot_invocations(text)
        for slot_name, attrs in slot_invocations:
            if not has_allow_empty_array(attrs):
                nested_slot_invocations_missing_allow.append(
                    f"{slot_file.name}:{slot_name}"
                )
            if not has_auto_height_style(attrs):
                nested_slot_invocations_missing_auto_height.append(
                    f"{slot_file.name}:{slot_name}"
                )

    if section_files and slot_field_sections == 0:
        fail("No section has hidden slot field definitions", failures)
    if section_files and slot_render_sections == 0:
        fail("No section renders slot children with allow={[]}", failures)
    if sections_with_empty_slot_props:
        fail(
            "Section defaults contain empty slot props objects: "
            + ", ".join(sorted(sections_with_empty_slot_props)),
            failures,
        )
    if sections_with_composite_slots:
        fail(
            "Composite slot concerns found (split into focused slots): "
            + ", ".join(sorted(sections_with_composite_slots)),
            failures,
        )
    if slot_invocations_missing_allow:
        fail(
            "Section slot render calls missing allow={[]} on one or more slot invocations: "
            + ", ".join(sorted(slot_invocations_missing_allow)),
            failures,
        )
    if slot_invocations_missing_auto_height:
        fail(
            "Section slot render calls missing style={{ height: \"auto\" }}: "
            + ", ".join(sorted(slot_invocations_missing_auto_height)),
            failures,
        )
    if nested_slot_invocations_missing_allow:
        fail(
            "Nested slot render calls in slot components must include allow={[]}: "
            + ", ".join(sorted(nested_slot_invocations_missing_allow)),
            failures,
        )
    if nested_slot_invocations_missing_auto_height:
        fail(
            "Nested slot render calls in slot components must include style={{ height: \"auto\" }}: "
            + ", ".join(sorted(nested_slot_invocations_missing_auto_height)),
            failures,
        )
    if multi_slot_sections_missing_containment:
        fail(
            "Multi-slot sections missing overflow containment (add overflow-hidden wrapper): "
            + ", ".join(sorted(multi_slot_sections_missing_containment)),
            failures,
        )
    if grid_sections_missing_min_w_0:
        fail(
            "Grid-based sections missing min-w-0 on column wrappers: "
            + ", ".join(sorted(grid_sections_missing_min_w_0)),
            failures,
        )
    if text_color_override_risk:
        fail(
            "Section textColor style may be overridden by hardcoded slot text color classes: "
            + ", ".join(sorted(text_color_override_risk)),
            failures,
        )
    if sections_with_low_slot_toggle_coverage:
        fail(
            "Sections should expose top-level show/hide toggles for most slots (target: slot_count - 1): "
            + ", ".join(sorted(sections_with_low_slot_toggle_coverage)),
            failures,
        )
    if store_info_slot_order_issues:
        fail(
            "Store-info slot order mismatch (expected Hours -> Location -> Map -> Parking when all are present): "
            + ", ".join(sorted(store_info_slot_order_issues)),
            failures,
        )
    if promo_cta_slots_missing_toggles:
        fail(
            "Promo sections with CTA slots should include top-level show/hide CTA toggles: "
            + ", ".join(sorted(promo_cta_slots_missing_toggles)),
            failures,
        )
    if promo_cta_toggles_missing_slots:
        fail(
            "Promo sections with CTA toggles should keep corresponding CTA slot(s): "
            + ", ".join(sorted(promo_cta_toggles_missing_slots)),
            failures,
        )

    duplicate_signature_groups = [
        sorted(file_names)
        for file_names in section_signatures.values()
        if len(file_names) > 1
    ]
    if duplicate_signature_groups:
        formatted = "; ".join(
            ", ".join(group) for group in sorted(duplicate_signature_groups)
        )
        fail(
            "Potential duplicate sections with same slot/data/style signatures: "
            + formatted
            + ". Merge into one section with toggles/variants where feasible.",
            failures,
        )

    referenced_slot_types: set[str] = set()
    composite_referenced_slot_types: list[str] = []
    for section_file in section_files:
        text = read_text(section_file)
        for match in slot_type_pattern.findall(text):
            referenced_slot_types.add(match)
            matched_concerns = [token for token in concern_tokens if token in match.lower()]
            if len(matched_concerns) >= 2:
                composite_referenced_slot_types.append(f"{section_file.name}:{match}")

    has_hours_field_binding = False
    has_hours_entity_default = False
    files_with_type_url_entity_filter: list[str] = []
    files_with_background_image_url_fields: list[str] = []
    files_with_background_image_non_entity_filter: list[str] = []
    slot_files_missing_default_items: list[str] = []
    translatable_plain_string_defaults: list[str] = []
    translatable_missing_localization_markers: list[str] = []
    over_aggregated_non_list_slots: list[str] = []
    cta_text_mixed_slots: list[str] = []
    map_iframe_files: list[str] = []
    map_missing_shared_pattern_files: list[str] = []
    map_image_field_files: list[str] = []
    map_image_enabled_default_files: list[str] = []
    map_image_marketing_default_files: list[str] = []
    map_placeholder_files: list[str] = []
    nearby_hardcoded_link_files: list[str] = []
    nearby_missing_dynamic_pattern_files: list[str] = []
    drive_thru_single_hours_slot_files: list[str] = []
    footer_social_hardcoded_link_list_files: list[str] = []
    copy_text_fields_using_plain_text_input: list[str] = []
    header_utility_heading_noise_files: list[str] = []
    cta_labels_missing_action_fields: list[str] = []
    cta_labels_rendered_as_plain_text: list[str] = []
    image_slots_missing_type_image: list[str] = []
    richtext_html_only_render_slots: list[str] = []
    hero_promo_media_slots_with_rounding: list[str] = []
    referenced_header_footer_non_nested_slots: list[str] = []
    header_footer_contrast_risk_slots: list[str] = []
    location_plain_text_data_fields: list[str] = []
    location_static_constants: list[str] = []
    location_hardcoded_map_urls: list[str] = []
    for source_file in [*section_files, *slot_files]:
        text = read_text(source_file)
        if 'types: ["type.hours"]' in text or 'types: ["type.hours"]' in text.replace(
            " ", ""
        ):
            has_hours_field_binding = True
        if 'field: "hours"' in text and (
            "constantValueEnabled: false" in text or "constantValueEnabled:false" in text
        ):
            has_hours_entity_default = True
        if re.search(r'types\s*:\s*\[\s*["\']type\.url["\']\s*\]', text):
            files_with_type_url_entity_filter.append(source_file.name)
        if "backgroundImageUrl" in text:
            files_with_background_image_url_fields.append(source_file.name)
        if (
            re.search(r"backgroundImage\s*:\s*YextField", text)
            and not has_type_image_filter(text)
        ):
            files_with_background_image_non_entity_filter.append(source_file.name)

        map_related_file = bool(
            re.search(r"(?:Map|StaticMap|Directions)", source_file.stem)
        )
        if map_related_file:
            if "<iframe" in text:
                map_iframe_files.append(source_file.name)
            if "MapboxStaticMapComponent" not in text and "getDirections(" not in text:
                map_missing_shared_pattern_files.append(source_file.name)
            has_mapbox_static_surface = (
                "MapboxStaticMapComponent" in text
                or "api.mapbox.com/styles/v1/mapbox/" in text
            )
            has_placeholder_only_pattern = any(
                marker in text
                for marker in (
                    "Coordinate-driven map preview",
                    "bg-[linear-gradient(",
                    "MapPin className",
                )
            )
            if has_placeholder_only_pattern and not has_mapbox_static_surface:
                map_placeholder_files.append(source_file.name)
            if re.search(r"\bmapImage\s*:\s*YextField", text):
                map_image_field_files.append(source_file.name)
            if re.search(
                r"mapImage\s*:\s*\{[\s\S]{0,1400}?constantValueEnabled\s*:\s*true",
                text,
                re.MULTILINE,
            ):
                map_image_enabled_default_files.append(source_file.name)
            map_image_url_match = re.search(
                r"mapImage\s*:\s*\{[\s\S]{0,2000}?constantValue\s*:\s*\{[\s\S]{0,900}?url\s*:\s*[\"']([^\"']+)[\"']",
                text,
                re.MULTILINE,
            )
            if map_image_url_match:
                url = map_image_url_match.group(1).lower()
                if (
                    "mapbox" not in url
                    and "maps.googleapis.com/maps/api/staticmap" not in url
                    and "googleapis.com/maps/api/staticmap" not in url
                ):
                    map_image_marketing_default_files.append(source_file.name)

        if is_location_template:
            if source_file.name.endswith("Section.tsx") and re.search(
                r"Drive\s*Thru\s*Hours",
                text,
                re.IGNORECASE,
            ):
                hours_slot_keys = set(
                    re.findall(r"([A-Za-z0-9]*HoursSlot)\s*:", text)
                )
                if len(hours_slot_keys) < 2:
                    drive_thru_single_hours_slot_files.append(source_file.name)

            has_nearby_signal = bool(re.search(r"\bnearby\b", text, re.IGNORECASE))
            has_static_link_array = bool(
                re.search(
                    r"links\s*:\s*\[[\s\S]{0,2600}?href\s*:\s*[\"'][^\"']+[\"']",
                    text,
                    re.MULTILINE,
                )
            )
            has_static_link_builder_calls = bool(
                re.search(
                    r"links\s*:\s*\[[\s\S]{0,1600}?createLinkItem\s*\(",
                    text,
                    re.MULTILINE,
                )
                and re.search(r"createLinkItem\s*\([^)]*https?://", text, re.MULTILINE)
            )
            has_dynamic_nearby_pattern = any(
                marker in text
                for marker in (
                    "fetchNearbyLocations",
                    "NearbyLocationCardsWrapper",
                    "useQuery(",
                    "radius:",
                    "limit:",
                    "yextDisplayCoordinate",
                )
            )
            has_static_nearby_behavior = (
                has_static_link_array or has_static_link_builder_calls
            )
            if has_nearby_signal and has_static_nearby_behavior:
                nearby_hardcoded_link_files.append(source_file.name)
                if not has_dynamic_nearby_pattern:
                    nearby_missing_dynamic_pattern_files.append(source_file.name)

            social_links_slot_block = extract_array_literal_for_key(text, "SocialLinksSlot")
            if social_links_slot_block and re.search(
                r"type\s*:\s*[\"'][A-Za-z0-9]*LinkListSlot[\"']",
                social_links_slot_block,
                re.MULTILINE,
            ):
                footer_social_hardcoded_link_list_files.append(source_file.name)

        if (
            "Header" in source_file.stem
            or "TopNav" in source_file.stem
            or "NavLayout" in source_file.stem
        ) and re.search(
            r"heading\s*:\s*(?:toTranslatableString\(\s*)?[\"'](?:Top Links|Actions|Menu)[\"']",
            text,
            re.IGNORECASE,
        ):
            header_utility_heading_noise_files.append(source_file.name)

        if is_location_template:
            if re.search(r"https?://(?:www\.)?(?:maps\.google\.com|google\.com/maps)", text):
                location_hardcoded_map_urls.append(source_file.name)

            for key in (
                "mapUrl",
                "directionsUrl",
                "phoneNumber",
                "phoneDisplay",
                "cityStatePostal",
                "addressLine",
            ):
                if re.search(
                    rf"{re.escape(key)}\s*:\s*YextField\([\s\S]{{0,220}}?type\s*:\s*[\"']text[\"']",
                    text,
                    re.MULTILINE,
                ):
                    location_plain_text_data_fields.append(f"{source_file.name}:{key}")

            for key, value in extract_empty_field_translatable_constants(text):
                if is_location_like_constant(key, value):
                    preview = value if len(value) <= 48 else value[:48] + "..."
                    location_static_constants.append(f"{source_file.name}:{key}={preview}")

        translatable_keys = extract_translatable_entity_keys(text)
        richtext_translatable_keys = extract_translatable_richtext_entity_keys(text)
        all_translatable_keys = sorted(
            set([*translatable_keys, *richtext_translatable_keys])
        )
        for key in translatable_keys:
            if has_plain_string_constant_for_key(text, key):
                translatable_plain_string_defaults.append(f"{source_file.name}:{key}")
        for key in all_translatable_keys:
            if has_missing_localized_marker_for_key(text, key):
                translatable_missing_localization_markers.append(
                    f"{source_file.name}:{key}"
                )

        if source_file.name.endswith("Slot.tsx"):
            for text_field_key in extract_text_field_keys(text):
                if is_likely_copy_text_key(text_field_key):
                    copy_text_fields_using_plain_text_input.append(
                        f"{source_file.name}:{text_field_key}"
                    )

            has_array_field = bool(re.search(r'type\s*:\s*["\']array["\']', text))
            if not has_array_field and len(translatable_keys) > 2:
                over_aggregated_non_list_slots.append(
                    f"{source_file.name}({len(translatable_keys)} text fields)"
                )
            cta_like_keys = [
                key
                for key in translatable_keys
                if "cta" in key.lower() or "button" in key.lower()
            ]
            if not has_array_field and cta_like_keys and len(translatable_keys) > 1:
                cta_text_mixed_slots.append(
                    f"{source_file.name}(cta keys: {', '.join(sorted(cta_like_keys))})"
                )
            if (
                "Image" in source_file.stem
                and "Map" not in source_file.stem
                and not extract_slot_field_keys(text)
                and not has_type_image_filter(text)
                and "ImageWrapper" not in text
            ):
                image_slots_missing_type_image.append(source_file.name)
            if has_html_only_richtext_render(text):
                richtext_html_only_render_slots.append(source_file.name)
            if re.search(r"(?:Hero|Promo).*Media.*Slot$", source_file.stem) and has_rounded_class(
                text
            ):
                hero_promo_media_slots_with_rounding.append(source_file.name)
            if (
                ("Header" in source_file.stem or "Footer" in source_file.stem)
                and has_hardcoded_light_contrast_classes(text)
            ):
                header_footer_contrast_risk_slots.append(source_file.name)

            cta_label_keys = re.findall(
                r"([A-Za-z0-9_]*CtaLabel)\s*:\s*YextField",
                text,
                re.MULTILINE,
            )
            for cta_label_key in sorted(set(cta_label_keys)):
                cta_prefix = cta_label_key[: -len("Label")]
                if not re.search(
                    rf"{re.escape(cta_prefix)}(?:Href|Link)\s*:\s*YextField",
                    text,
                    re.MULTILINE,
                ):
                    cta_labels_missing_action_fields.append(
                        f"{source_file.name}:{cta_label_key}"
                    )

            if re.search(r"<span[^>]*>\s*\{[^}]*CtaLabel", text):
                cta_labels_rendered_as_plain_text.append(source_file.name)

    for slot_type in sorted(referenced_slot_types):
        if "Header" not in slot_type and "Footer" not in slot_type:
            continue
        slot_path = components_dir / f"{slot_type}.tsx"
        if not slot_path.exists():
            continue
        slot_text = read_text(slot_path)
        if not extract_slot_field_keys(slot_text):
            referenced_header_footer_non_nested_slots.append(slot_type)

    for slot_file in slot_files:
        text = read_text(slot_file)
        array_field_count = len(re.findall(r'type\s*:\s*["\']array["\']', text))
        default_item_count = len(re.findall(r"defaultItemProps\s*:", text))
        if array_field_count > default_item_count:
            slot_files_missing_default_items.append(slot_file.name)

    if not has_hours_field_binding:
        fail("No hours entity field selector found (types: [\"type.hours\"])", failures)
    if not has_hours_entity_default:
        fail(
            "No hours default binding found with field: \"hours\" and constantValueEnabled: false",
            failures,
        )
    if files_with_type_url_entity_filter:
        fail(
            "Unsupported entityField filter type.url found in: "
            + ", ".join(sorted(files_with_type_url_entity_filter)),
            failures,
        )
    if files_with_background_image_url_fields:
        fail(
            "Plain backgroundImageUrl text controls detected (use image entity field patterns): "
            + ", ".join(sorted(set(files_with_background_image_url_fields))),
            failures,
        )
    if files_with_background_image_non_entity_filter:
        fail(
            "backgroundImage fields missing type.image entity filter: "
            + ", ".join(sorted(set(files_with_background_image_non_entity_filter))),
            failures,
        )
    if map_iframe_files:
        fail(
            "Map components using iframe embeds detected (use shared map patterns): "
            + ", ".join(sorted(set(map_iframe_files))),
            failures,
        )
    if map_missing_shared_pattern_files:
        fail(
            "Map-related components missing shared map implementation patterns (MapboxStaticMapComponent or getDirections): "
            + ", ".join(sorted(set(map_missing_shared_pattern_files))),
            failures,
        )
    if map_placeholder_files:
        fail(
            "Map-related components appear to use placeholder panels instead of real map surfaces: "
            + ", ".join(sorted(set(map_placeholder_files))),
            failures,
        )
    if is_location_template and map_image_field_files:
        fail(
            "Location map components should not expose generic mapImage fields by default (prefer shared map patterns): "
            + ", ".join(sorted(set(map_image_field_files))),
            failures,
        )
    if is_location_template and map_image_enabled_default_files:
        fail(
            "Location map components should not default mapImage to constant mode (use coordinate/entity-driven map defaults): "
            + ", ".join(sorted(set(map_image_enabled_default_files))),
            failures,
        )
    if is_location_template and map_image_marketing_default_files:
        fail(
            "Map defaults appear to use non-map marketing imagery URLs: "
            + ", ".join(sorted(set(map_image_marketing_default_files))),
            failures,
        )
    if is_location_template and nearby_hardcoded_link_files:
        fail(
            "Nearby stores/locations appear hardcoded as static link lists (use shared NearbyLocations-style dynamic behavior): "
            + ", ".join(sorted(set(nearby_hardcoded_link_files))),
            failures,
        )
    if is_location_template and nearby_missing_dynamic_pattern_files:
        fail(
            "Nearby stores/locations blocks missing dynamic lookup patterns (expected radius/limit + coordinate-driven lookup): "
            + ", ".join(sorted(set(nearby_missing_dynamic_pattern_files))),
            failures,
        )
    if is_location_template and drive_thru_single_hours_slot_files:
        fail(
            "Drive-thru hours detected but only one hours slot generated (create separate entity-bound hours slots for each hours band): "
            + ", ".join(sorted(set(drive_thru_single_hours_slot_files))),
            failures,
        )
    if footer_social_hardcoded_link_list_files:
        fail(
            "Footer social links appear to be modeled as generic hardcoded link lists (use a social-links slot baseline with platform-aware links/icons): "
            + ", ".join(sorted(set(footer_social_hardcoded_link_list_files))),
            failures,
        )
    if copy_text_fields_using_plain_text_input:
        fail(
            "User-facing copy fields are using plain text inputs (use translatableString or entityField patterns for embedded-field support): "
            + ", ".join(sorted(set(copy_text_fields_using_plain_text_input))),
            failures,
        )
    if header_utility_heading_noise_files:
        fail(
            "Header/nav utility heading defaults appear to include likely hidden labels (for example Top Links/Actions/Menu); omit these by default: "
            + ", ".join(sorted(set(header_utility_heading_noise_files))),
            failures,
        )
    if cta_labels_missing_action_fields:
        fail(
            "CTA labels detected without matching action fields (Href/Link): "
            + ", ".join(sorted(set(cta_labels_missing_action_fields))),
            failures,
        )
    if cta_labels_rendered_as_plain_text:
        fail(
            "CTA labels appear to be rendered as plain text spans instead of actionable CTA controls: "
            + ", ".join(sorted(set(cta_labels_rendered_as_plain_text))),
            failures,
        )
    if image_slots_missing_type_image:
        fail(
            "Image slot components missing type.image field patterns (or ImageWrapper parity): "
            + ", ".join(sorted(set(image_slots_missing_type_image))),
            failures,
        )
    if richtext_html_only_render_slots:
        fail(
            "Rich text slots should handle resolveComponentData output as React element or string (not html-only rendering): "
            + ", ".join(sorted(set(richtext_html_only_render_slots))),
            failures,
        )
    if hero_promo_media_slots_with_rounding:
        fail(
            "Hero/promo media slots should not apply rounded wrappers by default for full-bleed parity: "
            + ", ".join(sorted(set(hero_promo_media_slots_with_rounding))),
            failures,
        )
    if referenced_header_footer_non_nested_slots:
        fail(
            "Section-referenced header/footer slots should be layout slots with nested child slots: "
            + ", ".join(sorted(set(referenced_header_footer_non_nested_slots))),
            failures,
        )
    if is_location_template and location_plain_text_data_fields:
        fail(
            "Location template uses plain text fields for location primitives (prefer entity binding or derived values): "
            + ", ".join(sorted(location_plain_text_data_fields)),
            failures,
        )
    if is_location_template and location_static_constants:
        fail(
            "Location template contains hardcoded location-like constants with empty field binding: "
            + ", ".join(sorted(location_static_constants)),
            failures,
        )
    if is_location_template and location_hardcoded_map_urls:
        fail(
            "Location template contains hardcoded map/directions URLs (derive from entity address or bind via entity fields): "
            + ", ".join(sorted(set(location_hardcoded_map_urls))),
            failures,
        )
    if slot_files_missing_default_items:
        fail(
            "Slot array fields missing defaultItemProps in: "
            + ", ".join(sorted(slot_files_missing_default_items)),
            failures,
        )
    if translatable_plain_string_defaults:
        fail(
            "TranslatableString defaults using plain string constantValue (use localized object with hasLocalizedValue): "
            + ", ".join(sorted(translatable_plain_string_defaults)),
            failures,
        )
    if translatable_missing_localization_markers:
        fail(
            "Translatable entity defaults missing hasLocalizedValue marker for locale-key constants: "
            + ", ".join(sorted(translatable_missing_localization_markers)),
            failures,
        )
    if over_aggregated_non_list_slots:
        fail(
            "Over-aggregated non-list slots detected (split text concerns into smaller slots): "
            + ", ".join(sorted(over_aggregated_non_list_slots)),
            failures,
        )
    if cta_text_mixed_slots:
        fail(
            "Slots mixing CTA concerns with multiple text concerns (split CTA into dedicated slot): "
            + ", ".join(sorted(cta_text_mixed_slots)),
            failures,
        )
    if composite_referenced_slot_types:
        fail(
            "Composite referenced slot types found (split these concerns): "
            + ", ".join(sorted(composite_referenced_slot_types)),
            failures,
        )
    if header_footer_contrast_risk_slots:
        fail(
            "Header/footer slots contain hardcoded light text/border classes that can break contrast across backgrounds: "
            + ", ".join(sorted(set(header_footer_contrast_risk_slots))),
            failures,
        )

    if config_file:
        config_text = read_text(config_file)
        if "visible: false" not in config_text:
            fail("Config missing hidden slot category (visible: false)", failures)
        if "Sections" not in config_text and "sections" not in config_text:
            fail("Config missing visible sections category naming", failures)
        if "SlotsCategory" not in config_text and "slots" not in config_text:
            fail("Config missing slot category registration", failures)

        registry_sources = [config_text]
        registry_sources.extend(read_text(path) for path in category_registry_paths)
        registry_text = "\n".join(registry_sources)

        missing_slot_registrations = sorted(
            slot_type
            for slot_type in referenced_slot_types
            if slot_type not in registry_text
        )
        if missing_slot_registrations:
            fail(
                "Unregistered slot types referenced by section defaults: "
                + ", ".join(missing_slot_registrations),
                failures,
            )

        has_slot_component_map_in_config = "SlotsCategoryComponents" in config_text
        all_slot_types_explicitly_in_config = all(
            slot_type in config_text for slot_type in referenced_slot_types
        )
        if referenced_slot_types and not (
            has_slot_component_map_in_config or all_slot_types_explicitly_in_config
        ):
            fail(
                "Config components map does not appear to include slot component registrations",
                failures,
            )

    if template_file:
        if "<Render" in template_text and "metadata={{ streamDocument: document }}" not in template_text:
            fail(
                "Template render missing metadata stream document binding",
                failures,
            )
        empty_section_props = sorted(
            set(
                re.findall(
                    r'type\s*:\s*["\']([A-Za-z0-9_]+Section)["\']\s*,\s*props\s*:\s*\{\s*\}',
                    template_text,
                    re.MULTILINE | re.DOTALL,
                )
            )
        )
        if empty_section_props:
            fail(
                "Template default layout contains section entries with empty props {} (use section defaultProps or explicit overrides): "
                + ", ".join(empty_section_props),
                failures,
            )

    sibling_path_leaks: list[str] = []
    sibling_symbol_leaks: list[str] = []
    scan_files = [*section_files, *slot_files]
    if config_file:
        scan_files.append(config_file)
    if template_file:
        scan_files.append(template_file)

    for source_file in scan_files:
        text = read_text(source_file)
        for sibling_slug, _, _ in sibling_clients:
            sibling_pascal = to_pascal_case(sibling_slug)

            if re.search(
                rf"(?:\.\./{re.escape(sibling_slug)}/|/templates/{re.escape(sibling_slug)}/)",
                text,
            ):
                sibling_path_leaks.append(f"{source_file.name}->{sibling_slug}")

            if re.search(
                rf"\b{re.escape(sibling_pascal)}[A-Za-z0-9_]*(?:Section|Slot|Props|Config|Template|Category)\b",
                text,
            ):
                sibling_symbol_leaks.append(f"{source_file.name}->{sibling_pascal}")

    if sibling_path_leaks:
        fail(
            "Client template references sibling client template paths (client isolation breach): "
            + ", ".join(sorted(set(sibling_path_leaks))),
            failures,
        )
    if sibling_symbol_leaks:
        fail(
            "Client template references sibling client symbols (client isolation breach): "
            + ", ".join(sorted(set(sibling_symbol_leaks))),
            failures,
        )

    suspicious_sibling_similarity: list[str] = []
    if template_file:
        target_template_mtime = template_file.stat().st_mtime
        target_layout_sequence = extract_layout_section_sequence(template_text, client_pascal)
        target_section_bodies = {
            strip_client_prefix(section_file.stem, client_pascal): normalize_client_text_for_similarity(
                read_text(section_file), client_slug, client_pascal
            )
            for section_file in section_files
        }

        for sibling_slug, sibling_components_dir, sibling_template in sibling_clients:
            if not sibling_template or not sibling_components_dir.exists():
                continue

            # Avoid blaming the older template when a newer template appears copied from it.
            if target_template_mtime <= sibling_template.stat().st_mtime:
                continue

            sibling_pascal = to_pascal_case(sibling_slug)
            sibling_template_text = read_text(sibling_template)
            sibling_layout_sequence = extract_layout_section_sequence(
                sibling_template_text, sibling_pascal
            )

            layout_match = (
                len(target_layout_sequence) >= 5
                and target_layout_sequence == sibling_layout_sequence
            )

            sibling_section_bodies = {
                strip_client_prefix(section_file.stem, sibling_pascal): normalize_client_text_for_similarity(
                    read_text(section_file), sibling_slug, sibling_pascal
                )
                for section_file in sorted(sibling_components_dir.glob("*Section.tsx"))
            }
            shared_suffixes = sorted(
                set(target_section_bodies.keys()) & set(sibling_section_bodies.keys())
            )
            similarity_match = False
            avg_similarity = 0.0
            near_identical: list[str] = []
            if len(shared_suffixes) >= 4:
                ratios = [
                    (
                        suffix,
                        difflib.SequenceMatcher(
                            None,
                            target_section_bodies[suffix],
                            sibling_section_bodies[suffix],
                        ).ratio(),
                    )
                    for suffix in shared_suffixes
                ]
                avg_similarity = sum(ratio for _, ratio in ratios) / len(ratios)
                near_identical = [
                    f"{suffix}:{ratio:.3f}"
                    for suffix, ratio in ratios
                    if ratio >= 0.985
                ]
                required_near_identical = max(4, (2 * len(shared_suffixes) + 2) // 3)
                similarity_match = (
                    (len(shared_suffixes) >= 6 and avg_similarity >= 0.96)
                    or len(near_identical) >= required_near_identical
                )

            if layout_match or similarity_match:
                detail_bits = []
                if layout_match:
                    detail_bits.append("layout sequence matches")
                if similarity_match:
                    detail_bits.append(
                        f"avg section similarity {avg_similarity:.3f}"
                    )
                if near_identical:
                    detail_bits.append(
                        "near-identical sections: "
                        + ", ".join(sorted(near_identical)[:6])
                    )
                suspicious_sibling_similarity.append(
                    f"{sibling_slug} ({'; '.join(detail_bits)})"
                )

    if suspicious_sibling_similarity:
        fail(
            "Template appears structurally copied from another client template; derive section structure from source HTML instead: "
            + ", ".join(sorted(set(suspicious_sibling_similarity))),
            failures,
        )

    starter_config_file = Path("starter/src/ve.config.tsx")
    if starter_config_file.exists():
        starter_text = read_text(starter_config_file)
        expected_category_key = f"{client_slug}Sections"
        expected_registry_key = f"\"{client_slug}-location\""
        expected_sections_components = f"{client_pascal}SectionsCategoryComponents"
        expected_slots_components = f"{client_pascal}SlotsCategoryComponents"
        expected_slots_props = f"{client_pascal}SlotsCategoryProps"

        if expected_registry_key not in starter_text:
            fail(
                f"Starter componentRegistry missing client entry: {expected_registry_key}",
                failures,
            )
        if "registerMainConfigExtension" in starter_text or "MainConfigExtension" in starter_text:
            fail(
                "Starter config should compose client categories directly; remove registerMainConfigExtension/MainConfigExtension usage",
                failures,
            )

        has_starter_client_wiring = all(
            (
                expected_category_key in starter_text,
                expected_slots_props in starter_text,
                expected_sections_components in starter_text,
                expected_slots_components in starter_text,
                f"...{expected_sections_components}" in starter_text,
                f"...{expected_slots_components}" in starter_text,
            )
        )

        if not has_starter_client_wiring:
            main_config_file = Path(
                "packages/visual-editor/src/components/configs/mainConfig.tsx"
            )
            package_sections_symbol = f"{client_pascal}SectionsCategory"
            package_slots_symbol = f"{client_pascal}SlotsCategory"
            package_sections_components_symbol = (
                f"{client_pascal}SectionsCategoryComponents"
            )
            package_slots_components_symbol = (
                f"{client_pascal}SlotsCategoryComponents"
            )
            package_sections_file = Path(
                f"packages/visual-editor/src/components/categories/{package_sections_symbol}.tsx"
            )
            package_slots_file = Path(
                f"packages/visual-editor/src/components/categories/{package_slots_symbol}.tsx"
            )

            main_config_text = read_text(main_config_file) if main_config_file.exists() else ""
            has_package_generated_wiring = (
                main_config_file.exists()
                and package_sections_file.exists()
                and package_slots_file.exists()
                and package_sections_symbol in main_config_text
                and package_slots_symbol in main_config_text
                and package_sections_components_symbol in main_config_text
                and package_slots_components_symbol in main_config_text
                and expected_category_key in main_config_text
                and f"{client_slug}Slots" in main_config_text
            )

            if not has_package_generated_wiring:
                fail(
                    "Client components are not wired in starter devConfig or package mainConfig client-specific categories",
                    failures,
                )

    if failures:
        print("[FAIL] Client template validation failed:")
        for issue in failures:
            print(f" - {issue}")
        return 1

    print("[OK] Client template validation passed.")
    print(f"[OK] Sections checked: {len(section_files)}")
    print(f"[OK] Slots checked: {len(slot_files)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
