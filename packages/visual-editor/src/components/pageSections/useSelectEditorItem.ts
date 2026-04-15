import * as React from "react";
import { useGetPuck } from "@puckeditor/core";

export const useSelectEditorItem = () => {
  const getPuck = useGetPuck();

  return React.useCallback(
    (itemId?: string) => {
      if (!itemId) {
        return false;
      }

      const { appState, dispatch, getSelectorForId } = getPuck();
      const selector = getSelectorForId(itemId);

      if (!selector) {
        return false;
      }

      dispatch({
        type: "setUi",
        ui: {
          ...appState?.ui,
          itemSelector: selector,
          rightSideBarVisible: true,
        },
      });

      return true;
    },
    [getPuck]
  );
};
