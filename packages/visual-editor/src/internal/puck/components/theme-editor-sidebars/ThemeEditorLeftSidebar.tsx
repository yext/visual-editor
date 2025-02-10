import React from "react";

const themeEditorModes = {
  theme: {
    title: "Theme",
    description:
      "Edit your site's theme, including your color palette, fonts, and text size.",
  },
  analytics: {
    title: "Analytics",
    description: "Edit your site's Google Analytics settings.",
  },
};

export type ThemeEditorModes = keyof typeof themeEditorModes;

type ThemeEditorLeftSidebarProps = {
  modeRef: React.MutableRefObject<ThemeEditorModes>;
  setMode: (mode: ThemeEditorModes) => void;
};

export const ThemeEditorLeftSidebar = ({
  modeRef,
  setMode,
}: ThemeEditorLeftSidebarProps) => {
  return (
    <div className="ve-flex ve-flex-col ve-gap-3">
      {Object.entries(themeEditorModes).map(([key, { title, description }]) => {
        return (
          <LeftSideBarItem
            key={key}
            title={title}
            description={description}
            isActive={modeRef.current === key}
            setMode={() => setMode(key as ThemeEditorModes)}
          />
        );
      })}
    </div>
  );
};

type LeftSideBarItemProps = {
  title: string;
  description: string;
  isActive: boolean;
  setMode: () => void;
};

const LeftSideBarItem = (props: LeftSideBarItemProps) => {
  const { title, description, isActive, setMode } = props;
  return (
    <div
      style={{
        borderLeft: `${isActive ? "3px" : "1px"} solid black`,
      }}
      className={`ve-mr-6 ve-pl-3 ve-group`}
    >
      <button onClick={setMode} type="button" className="ve-text-left">
        <p
          className={`${isActive ? "ve-font-bold" : ""} group-hover:ve-font-bold`}
        >
          {title}
        </p>
        <p className="ve-text-xs">{description}</p>
      </button>
    </div>
  );
};
