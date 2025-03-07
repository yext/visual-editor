import React from "react";
import { AppState, Data, usePuck, type History } from "@measured/puck";
import { RotateCcw, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button.tsx";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import "../ui/puck.css";
import "../../../components/editor/index.css";

type LayoutHeaderProps = {
  onClearLocalChanges: () => void;
  onHistoryChange: (histories: History[], index: number) => void;
  onPublishLayout: (data: Data) => Promise<void>;
  isDevMode: boolean;
  clearLocalChangesModalOpen: boolean;
  setClearLocalChangesModalOpen: (newValue: boolean) => void;
};

export const LayoutHeader = (props: LayoutHeaderProps) => {
  const {
    onClearLocalChanges,
    onHistoryChange,
    onPublishLayout,
    isDevMode,
    clearLocalChangesModalOpen,
    setClearLocalChangesModalOpen,
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
  } = usePuck() as {
    appState: ReturnType<typeof usePuck>["appState"];
    history: Omit<ReturnType<typeof usePuck>["history"], "histories"> & {
      histories: History<Partial<AppState>>[];
    };
  };

  useEffect(() => {
    onHistoryChange(histories, index);
  }, [index, histories, onHistoryChange]);

  return (
    <header className="puck-header">
      <div className="header-left">
        <UIButtonsToggle showLeft={true} />
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
          modalOpen={clearLocalChangesModalOpen}
          setModalOpen={setClearLocalChangesModalOpen}
          disabled={histories.length === 1}
          onClearLocalChanges={() => {
            onClearLocalChanges();
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
              await onPublishLayout(appState.data);
              onClearLocalChanges();
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
