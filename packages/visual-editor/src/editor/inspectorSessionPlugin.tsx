import React from "react";
import { createUsePuck, useGetPuck, type Plugin } from "@puckeditor/core";

const usePuck = createUsePuck();

// Puck can temporarily retain indexes for nodes removed by history; verify against authored data too.
function containsComponent(value: unknown, id: string): boolean {
  if (!value || typeof value !== "object") return false;
  if (
    "type" in value &&
    "props" in value &&
    (value.props as { id?: string })?.id === id
  )
    return true;
  return Object.values(value).some((child) => containsComponent(child, id));
}

/** Selection and inspector navigation belong to the editing session, not the document history. */
function InspectorSession({ children }: { children: React.ReactNode }) {
  const getPuck = useGetPuck();
  const index = usePuck((state) => state.history.index);
  const histories = usePuck((state) => state.history.histories);
  const selectedId = usePuck((state) => state.selectedItem?.props.id);
  const fieldTab = usePuck((state) => state.appState.ui.fieldTab);
  const groups = usePuck((state) => state.appState.ui.expandedFieldGroups);
  const previous = React.useRef(getPuck());

  React.useLayoutEffect(() => {
    const before = previous.current;
    const current = getPuck();
    // Undo/redo changes the cursor in the same history. A normal edit creates a new history array.
    if (
      before.history.histories === histories &&
      before.history.index !== index
    ) {
      const id = before.selectedItem?.props.id;
      const itemSelector =
        id && containsComponent(current.appState.data, id)
          ? current.getSelectorForId(id)
          : null;
      if (id) {
        current.dispatch({
          type: "setUi",
          recordHistory: false,
          ui: {
            itemSelector,
            fieldTab: before.appState.ui.fieldTab,
            expandedFieldGroups: before.appState.ui.expandedFieldGroups,
          },
        });
      }
    }
    previous.current = getPuck();
  }, [getPuck, index, histories, selectedId, fieldTab, groups]);
  return <>{children}</>;
}

/** Add to a custom Puck host to keep the inspector on its current component during Undo/Redo. */
export const inspectorSessionPlugin: Plugin = {
  name: "inspector-session",
  overrides: { puck: InspectorSession },
};
