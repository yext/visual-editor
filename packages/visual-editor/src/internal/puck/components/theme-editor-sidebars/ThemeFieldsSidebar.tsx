import React from "react";
import {
  AutoField,
  FieldGroup,
  FieldLabel,
  FieldTab,
  type Field,
} from "@puckeditor/core";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { migrateThemeData } from "../../../../components/migrations/themeDataLabels.ts";
import { ColorPickerInput } from "../../../../fields/ColorSelector.tsx";
import {
  actionProperties,
  actionStateProperties,
  buttonProperties,
  buttonStateProperties,
  pageProperties,
  typographyProperties,
  validateThemeData,
  type ThemeData,
  type ThemeColorReference,
} from "../../../../types/themeData.ts";
import {
  createThemeEntry,
  themePropertyDefaults,
} from "../../../../utils/dynamicTheme.ts";
import {
  constructFontSelectOptions,
  defaultFonts,
  getFontWeightOptionsForFontFamily,
  getFontStyleOptionsForFontFamily,
  type FontRegistry,
} from "../../../../utils/fonts/visualEditorFonts.ts";
import { pt } from "../../../../utils/i18n/platform.ts";
import type { OnThemeChangeFunc } from "../../../types/themeData.ts";
import { updateThemeWithCustomFontAssets } from "../../../utils/customFontAssets.ts";
import { FontSelector } from "../FontSelector.tsx";
import { SetThemeDataButton } from "../SetThemeDataButton.tsx";
import { Button } from "../../ui/button.tsx";
import "../../ui/puck.css";

// AutoField renders the input; its public API leaves the label to the caller.
const ThemeInput = (props: {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}) => (
  <FieldLabel label={props.field.label ?? ""}>
    <AutoField {...props} />
  </FieldLabel>
);

type PropertyDefinitions = Record<
  string,
  { label: string; type: string; schema: z.ZodType }
>;

type ThemeFieldsSidebarProps = {
  themeData: ThemeData;
  onThemeChange: OnThemeChangeFunc;
  customFonts?: FontRegistry;
};

export const ThemeFieldsSidebar = ({
  themeData,
  onThemeChange,
  customFonts = {},
}: ThemeFieldsSidebarProps) => {
  const normalized = React.useMemo(
    () => migrateThemeData(themeData),
    [themeData]
  );
  const [draft, setDraft] = React.useState(normalized);
  const [addedId, setAddedId] = React.useState<string>();
  const pendingTheme = React.useRef<string>();
  React.useEffect(() => {
    // Keep local input (including trailing spaces) when history echoes our save.
    // External changes such as undo/redo still replace the editing draft.
    const ownSave = pendingTheme.current === JSON.stringify(normalized);
    pendingTheme.current = undefined;
    if (!ownSave) {
      setDraft(normalized);
    }
  }, [normalized]);
  const validation = validateThemeData(draft, customFonts);
  const fonts = { ...defaultFonts, ...customFonts };
  const fontOptions = constructFontSelectOptions(fonts);
  const change = (path: (string | number)[], value: unknown) => {
    const next = structuredClone(draft);
    let parent: any = next;
    for (const key of path.slice(0, -1)) {
      parent = parent[key];
    }
    parent[path[path.length - 1]] = value;
    setDraft(next);
    const result = validateThemeData(next, customFonts);
    if (result.data) {
      const saved = updateThemeWithCustomFontAssets({
        themeValues: result.data,
        customFonts,
      });
      const serialized = JSON.stringify(saved);
      if (serialized !== JSON.stringify(normalized)) {
        pendingTheme.current = serialized;
        onThemeChange(saved);
      }
    }
  };
  const renderProperties = (
    definitions: PropertyDefinitions,
    values: Record<string, any>,
    path: (string | number)[],
    family?: string
  ) =>
    Object.entries(definitions).map(([key, definition]) => {
      const current = values[key];
      let options: { label: string; value: string }[] | undefined;
      if (definition.type === "fontFamily") {
        return (
          <FieldGroup.Item key={key}>
            <FontSelector
              label={definition.label}
              value={current}
              options={fontOptions}
              onChange={(value) => change([...path, key], value)}
            />
          </FieldGroup.Item>
        );
      }
      if (definition.type === "fontWeight") {
        options = getFontWeightOptionsForFontFamily(family, {
          fontList: fonts,
        });
      } else if (definition.type === "fontStyle") {
        options = getFontStyleOptionsForFontFamily(family, { fontList: fonts });
      } else if (definition.schema instanceof z.ZodEnum) {
        options = definition.schema.options.map((value) => ({
          label: String(value).replace(/^./, (letter) => letter.toUpperCase()),
          value: String(value),
        }));
      }
      if (definition.type === "colorReference") {
        options = draft.colors.flatMap((color) =>
          (["background", "foreground"] as const).map((channel) => ({
            label: `${color.label} · ${channel === "background" ? "Background" : "Foreground"}`,
            value: JSON.stringify({ colorId: color.id, channel }),
          }))
        );
        const selected = JSON.stringify(current);
        if (!options.some((option) => option.value === selected)) {
          options.push({
            label: `${current.colorId} · ${current.channel} (unavailable)`,
            value: selected,
          });
        }
        return (
          <FieldGroup.Item key={key}>
            <ThemeInput
              field={{ type: "select", label: definition.label, options }}
              value={selected}
              onChange={(value) => change([...path, key], JSON.parse(value))}
            />
          </FieldGroup.Item>
        );
      }
      if (options) {
        options = options.map((option) => ({
          ...option,
          label: pt(option.label),
        }));
        if (!options.some((option) => option.value === current)) {
          options.push({ label: String(current), value: current });
        }
      }
      return (
        <FieldGroup.Item key={key}>
          <ThemeInput
            field={
              options
                ? { type: "select", label: definition.label, options }
                : {
                    type: definition.type === "number" ? "number" : "text",
                    label: definition.label,
                  }
            }
            value={current}
            onChange={(value) => change([...path, key], value)}
          />
        </FieldGroup.Item>
      );
    });
  const renderTypography = (
    definitions: PropertyDefinitions,
    values: Record<string, any>,
    path: (string | number)[],
    entryId: string
  ) => (
    <>
      <FieldGroup
        label="Font"
        id={`theme-${entryId}-font`}
        defaultExpanded={!values.presentation}
      >
        {renderProperties(
          Object.fromEntries(
            Object.entries(definitions).filter(
              ([key]) =>
                ![
                  "fontSize",
                  "mobileFontSize",
                  "lineHeight",
                  "mobileLineHeight",
                  "transition",
                ].includes(key)
            )
          ),
          values,
          path,
          values.fontFamily
        )}
      </FieldGroup>
      <FieldGroup label="Desktop and mobile" id={`theme-${entryId}-responsive`}>
        <div className="theme-editor-grid">
          {renderProperties(
            Object.fromEntries(
              Object.entries(definitions).filter(([key]) =>
                [
                  "fontSize",
                  "mobileFontSize",
                  "lineHeight",
                  "mobileLineHeight",
                ].includes(key)
              )
            ),
            values,
            path
          )}
        </div>
      </FieldGroup>
    </>
  );
  return (
    <div className="theme-editor-fields">
      {(["colors", "typography", "actions"] as const).map((collection) => {
        const label =
          collection === "colors"
            ? "Colors"
            : collection === "typography"
              ? "Typography"
              : "Actions";
        const singular =
          collection === "colors"
            ? "color"
            : collection === "typography"
              ? "typography"
              : "action";
        return (
          <FieldTab
            key={collection}
            value={`theme-${collection}`}
            label={label}
          >
            <section className="theme-editor-collection" aria-label={label}>
              <div className="theme-editor-collection-heading">
                <p>
                  The first {singular === "typography" ? "group" : singular} is
                  the default.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = crypto.randomUUID();
                    setAddedId(id);
                    change(
                      [collection],
                      [
                        ...draft[collection],
                        createThemeEntry(
                          draft,
                          collection,
                          id,
                          `New ${singular}`
                        ),
                      ]
                    );
                  }}
                >
                  <Plus size={14} aria-hidden="true" />
                  Add {singular}
                </Button>
              </div>
              {draft[collection].map((entry, index) => (
                <FieldGroup
                  key={entry.id}
                  id={`theme-${collection}-${entry.id}`}
                  label={entry.label || `Unnamed ${singular}`}
                  variant="card"
                  defaultExpanded={index === 0 || entry.id === addedId}
                >
                  <FieldGroup.Item>
                    <div className="theme-editor-entry-toolbar">
                      <span>
                        {index === 0 ? "Default option" : `Option ${index + 1}`}
                      </span>
                      <div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Move ${entry.label} up`}
                          title="Move up"
                          disabled={index === 0}
                          onClick={() => {
                            const entries = [...draft[collection]];
                            [entries[index - 1], entries[index]] = [
                              entries[index],
                              entries[index - 1],
                            ];
                            change([collection], entries);
                          }}
                        >
                          <ArrowUp size={14} aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Move ${entry.label} down`}
                          title="Move down"
                          disabled={index === draft[collection].length - 1}
                          onClick={() => {
                            const entries = [...draft[collection]];
                            [entries[index + 1], entries[index]] = [
                              entries[index],
                              entries[index + 1],
                            ];
                            change([collection], entries);
                          }}
                        >
                          <ArrowDown size={14} aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${entry.label}`}
                          title={
                            draft[collection].length === 1
                              ? "Keep at least one option"
                              : "Delete"
                          }
                          disabled={draft[collection].length === 1}
                          onClick={() =>
                            change(
                              [collection],
                              draft[collection].filter(
                                (candidate) => candidate.id !== entry.id
                              )
                            )
                          }
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                    <ThemeInput
                      field={{ type: "text", label: "Name" }}
                      value={entry.label}
                      onChange={(value) =>
                        change([collection, index, "label"], value)
                      }
                    />
                  </FieldGroup.Item>
                  {"background" in entry ? (
                    (["background", "foreground"] as const).map((channel) => {
                      const gradient = entry[channel].includes("gradient(");
                      const match =
                        /^linear-gradient\(([-\d.]+)deg,\s*(.*)\)$/.exec(
                          entry[channel]
                        );
                      const stops = match?.[2]
                        .split(/,(?![^()]*\))/)
                        .map((stop) => stop.trim());
                      return (
                        <FieldGroup.Item key={channel}>
                          <div className="theme-editor-color-value">
                            {!gradient && (
                              <ColorPickerInput
                                ariaLabel={`Edit ${entry.label} ${channel}`}
                                value={entry[channel]}
                                alpha
                                onChange={(value) =>
                                  change([collection, index, channel], value)
                                }
                              />
                            )}
                            <ThemeInput
                              field={{
                                type: "text",
                                label:
                                  channel === "background"
                                    ? "Background color or gradient"
                                    : "Foreground",
                              }}
                              value={entry[channel]}
                              onChange={(value) =>
                                change([collection, index, channel], value)
                              }
                            />
                          </div>
                          {channel === "background" && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={() =>
                                change(
                                  [collection, index, channel],
                                  gradient
                                    ? "#FFFFFF"
                                    : `linear-gradient(90deg, ${entry[channel]}, #00000000)`
                                )
                              }
                            >
                              {gradient ? "Use solid color" : "Use gradient"}
                            </Button>
                          )}
                          {gradient && match && stops?.length === 2 && (
                            <div className="theme-editor-gradient">
                              <ThemeInput
                                field={{ type: "number", label: "Angle" }}
                                value={Number(match[1])}
                                onChange={(value) =>
                                  change(
                                    [collection, index, channel],
                                    `linear-gradient(${value}deg, ${stops[0]}, ${stops[1]})`
                                  )
                                }
                              />
                              <div className="theme-editor-gradient-stops">
                                {stops.map((stop, stopIndex) => (
                                  <div key={stopIndex}>
                                    <span>Stop {stopIndex + 1}</span>
                                    <ColorPickerInput
                                      ariaLabel={`${entry.label} gradient stop ${stopIndex + 1}`}
                                      value={stop}
                                      alpha
                                      onChange={(value) =>
                                        change(
                                          [collection, index, channel],
                                          `linear-gradient(${match[1]}deg, ${stopIndex === 0 ? value : stops[0]}, ${stopIndex === 1 ? value : stops[1]})`
                                        )
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </FieldGroup.Item>
                      );
                    })
                  ) : "presentation" in entry ? (
                    <>
                      <FieldGroup.Item>
                        <ThemeInput
                          field={{
                            type: "select",
                            label: "Presentation",
                            options: [
                              { label: "Button", value: "button" },
                              { label: "Link", value: "link" },
                            ],
                          }}
                          value={entry.presentation}
                          onChange={(presentation) => {
                            const {
                              padding: _padding,
                              borderWidth: _borderWidth,
                              borderRadius: _borderRadius,
                              onDark: _onDark,
                              ...common
                            } = entry as typeof entry & {
                              padding?: string;
                              borderWidth?: string;
                              borderRadius?: number;
                            };
                            const convertStates = (
                              values:
                                typeof entry | NonNullable<typeof entry.onDark>
                            ) =>
                              Object.fromEntries(
                                (["default", "hover", "active"] as const).map(
                                  (state) => {
                                    const {
                                      backgroundColor: _background,
                                      borderColor: _border,
                                      ...text
                                    } = values[
                                      state
                                    ] as typeof entry.default & {
                                      backgroundColor?: ThemeColorReference;
                                      borderColor?: ThemeColorReference;
                                    };
                                    return [
                                      state,
                                      presentation === "button"
                                        ? {
                                            ...text,
                                            backgroundColor: {
                                              colorId: draft.colors[0].id,
                                              channel: "background",
                                            },
                                            borderColor: {
                                              colorId: draft.colors[0].id,
                                              channel: "foreground",
                                            },
                                          }
                                        : text,
                                    ];
                                  }
                                )
                              );
                            change([collection, index], {
                              ...common,
                              presentation,
                              ...(presentation === "button"
                                ? themePropertyDefaults(buttonProperties)
                                : {}),
                              ...convertStates(entry),
                              ...(entry.onDark
                                ? { onDark: convertStates(entry.onDark) }
                                : {}),
                            });
                          }}
                        />
                      </FieldGroup.Item>
                      {renderTypography(
                        actionProperties,
                        entry,
                        [collection, index],
                        entry.id
                      )}
                      {entry.presentation === "button" && (
                        <FieldGroup
                          label="Button shape"
                          id={`theme-${entry.id}-shape`}
                        >
                          {renderProperties(buttonProperties, entry, [
                            collection,
                            index,
                          ])}
                        </FieldGroup>
                      )}
                      <FieldGroup
                        label="On light backgrounds"
                        id={`theme-${entry.id}-light`}
                      >
                        <div className="theme-editor-action-states">
                          {(["default", "hover", "active"] as const).map(
                            (state) => (
                              <FieldGroup
                                key={state}
                                label={`${state[0].toUpperCase()}${state.slice(1)} state`}
                                id={`theme-${entry.id}-${state}`}
                                defaultExpanded={state === "default"}
                              >
                                {renderProperties(
                                  entry.presentation === "button"
                                    ? buttonStateProperties
                                    : actionStateProperties,
                                  entry[state],
                                  [collection, index, state],
                                  entry.fontFamily
                                )}
                              </FieldGroup>
                            )
                          )}
                        </div>
                      </FieldGroup>
                      <FieldGroup
                        label="On dark backgrounds"
                        id={`theme-${entry.id}-dark`}
                      >
                        <FieldGroup.Item>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (entry.onDark) {
                                const { onDark: _onDark, ...rest } = entry;
                                change([collection, index], rest);
                              } else {
                                change(
                                  [collection, index, "onDark"],
                                  structuredClone({
                                    default: entry.default,
                                    hover: entry.hover,
                                    active: entry.active,
                                  })
                                );
                              }
                            }}
                          >
                            {entry.onDark
                              ? "Use light background styles"
                              : "Customize dark background styles"}
                          </Button>
                        </FieldGroup.Item>
                        <div className="theme-editor-action-states">
                          {entry.onDark &&
                            (["default", "hover", "active"] as const).map(
                              (state) => (
                                <FieldGroup
                                  key={state}
                                  label={`${state[0].toUpperCase()}${state.slice(1)} state`}
                                  id={`theme-${entry.id}-dark-${state}`}
                                >
                                  {renderProperties(
                                    entry.presentation === "button"
                                      ? buttonStateProperties
                                      : actionStateProperties,
                                    entry.onDark![state],
                                    [collection, index, "onDark", state],
                                    entry.fontFamily
                                  )}
                                </FieldGroup>
                              )
                            )}
                        </div>
                      </FieldGroup>
                      <FieldGroup
                        label="Transition"
                        id={`theme-${entry.id}-transition`}
                      >
                        {renderProperties(
                          { transition: actionProperties.transition },
                          entry,
                          [collection, index]
                        )}
                      </FieldGroup>
                    </>
                  ) : (
                    renderTypography(
                      typographyProperties,
                      entry,
                      [collection, index],
                      entry.id
                    )
                  )}
                </FieldGroup>
              ))}
            </section>
          </FieldTab>
        );
      })}
      <FieldTab label="Page" value="theme-page">
        <section className="theme-editor-collection" aria-label="Page settings">
          <FieldGroup label="Layout" id="theme-page-layout" defaultExpanded>
            {renderProperties(
              {
                pageContentMaxWidth: pageProperties.pageContentMaxWidth,
                pageSectionVerticalSpacing:
                  pageProperties.pageSectionVerticalSpacing,
              },
              draft.page,
              ["page"]
            )}
          </FieldGroup>
          <FieldGroup
            label="Borders and corners"
            id="theme-page-borders"
            defaultExpanded
          >
            {renderProperties(
              {
                imageBorderRadius: pageProperties.imageBorderRadius,
                cardBorderRadius: pageProperties.cardBorderRadius,
                cardBorderWidth: pageProperties.cardBorderWidth,
              },
              draft.page,
              ["page"]
            )}
          </FieldGroup>
        </section>
      </FieldTab>
      <div className="theme-editor-footer">
        {validation.errors.map((issue, index) => (
          <p key={`error-${index}`} className="theme-editor-error" role="alert">
            {issue.path.join(".")}: {issue.message}
          </p>
        ))}
        {validation.warnings.length > 0 && (
          <FieldGroup
            label={`${validation.warnings.length} color reference warnings`}
            id="theme-reference-warnings"
          >
            <div className="theme-editor-issues">
              {validation.warnings.map((issue, index) => (
                <FieldGroup.Item key={`warning-${index}`}>
                  <p className="theme-editor-warning" role="status">
                    {issue.path.join(".")}: {issue.message}
                  </p>
                </FieldGroup.Item>
              ))}
            </div>
          </FieldGroup>
        )}
        <SetThemeDataButton
          themeData={draft}
          onThemeChange={onThemeChange}
          customFonts={customFonts}
        />
      </div>
    </div>
  );
};
