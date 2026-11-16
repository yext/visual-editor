import React from "react";
import {
  Drawer,
  createUsePuck,
  type Config,
  type Plugin,
  type UiState,
} from "@puckeditor/core";
import { ChevronDown, Search, X } from "lucide-react";
import { BlockPreview, type BlockPreviewTarget } from "./BlockPreview.tsx";
import { pt, usePlatformTranslation } from "../utils/i18n/platform.ts";

const usePuck = createUsePuck();
type BlockGroup = {
  id: string;
  title?: string;
  componentIds: string[];
  expanded: boolean;
};

/** Follow Puck's category visibility, including hidden helpers and unlisted components. */
function blockGroups(
  config: Config,
  categories: UiState["componentList"]
): BlockGroup[] {
  const groups: BlockGroup[] = [];
  const listed = new Set<string>();
  const entries: UiState["componentList"] = Object.keys(categories).length
    ? categories
    : (config.categories ?? {});
  for (const [id, category] of Object.entries(entries)) {
    if (!category.components) continue;
    category.components.forEach((id) => listed.add(id));
    if (category.visible === false) continue;
    groups.push({
      id,
      title: pt(config.categories?.[id]?.title || category.title || id),
      componentIds: category.components.filter((id) =>
        Object.hasOwn(config.components, id)
      ),
      expanded:
        category.expanded ?? config.categories?.[id]?.defaultExpanded ?? true,
    });
  }
  const other = entries.other;
  if (!other?.components && other?.visible !== false) {
    groups.push({
      id: "other",
      title: Object.keys(entries).length
        ? pt(other?.title || pt("categories.other", "Other"))
        : undefined,
      componentIds: Object.keys(config.components).filter(
        (id) => !listed.has(id)
      ),
      expanded:
        other?.expanded ?? config.categories?.other?.defaultExpanded ?? true,
    });
  }
  return groups.filter((group) => group.componentIds.length);
}

function normalized(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase();
}

function BlockItem({
  componentId,
  label,
  onPreview,
  onClose,
  describedBy,
}: {
  componentId: string;
  label: string;
  onPreview: (target: BlockPreviewTarget) => void;
  onClose: () => void;
  describedBy?: string;
}) {
  const canInsert = usePuck(
    (state) => state.getPermissions({ type: componentId }).insert
  );
  return (
    <div
      className="ve-block-hover"
      tabIndex={0}
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch")
          onPreview({ componentId, label, anchor: event.currentTarget });
      }}
      onPointerLeave={onClose}
      onPointerDownCapture={onClose}
      onFocus={(event) =>
        onPreview({ componentId, label, anchor: event.currentTarget })
      }
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          onClose();
      }}
    >
      <Drawer.Item
        name={componentId}
        label={label}
        isDragDisabled={!canInsert}
      />
    </div>
  );
}

function SearchableBlocks() {
  usePlatformTranslation();
  const config = usePuck((state) => state.config);
  const categories = usePuck((state) => state.appState.ui.componentList);
  const [query, setQuery] = React.useState("");
  const [expansion, setExpansion] = React.useState<Record<string, boolean>>({});
  const input = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const [preview, setPreview] = React.useState<BlockPreviewTarget | null>(null);
  const [previewActive, setPreviewActive] = React.useState(false);
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const dragging = usePuck((state) => state.appState.ui.isDragging);
  const closePreview = React.useCallback(() => {
    setPreviewActive(false);
    setPreviewVisible(false);
  }, []);
  const requestPreview = React.useCallback(
    (target: BlockPreviewTarget) => {
      if (dragging) return;
      setPreviewVisible(false);
      setPreview(target);
      setPreviewActive(true);
    },
    [dragging]
  );
  React.useEffect(() => {
    if (dragging) closePreview();
  }, [dragging, closePreview]);

  const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
  const groups = blockGroups(config, categories)
    .map((group) => ({
      ...group,
      componentIds: group.componentIds.filter((componentId) => {
        const component = config.components[componentId];
        const haystack = normalized(
          [
            componentId,
            pt(component.label ?? componentId),
            group.title ?? "",
          ].join(" ")
        );
        return terms.every((term) => haystack.includes(term));
      }),
    }))
    .filter((group) => group.componentIds.length);
  const searching = terms.length > 0;
  const clear = () => {
    closePreview();
    setQuery("");
    input.current?.focus();
  };
  return (
    <div className="ve-block-library">
      <div
        className="ve-block-search"
        role="search"
        aria-label={pt("searchBlocks", "Search blocks")}
      >
        <div className="ve-block-search-input">
          <Search size={16} aria-hidden="true" />
          <input
            ref={input}
            type="search"
            aria-label={pt("searchBlocks", "Search blocks")}
            placeholder={pt("searchBlocks", "Search blocks")}
            value={query}
            onFocus={closePreview}
            onChange={(event) => {
              closePreview();
              setQuery(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                event.stopPropagation();
                clear();
              }
            }}
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label={pt("clearSearch", "Clear search")}
              title={pt("clearSearch", "Clear search")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="ve-block-search-results">
        {!groups.length && (
          <p role="status" className="ve-block-search-empty">
            {pt("noMatchesFound", "No matches found.")}
          </p>
        )}
        {groups.map((group) => {
          const expanded = searching || (expansion[group.id] ?? group.expanded);
          const contentId = `${id}-${group.id}`;
          return (
            <section
              key={group.id}
              className="ve-block-category"
              aria-label={group.title}
            >
              {group.title &&
                (searching ? (
                  <h3 className="ve-block-category-title">{group.title}</h3>
                ) : (
                  <button
                    type="button"
                    className="ve-block-category-title ve-block-category-toggle"
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => {
                      closePreview();
                      setExpansion((before) => ({
                        ...before,
                        [group.id]: !expanded,
                      }));
                    }}
                  >
                    {group.title}
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                ))}
              <div id={contentId} hidden={!expanded}>
                <Drawer>
                  {group.componentIds.map((componentId) => (
                    <BlockItem
                      key={componentId}
                      componentId={componentId}
                      onPreview={requestPreview}
                      onClose={closePreview}
                      describedBy={
                        previewVisible && preview?.componentId === componentId
                          ? `${id}-preview`
                          : undefined
                      }
                      label={pt(
                        config.components[componentId].label ?? componentId
                      )}
                    />
                  ))}
                </Drawer>
              </div>
            </section>
          );
        })}
      </div>
      {preview && (
        <BlockPreview
          target={preview}
          active={previewActive && !dragging}
          onVisibleChange={setPreviewVisible}
          tooltipId={`${id}-preview`}
          onClose={closePreview}
        />
      )}
    </div>
  );
}

/** Search the Blocks panel without changing document data, history, or insertion rules. */
export const blockSearchPlugin: Plugin = {
  name: "block-search",
  overrides: { drawer: SearchableBlocks },
};
