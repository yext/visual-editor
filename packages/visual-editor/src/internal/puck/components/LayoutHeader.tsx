import React from "react";
import { Data, usePuck, type History } from "@measured/puck";
import { RotateCcw, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "../ui/button.tsx";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { LayoutApprovalModal } from "../../components/modals/LayoutApprovalModal.tsx";
import { TemplateMetadata } from "../../types/templateMetadata.ts";
import "../ui/puck.css";
import "../../../editor/index.css";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";

type LayoutHeaderProps = {
  templateMetadata: TemplateMetadata;
  onClearLocalChanges: () => void;
  onHistoryChange: (histories: History[], index: number) => void;
  onPublishLayout: (data: Data) => Promise<void>;
  onSendLayoutForApproval: (data: Data, comment: string) => void;
  isDevMode: boolean;
  clearLocalChangesModalOpen: boolean;
  setClearLocalChangesModalOpen: (newValue: boolean) => void;
  localDev: boolean;
};

export const LayoutHeader = (props: LayoutHeaderProps) => {
  const {
    templateMetadata,
    onClearLocalChanges,
    onHistoryChange,
    onPublishLayout,
    onSendLayoutForApproval,
    isDevMode,
    clearLocalChangesModalOpen,
    setClearLocalChangesModalOpen,
    localDev,
  } = props;

  const [approvalModalOpen, setApprovalModalOpen] =
    React.useState<boolean>(false);

  const {
    appState,
    config,
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
    onHistoryChange(histories, index);
  }, [index, histories, onHistoryChange]);

  return (
    <>
      <LayoutApprovalModal
        open={approvalModalOpen}
        setOpen={setApprovalModalOpen}
        onSendLayoutForApproval={(comment: string) => {
          onSendLayoutForApproval(appState.data, comment);
        }}
      />
      <header className="puck-header">
        <div className="header-left ve-items-center">
          <UIButtonsToggle showLeft={true} />
          <Separator
            orientation="vertical"
            decorative
            className="ve-mx-4 ve-h-7 ve-w-px ve-bg-gray-300 ve-my-auto"
          />
          <EntityFieldsToggle />
          {localDev && (
            <>
              <Button
                onClick={() => console.log(JSON.stringify(appState.data))}
                variant="outline"
                className="ve-ml-4"
              >
                Log Layout Data
              </Button>
              <Button
                onClick={() => {
                  let data = { root: {}, content: [] };
                  try {
                    data = JSON.parse(prompt("Enter layout data:") ?? "{}");
                  } finally {
                    const migratedData = migrate(
                      data,
                      migrationRegistry,
                      config
                    );
                    setHistories([
                      ...histories,
                      { state: { data: migratedData } },
                    ]);
                  }
                }}
                variant="outline"
                className="ve-ml-4"
              >
                Set Layout Data
              </Button>
            </>
          )}
        </div>
        <div className="header-center"></div>
        <div className="actions">
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasPast}
            onClick={back}
          >
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
          <Separator
            orientation="vertical"
            decorative
            className="ve-mx-4 ve-h-7 ve-w-px ve-bg-gray-300 ve-my-auto"
          />
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
                if (templateMetadata.assignment == "ENTITY") {
                  setApprovalModalOpen(true);
                } else {
                  await onPublishLayout(appState.data);
                  onClearLocalChanges();
                  setHistories([
                    { id: "root", state: { data: appState.data } },
                  ]);
                }
              }}
            >
              {templateMetadata.assignment === "ENTITY"
                ? "Send for Approval"
                : `Update ${templateMetadata.entityCount} ${templateMetadata.entityCount === 1 ? "Page" : "Pages"}`}
            </Button>
          )}
        </div>
      </header>
    </>
  );
};
