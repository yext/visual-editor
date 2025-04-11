import "./puck.css";
import React from "react";
import { usePuck } from "@measured/puck";
import { PanelLeft, PanelRight } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../ui/button.tsx";
import "../../../editor/index.css";

type UIButtonsToggleProps = {
  showLeft: boolean;
};

export const UIButtonsToggle = (props: UIButtonsToggleProps) => {
  const { showLeft } = props;

  const {
    dispatch,
    appState: {
      ui: { leftSideBarVisible, rightSideBarVisible },
    },
  } = usePuck();

  const toggleSidebars = useCallback(
    (sidebar: "left" | "right") => {
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
    [dispatch, leftSideBarVisible, rightSideBarVisible]
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
