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
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

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
  const { t } = usePlatformTranslation();

  return (
    <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
      <AlertDialogTrigger disabled={disabled} asChild>
        <Button variant="link">
          {t("discardChanges.discardChanges", "Discard Changes")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("discardChanges.discardChanges", "Discard Changes")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "discardChanges.warning",
              "This action will remove your local changes. It cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
          <Button onClick={handleClearLocalChanges}>
            {t("confirm", "Confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
