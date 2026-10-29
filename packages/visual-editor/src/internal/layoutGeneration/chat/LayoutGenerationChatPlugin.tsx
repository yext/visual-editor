import { createUsePuck, type Plugin } from "@puckeditor/core";
import { MessageSquare } from "lucide-react";
import React from "react";
import { LayoutGenerationChat } from "./LayoutGenerationChat.tsx";
import { LayoutGenerationChatUiContext } from "./contexts.tsx";

const usePuck = createUsePuck();
export const layoutGenerationChatPluginName = "local-editor-layout-assistant";

const LayoutGenerationChatPanel = () => {
  const ui = React.useContext(LayoutGenerationChatUiContext);
  const active = usePuck(
    (puck) =>
      puck.appState.ui.plugin.current === layoutGenerationChatPluginName &&
      puck.appState.ui.leftSideBarVisible
  );
  return ui ? <LayoutGenerationChat {...ui} active={active} /> : <></>;
};

// Stable identity prevents streaming updates from remounting the panel.
export const layoutGenerationChatPlugin: Plugin = {
  name: layoutGenerationChatPluginName,
  label: "Layout Assistant",
  icon: <MessageSquare data-local-editor-chat-rail aria-hidden="true" />,
  render: LayoutGenerationChatPanel,
};
