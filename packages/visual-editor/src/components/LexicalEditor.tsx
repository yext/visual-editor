import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  ListItemNode,
  ListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichText } from "../types/types.ts";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  EditorState,
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { useEffect, useState, useCallback } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Link2, List, ListOrdered, Undo2, Redo2 } from "lucide-react";
import { $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil } from "lucide-react";
import React from "react";

interface LexicalEditorProps {
  value: string | RichText;
  onChange: (value: string | RichText) => void;
  showToolbar?: boolean;
}

const theme = {
  // Theme styling goes here
  paragraph: "mb-2",
  text: {
    base: "text-base",
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
  },
  heading: {
    h1: "text-4xl font-bold mb-4",
    h2: "text-3xl font-bold mb-3",
    h3: "text-2xl font-bold mb-2",
    h4: "text-xl font-bold mb-2",
    h5: "text-lg font-bold mb-2",
    h6: "text-base font-bold mb-2",
  },
  list: {
    ul: "list-disc pl-4 mb-2",
    ol: "list-decimal pl-4 mb-2",
    listitem: "mb-1",
  },
  quote: "border-l-4 border-gray-300 pl-4 italic mb-2",
  code: "bg-gray-100 rounded px-2 py-1 font-mono text-sm",
  link: "text-blue-600 hover:underline",
};

function onError(error: Error) {
  console.error(error);
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div className="editor-error-boundary">{children}</div>;
}

export function LexicalEditorComponent({
  value,
  onChange,
  showToolbar = false,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: "LexicalEditor",
    theme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListItemNode,
      ListNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    editorState: (editor: LexicalEditor) => {
      try {
        if (typeof value === "string") {
          // Try to parse as JSON first
          try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === "object" && parsed.root) {
              editor.setEditorState(editor.parseEditorState(value));
              return;
            }
          } catch {
            // Not JSON, treat as plain text
          }
          // If not JSON, treat as plain text
          const root = $getRoot();
          root.clear();
          if (value.trim() !== "") {
            const paragraph = $createParagraphNode();
            const text = $createTextNode(value);
            paragraph.append(text);
            root.append(paragraph);
          }
        } else if (typeof value === "object" && value !== null) {
          // Handle RichText object
          if (value.json) {
            // Use the JSON property if available
            editor.setEditorState(editor.parseEditorState(value.json));
          } else if (value.html) {
            // If only HTML is available, we need to parse it
            // For now, fall back to creating a simple text node
            const root = $getRoot();
            root.clear();
            const paragraph = $createParagraphNode();
            const text = $createTextNode("Content available");
            paragraph.append(text);
            root.append(paragraph);
          }
        }
      } catch {
        // fallback: do nothing
      }
    },
  };

  // Dialog state lifted to parent
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [dialogPosition, setDialogPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const [linkUrl, setLinkUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [shouldPrefill, setShouldPrefill] = React.useState(false);

  // Handler to open dialog and set position
  const handleLinkClick = React.useCallback(() => {
    setShouldPrefill(true);
    setTimeout(() => {
      const sel = window.getSelection();
      const editorContainer = document.querySelector(".editor-container");
      if (sel && sel.rangeCount > 0 && editorContainer) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const editorRect = editorContainer.getBoundingClientRect();
        if (rect && rect.top !== 0 && rect.left !== 0) {
          setDialogPosition({
            top: rect.bottom - editorRect.top + 8, // 8px below, relative to editor
            left: rect.left - editorRect.left,
          });
        } else {
          setDialogPosition(null);
        }
      } else {
        setDialogPosition(null);
      }
    }, 0);
  }, []);

  // Handler to submit link
  const handleLinkSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowLinkDialog(false);
    // Use the latest editor instance
    const editor = (window as any).__latestLexicalEditor;
    if (editor) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl || null);
    }
    setLinkUrl("");
  };

  // Prefill logic
  React.useEffect(() => {
    if (
      showLinkDialog &&
      shouldPrefill &&
      (window as any).__latestLexicalEditor
    ) {
      (window as any).__latestLexicalEditor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          const linkNode = $findMatchingParent(node, $isLinkNode);
          if (linkNode && typeof linkNode.getURL === "function") {
            const url = linkNode.getURL() || "";
            setLinkUrl(url || "https://");
          } else {
            setLinkUrl("https://");
          }
        } else {
          setLinkUrl("https://");
        }
      });
      setShouldPrefill(false);
    }
    if (showLinkDialog && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showLinkDialog, shouldPrefill]);

  // Pass dialog state/handlers to ToolbarPlugin
  function ToolbarWithDialogProps(props: any) {
    return (
      <ToolbarPlugin
        {...props}
        showLinkDialog={showLinkDialog}
        setShowLinkDialog={setShowLinkDialog}
        dialogPosition={dialogPosition}
        setDialogPosition={setDialogPosition}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        inputRef={inputRef}
        handleLinkClick={handleLinkClick}
        handleLinkSubmit={handleLinkSubmit}
        shouldPrefill={shouldPrefill}
        setShouldPrefill={setShouldPrefill}
      />
    );
  }

  // Register the latest editor instance globally for dialog use
  const editorRef = React.useRef<LexicalEditor | null>(null);
  React.useEffect(() => {
    if (editorRef.current) {
      (window as any).__latestLexicalEditor = editorRef.current;
    }
  });

  const handleEditorChange = (
    editorState: EditorState,
    editor: LexicalEditor
  ) => {
    editorRef.current = editor;
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor);
      onChange({
        html: htmlString,
        json: JSON.stringify(editorState.toJSON()),
      });
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container border rounded relative">
        {showToolbar && <ToolbarWithDialogProps />}
        {showToolbar && showLinkDialog && (
          <Dialog.Content
            style={
              dialogPosition
                ? {
                    position: "absolute",
                    top: dialogPosition.top,
                    left: dialogPosition.left,
                    zIndex: 9999,
                    background: "#f3f4f6",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                    padding: "1rem",
                    minWidth: "320px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }
                : {
                    position: "absolute",
                    top: 48, // Just below the toolbar (toolbar height + margin)
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 9999,
                    background: "#f3f4f6",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                    padding: "1rem",
                    minWidth: "320px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }
            }
            onOpenAutoFocus={() => {
              if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
              }
            }}
            onInteractOutside={(e) => e.stopPropagation()}
            onPointerDownOutside={(e) => {
              e.preventDefault();
              setShowLinkDialog(false);
            }}
          >
            <form
              onSubmit={handleLinkSubmit}
              className="ve-flex ve-items-center ve-w-full"
            >
              <input
                ref={inputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://"
                className="ve-flex-1 ve-px-3 ve-py-2 ve-rounded ve-bg-white ve-border ve-border-gray-300 focus:ve-outline-none focus:ve-ring-2 focus:ve-ring-blue-500 ve-shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowLinkDialog(false);
                  }
                }}
              />
              <button
                type="submit"
                className="ve-ml-2 ve-p-2 ve-bg-transparent ve-rounded hover:ve-bg-gray-200"
                tabIndex={-1}
              >
                <Pencil className="ve-w-4 ve-h-4 ve-text-gray-500" />
              </button>
            </form>
            <button
              type="button"
              className="ve-absolute ve-top-2 ve-right-2 ve-p-1 ve-rounded hover:ve-bg-gray-200"
              aria-label="Close"
              onClick={() => setShowLinkDialog(false)}
            >
              ×
            </button>
          </Dialog.Content>
        )}
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="editor-input min-h-[100px] p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          }
          placeholder={null}
          ErrorBoundary={ErrorBoundary}
        />
        <OnChangePlugin onChange={handleEditorChange} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </div>
    </LexicalComposer>
  );
}

// Update ToolbarPlugin to accept dialog props
function ToolbarPlugin({
  setShowLinkDialog,
  handleLinkClick,
}: {
  setShowLinkDialog: (open: boolean) => void;
  handleLinkClick: (editor: any) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  };

  const handleToolbarLinkClick = useCallback(() => {
    handleLinkClick(editor);
    setShowLinkDialog(true);
  }, [editor, handleLinkClick, setShowLinkDialog]);

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor]);

  return (
    <div className="toolbar border-b border-gray-200 p-2 flex gap-2">
      {/* Undo */}
      <button
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-100"
        title="Undo"
      >
        <Undo2 />
      </button>
      {/* Redo */}
      <button
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-100"
        title="Redo"
      >
        <Redo2 />
      </button>
      {/* Bold */}
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`p-2 rounded hover:bg-gray-100 ${isBold ? "bg-gray-200" : ""}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      {/* Italic */}
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`p-2 rounded hover:bg-gray-100 ${isItalic ? "bg-gray-200" : ""}`}
        title="Italic"
      >
        <em>I</em>
      </button>
      {/* Underline */}
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`p-2 rounded hover:bg-gray-100 ${isUnderline ? "bg-gray-200" : ""}`}
        title="Underline"
      >
        <u>U</u>
      </button>
      {/* Link */}
      <button
        onClick={handleToolbarLinkClick}
        className="p-2 rounded hover:bg-gray-100"
        title="Insert Link"
        type="button"
      >
        <Link2 />
      </button>
      {/* Bulleted List */}
      <button
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        className="p-2 rounded hover:bg-gray-100"
        title="Bulleted List"
      >
        <List />
      </button>
      {/* Numbered List */}
      <button
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        className="p-2 rounded hover:bg-gray-100"
        title="Numbered List"
      >
        <ListOrdered />
      </button>
    </div>
  );
}
