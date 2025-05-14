import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import React from "react";
import { Button } from "../../puck/ui/button.tsx";

type ApprovalModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (comment: string) => void;
};

export const ApprovalModal = (props: ApprovalModalProps) => {
  const { open, onOpenChange, onSend } = props;
  const [comment, setComment] = React.useState("");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl focus:outline-none"
        >
          <div className="mb-6 flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Send for Approval
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Add a comment to help your approver understand what changed{" "}
            <span className="text-gray-400">(Optional)</span>
          </p>

          <div className="mb-6">
            <label
              htmlFor="comment"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your comment here..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="outline" className="px-4 py-2">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="default"
              onClick={() => onSend(comment)}
              className="px-4 py-2"
            >
              Send for Approval
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
