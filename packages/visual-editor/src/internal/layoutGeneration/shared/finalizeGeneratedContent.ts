import type { PuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import {
  walkAuthored,
  type Content,
  type SavedComponent,
} from "./authoredValues.ts";
import { normalizeGeneratedText } from "./localizedText.ts";
import {
  finalizeSlottedSource,
  prepareSlottedSource,
} from "./slottedItemSource.ts";

/** Prepare descendants, identities and source mirrors in place; callers validate the assembled page. */
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
  walkAuthored(catalog, candidate, ({ component }) => {
    const config = catalog.data.components[component.type];
    prepareSlottedSource(component, config, explicitCardLists.has(component));
    onPrepared?.(component);
    component.props = normalizeGeneratedText(
      component.props,
      config.generation!.props,
      { type: "object", objectFields: config.fields ?? {} },
      translationMode === "translate",
      locales
    );
  });
  walkAuthored(
    catalog,
    candidate,
    ({ component, collection }) => {
      component.props.id = assignId(
        component,
        `${collection.path}/${collection.items.indexOf(component)}`
      );
    },
    { identityOnly: true }
  );
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
};
