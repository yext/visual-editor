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
import "../../../components/editor/index.css";

type ClearLocalChangesButtonProps = {
  disabled: boolean;
  onClearLocalChanges: () => void;
};

export const ClearLocalChangesButton = ({
  disabled,
  onClearLocalChanges,
}: ClearLocalChangesButtonProps) => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const handleClearLocalChanges = () => {
    onClearLocalChanges();
    setDialogOpen(false);
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger disabled={disabled} asChild>
        <Button variant="outline">Clear Local Changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Local Changes</AlertDialogTitle>
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
