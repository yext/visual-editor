import "./puck.css";
import React from "react";
import { createUsePuck, useGetPuck } from "@measured/puck";
import { PanelLeft, PanelRight } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../ui/button.tsx";
import "../../../editor/index.css";

const usePuck = createUsePuck();

type UIButtonsToggleProps = {
  showLeft: boolean;
};

export const UIButtonsToggle = (props: UIButtonsToggleProps) => {
  const { showLeft } = props;
  const getPuck = useGetPuck();

  const leftSideBarVisible = usePuck((s) => s.appState.ui.leftSideBarVisible);
  const rightSideBarVisible = usePuck((s) => s.appState.ui.rightSideBarVisible);

  const toggleSidebars = useCallback(
    (sidebar: "left" | "right") => {
      const { dispatch } = getPuck();

      const widerViewport = window.matchMedia("(min-width: 638px)").matches;
      const sideBarVisible =
        sidebar === "left" ? leftSideBarVisible : rightSideBarVisible;
      const oppositeSideBar =
        sidebar === "left" ? "rightSideBarVisible" : "leftSideBarVisible";

      dispatch({
        type: "setUi",
        ui: {
          [`${sidebar}SideBarVisible`]: !sideBarVisible,
          ...(!widerViewport ? { [oppositeSideBar]: false } : {}),
        },
      });
    },
    [leftSideBarVisible, rightSideBarVisible]
  );

  return (
    <>
      {showLeft && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            toggleSidebars("left");
          }}
        >
          <PanelLeft className="sm-icon" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleSidebars("right");
        }}
      >
        <PanelRight className="sm-icon" />
      </Button>
    </>
  );
};
