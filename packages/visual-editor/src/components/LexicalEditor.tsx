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

function ToolbarPlugin() {
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

  const handleLinkClick = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const linkParent = $findMatchingParent(node, $isLinkNode);
        if (linkParent) {
          // Remove link
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        } else {
          // Insert link
          const url = window.prompt("Enter the URL for the link:");
          if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
          }
        }
      }
    });
  }, [editor]);

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
        onClick={handleLinkClick}
        className="p-2 rounded hover:bg-gray-100"
        title="Insert Link"
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
        }
      } catch {
        // fallback: do nothing
      }
    },
  };

  const handleEditorChange = (
    editorState: EditorState,
    editor: LexicalEditor
  ) => {
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
      <div className="editor-container border rounded">
        {showToolbar && <ToolbarPlugin />}
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="editor-input min-h-[100px] p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          }
          placeholder={
            <div className="editor-placeholder absolute top-2 left-2 text-gray-400 pointer-events-none">
              Enter some text...
            </div>
          }
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
