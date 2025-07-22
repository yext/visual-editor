import "./puck.css";
import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog.tsx";
import { Button } from "../ui/button.tsx";
import "../../../editor/index.css";
import { pt } from "../../../utils/i18n/platform.ts";

type ClearLocalChangesButtonProps = {
  disabled: boolean;
  onClearLocalChanges: () => void;
  modalOpen: boolean;
  setModalOpen: (newValue: boolean) => void;
};

export const ClearLocalChangesButton = ({
  disabled,
  onClearLocalChanges,
  modalOpen,
  setModalOpen,
}: ClearLocalChangesButtonProps) => {
  const handleClearLocalChanges = () => {
    onClearLocalChanges();
    setModalOpen(false);
  };
  return (
    <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
      <AlertDialogTrigger disabled={disabled} asChild>
        <Button variant="link">
          {pt("discardChanges.discardChanges", "Discard Changes")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {pt("discardChanges.discardChanges", "Discard Changes")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pt(
              "discardChanges.warning",
              "This action will remove your local changes. It cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{pt("cancel", "Cancel")}</AlertDialogCancel>
          <Button onClick={handleClearLocalChanges}>
            {pt("confirm", "Confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
