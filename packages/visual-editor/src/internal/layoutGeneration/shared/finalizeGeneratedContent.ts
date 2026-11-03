import type { PuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import {
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "./authoredValues.ts";
import { normalizeGeneratedText } from "./localizedText.ts";
import {
  finalizeSlottedSource,
  generationFields,
  prepareSlottedSource,
} from "./slottedItemSource.ts";

/** Prepare generated descendants before visiting them, then finalize identities and source mirrors in place. */
export const finalizeGeneratedContent = (
  catalog: PuckGenerationCatalog,
  candidate: Content,
  {
    locales,
    translationMode,
    explicitCardLists,
    assignId,
    onPrepared,
  }: {
    locales: string[];
    translationMode: "defaultOnly" | "translate";
    explicitCardLists: WeakSet<SavedComponent>;
    assignId: (component: SavedComponent, path: string) => string;
    onPrepared?: (component: SavedComponent) => void;
  }
) => {
  walkAuthored(catalog, candidate, ({ component, collection }) => {
    const config = catalog.data.components[component.type];
    prepareSlottedSource(component, config, explicitCardLists.has(component));
    onPrepared?.(component);
    component.props = normalizeGeneratedText(
      component.props,
      config.generation!.props,
      { type: "object", objectFields: generationFields(config) },
      translationMode === "translate",
      locales
    );
    component.props.id = assignId(
      component,
      `${collection.path}/${collection.items.indexOf(component)}`
    );
  });
  // Parent-first finalization applies child identity conventions. Copy mirrors
  // again after descendants have finalized their own references.
  const sources: SavedComponent[] = [];
  walkAuthored(catalog, candidate, ({ component }) => {
    const config = catalog.data.components[component.type];
    if (config.generation?.slottedItemSource) {
      finalizeSlottedSource(component, config);
      sources.push(component);
    }
  });
  for (const component of sources.reverse())
    finalizeSlottedSource(component, catalog.data.components[component.type]);
  validateAuthored(catalog, candidate);
};
