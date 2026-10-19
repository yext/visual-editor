import React from "react";
import { createUsePuck, type Plugin } from "@puckeditor/core";
import { MessageSquare } from "lucide-react";
import { LocalEditorChat } from "./LocalEditorChat.tsx";
import { LocalEditorChatUiContext } from "./LocalEditorChatUiContext.tsx";

const usePuck = createUsePuck();
const pluginName = "local-editor-layout-assistant";

const LocalEditorChatPanel = () => {
  const ui = React.useContext(LocalEditorChatUiContext);
  const active = usePuck(
    (puck) =>
      puck.appState.ui.plugin.current === pluginName &&
      puck.appState.ui.leftSideBarVisible
  );
  return ui ? <LocalEditorChat {...ui} active={active} /> : <></>;
};

// Stable identity prevents streaming updates from remounting the panel.
export const localEditorChatPlugin: Plugin = {
  name: pluginName,
  label: "Layout assistant",
  icon: <MessageSquare data-local-editor-chat-rail aria-hidden="true" />,
  render: LocalEditorChatPanel,
};
