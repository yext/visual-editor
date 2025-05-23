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
        <Button variant="link">Discard Changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Changes</AlertDialogTitle>
          <AlertDialogDescription>
            This action will remove your local changes. It cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleClearLocalChanges}>Confirm</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
