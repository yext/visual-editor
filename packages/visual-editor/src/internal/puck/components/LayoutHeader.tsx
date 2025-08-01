import React from "react";
import { Data, usePuck, type History } from "@measured/puck";
import { RotateCcw, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "../ui/button.tsx";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { LayoutApprovalModal } from "../../components/modals/LayoutApprovalModal.tsx";
import { TemplateMetadata } from "../../types/templateMetadata.ts";
import "../ui/puck.css";
import "../../../editor/index.css";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import {
  i18nPlatformInstance,
  usePlatformTranslation,
  pt,
} from "../../../utils/i18n/platform.ts";

type LayoutHeaderProps = {
  templateMetadata: TemplateMetadata;
  onClearLocalChanges: () => void;
  onHistoryChange: (histories: History[], index: number) => void;
  onPublishLayout: (data: Data) => Promise<void>;
  onSendLayoutForApproval: (data: Data, comment: string) => void;
  isDevMode: boolean;
  clearLocalChangesModalOpen: boolean;
  setClearLocalChangesModalOpen: (newValue: boolean) => void;
  localDev: boolean;
};

export const LayoutHeader = (props: LayoutHeaderProps) => {
  const {
    templateMetadata,
    onClearLocalChanges,
    onHistoryChange,
    onPublishLayout,
    onSendLayoutForApproval,
    isDevMode,
    clearLocalChangesModalOpen,
    setClearLocalChangesModalOpen,
    localDev,
  } = props;

  const [approvalModalOpen, setApprovalModalOpen] =
    React.useState<boolean>(false);

  const {
    appState,
    history: {
      back,
      forward,
      histories,
      index,
      hasPast,
      hasFuture,
      setHistories,
    },
  } = usePuck();
  const { i18n } = usePlatformTranslation();

  useEffect(() => {
    onHistoryChange(histories, index);
  }, [index, histories, onHistoryChange]);

  useEffect(translatePuckSidebars, [i18n.language]);

  const buttonText = (() => {
    if (templateMetadata.assignment === "ALL") {
      // TODO: translation concatenation
      const pageText =
        templateMetadata.entityCount === 1
          ? pt("page", "Page")
          : pt("pages", "Pages");
      return `${pt("update", "Update")} ${templateMetadata.entityCount} ${pageText}`;
    } else if (templateMetadata.assignment === "ENTITY") {
      if (templateMetadata.layoutTaskApprovals) {
        return pt("approvals.send", "Send for Approval");
      }
      return pt("updatePage", "Update Page");
    }
  })();

  const onButtonClick = async () => {
    if (
      templateMetadata.assignment == "ENTITY" &&
      templateMetadata.layoutTaskApprovals
    ) {
      setApprovalModalOpen(true);
    } else {
      await onPublishLayout(appState.data);
      onClearLocalChanges();
      setHistories([{ id: "root", state: { data: appState.data } }]);
    }
  };

  return (
    <>
      <LayoutApprovalModal
        open={approvalModalOpen}
        setOpen={setApprovalModalOpen}
        onSendLayoutForApproval={(comment: string) => {
          onSendLayoutForApproval(appState.data, comment);
        }}
      />
      <header className="puck-header">
        <div className="header-left ve-items-center">
          <UIButtonsToggle showLeft={true} />
          <Separator
            orientation="vertical"
            decorative
            className="ve-mx-4 ve-h-7 ve-w-px ve-bg-gray-300 ve-my-auto"
          />
          <EntityFieldsToggle />
          {localDev && <LocalDevOverrideButtons />}
        </div>
        <div className="header-center"></div>
        <div className="actions">
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasPast}
            onClick={back}
            aria-label={pt("undo", "Undo")}
          >
            <RotateCcw className="sm-icon" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!hasFuture}
            onClick={forward}
            aria-label={pt("redo", "Redo")}
          >
            <RotateCw className="sm-icon" />
          </Button>
          <Separator
            orientation="vertical"
            decorative
            className="ve-mx-4 ve-h-7 ve-w-px ve-bg-gray-300 ve-my-auto"
          />
          <ClearLocalChangesButton
            modalOpen={clearLocalChangesModalOpen}
            setModalOpen={setClearLocalChangesModalOpen}
            disabled={histories.length === 1}
            onClearLocalChanges={() => {
              onClearLocalChanges();
              setHistories([
                { id: "root", state: { data: histories[0].state.data } },
              ]);
            }}
          />
          {!isDevMode && (
            <Button
              variant="secondary"
              disabled={histories.length === 1}
              onClick={onButtonClick}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </header>
    </>
  );
};

export const LocalDevOverrideButtons = () => {
  const {
    appState,
    config,
    history: { histories, setHistories },
  } = usePuck();

  return (
    <>
      <Button
        onClick={() => console.log(JSON.stringify(appState.data))}
        variant="outline"
        className="ve-ml-4"
      >
        Log Layout Data
      </Button>
      <Button
        onClick={() => {
          let data = { root: {}, content: [] };
          try {
            data = JSON.parse(prompt("Enter layout data:") ?? "{}");
          } finally {
            const migratedData = migrate(data, migrationRegistry, config);
            setHistories([...histories, { state: { data: migratedData } }]);
          }
        }}
        variant="outline"
        className="ve-ml-4"
      >
        Set Layout Data
      </Button>
      <Button
        onClick={() => {
          const locale = prompt("Enter components locale:");
          i18nComponentsInstance.changeLanguage(locale ?? "en");
        }}
        variant="outline"
        className="ve-ml-4"
      >
        Set Components Locale
      </Button>
      <Button
        onClick={() => {
          const locale = prompt("Enter platform locale:");
          i18nPlatformInstance.changeLanguage(locale ?? "en");
        }}
        variant="outline"
        className="ve-ml-4"
      >
        Set Platform Locale
      </Button>
    </>
  );
};

const translatePuckSidebars = () => {
  // Translate the static left sidebar titles
  const leftSideBarTitles = document.querySelectorAll<HTMLElement>(
    "[class*='PuckLayout-leftSideBar'] h2[class*='_Heading']"
  );
  if (leftSideBarTitles[0]) {
    leftSideBarTitles[0].innerText = pt("components.components", "Components");
  }
  if (leftSideBarTitles[1]) {
    leftSideBarTitles[1].innerText = pt("outline", "Outline");
  }

  // Translate the right sidebar title on load
  const fieldListSingleTitle = document.querySelector<HTMLElement>(
    "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-heading']:first-child > h2"
  );
  if (fieldListSingleTitle) {
    fieldListSingleTitle.innerText = pt("page", "Page");
  }

  // Translate the component category labels
  // These will only translate on initial load
  const componentCategoryTitles = document.querySelectorAll<HTMLElement>(
    "button[class*='ComponentList-title'] > div"
  );
  if (componentCategoryTitles?.length) {
    componentCategoryTitles.forEach((title) => {
      if (title.innerText === "PAGE SECTIONS") {
        title.innerText = pt("categories.pageSections", "PAGE SECTIONS");
      } else if (title.innerText === "OTHER") {
        title.innerText = pt("categories.other", "OTHER");
      }
    });
  }

  // Dynamically translate the right sidebar title as it updates
  const rightSidebar = document.querySelector(
    "[class*='PuckLayout-rightSideBar']"
  );
  if (!rightSidebar) {
    return;
  }

  const observer = new MutationObserver(() => {
    const fieldListSingleTitle = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-heading']:first-child > h2"
    );
    if (
      fieldListSingleTitle &&
      fieldListSingleTitle.innerText !== pt("page", "Page")
    ) {
      fieldListSingleTitle.innerText = pt("page", "Page");
    }

    const fieldListBreadcrumbTitle = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-breadcrumb'] button"
    );
    if (
      fieldListBreadcrumbTitle &&
      fieldListBreadcrumbTitle.innerText !== pt("page", "Page")
    ) {
      fieldListBreadcrumbTitle.innerText = pt("page", "Page");
    }
  });

  observer.observe(rightSidebar, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};
