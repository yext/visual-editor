import "../ui/Puck.css";
import React from "react";
import { Data, usePuck, type History } from "@measured/puck";
import { RotateCcw, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button.tsx";
import "../../../components/index.css";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";

type LayoutHeaderProps = {
  handleClearLocalChanges: () => void;
  handleHistoryChange: (histories: History[], index: number) => void;
  handlePublishLayout: (data: Data) => Promise<void>;
  isDevMode: boolean;
};

export const LayoutHeader = (props: LayoutHeaderProps) => {
  const {
    handleClearLocalChanges,
    handleHistoryChange,
    handlePublishLayout,
    isDevMode,
  } = props;

  const {
    appState,
    history: {
      back,
      forward,
      histories,
      index,
      hasPast,
      hasFuture,
      setHistories,
    },
  } = usePuck();

  useEffect(() => {
    handleHistoryChange(histories, index);
  }, [index, histories, handleHistoryChange]);

  return (
    <header className="puck-header">
      <div className="header-left">
        <UIButtonsToggle />
        <EntityFieldsToggle />
      </div>
      <div className="header-center"></div>
      <div className="actions">
        <Button variant="ghost" size="icon" disabled={!hasPast} onClick={back}>
          <RotateCcw className="sm-icon" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={!hasFuture}
          onClick={forward}
        >
          <RotateCw className="sm-icon" />
        </Button>
        <ClearLocalChangesButton
          disabled={histories.length === 1}
          onClearLocalChanges={() => {
            handleClearLocalChanges();
            setHistories([
              { id: "root", state: { data: histories[0].state.data } },
            ]);
          }}
        />
        {!isDevMode && (
          <Button
            variant="secondary"
            disabled={histories.length === 1}
            onClick={async () => {
              await handlePublishLayout(appState.data);
              handleClearLocalChanges();
              setHistories([{ id: "root", state: { data: appState.data } }]);
            }}
          >
            Publish
          </Button>
        )}
      </div>
    </header>
  );
};