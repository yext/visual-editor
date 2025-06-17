import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";
import { Button } from "../../puck/ui/button.tsx";
import { pt } from "../../../utils/i18nPlatform.ts";

type ApprovalModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSendLayoutForApproval: (comment: string) => void;
};

export const LayoutApprovalModal = (props: ApprovalModalProps) => {
  const { open, setOpen, onSendLayoutForApproval } = props;
  const [comment, setComment] = React.useState("");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="ve-fixed ve-inset-0 ve-bg-black/50 ve-backdrop-blur-sm" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="ve-fixed ve-left-1/2 ve-top-1/2 ve-w-full ve-max-w-lg ve--translate-x-1/2 ve--translate-y-1/2 ve-rounded-2xl ve-bg-white ve-p-8 ve-shadow-2xl ve-focus:outline-none"
        >
          <div className="ve-mb-6 ve-flex ve-items-start ve-justify-between">
            <Dialog.Title className="ve-text-xl ve-font-semibold ve-text-gray-900">
              {pt("approvals.send", "Send for Approval")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label={pt("close", "Close")}
                className="ve-text-gray-400 ve-transition-colors hover:ve-text-gray-600"
              >
                <X />
              </button>
            </Dialog.Close>
          </div>

          <p className="ve-mb-4 ve-text-sm ve-text-gray-600">
            {pt(
              "approvals.addAComment",
              "Add a comment to help your approver understand what changed"
            )}{" "}
            <span className="ve-text-gray-400">
              ({pt("optional", "Optional")})
            </span>
          </p>

          <div className="ve-mb-6">
            <label
              htmlFor="comment"
              className="ve-mb-2 ve-block ve-text-sm ve-font-medium ve-text-gray-700"
            >
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="ve-w-full ve-rounded-lg ve-border ve-border-gray-300 ve-px-4 ve-py-3 ve-text-sm ve-text-gray-900 ve-shadow-sm ve-focus:border-blue-500 ve-focus:outline-none ve-focus:ring-2 ve-focus:ring-blue-500"
              placeholder={pt(
                "approvals.writeComment",
                "Write your comment here..."
              )}
            />
          </div>

          <div className="ve-flex ve-justify-end ve-gap-3">
            <Dialog.Close asChild>
              <Button variant="outline" className="ve-px-4 ve-py-2">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="default"
              onClick={() => {
                setOpen(false);
                onSendLayoutForApproval(comment);
              }}
              className="ve-px-4 ve-py-2"
            >
              {pt("approvals.send", "Send for Approval")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
