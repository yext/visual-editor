import * as React from "react";
import { CircleSlash2 } from "lucide-react";
import { useTemplateMetadata } from "../../internal/hooks/useMessageReceivers.ts";
import { pt } from "../../utils/i18n/platform.ts";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import { Body } from "../atoms/body.tsx";
import { useSelectEditorItem } from "./useSelectEditorItem.ts";

export const EntityFieldSectionEmptyState = ({
  backgroundColor,
  targetItemId,
}: {
  backgroundColor?: ThemeColor;
  targetItemId?: string;
}) => {
  const templateMetadata = useTemplateMetadata();
  const entityTypeDisplayName = templateMetadata?.entityTypeDisplayName;
  const selectEditorItem = useSelectEditorItem();
  const isInteractive = Boolean(targetItemId);
  const handleSelectTarget = React.useCallback(
    (
      event?:
        | React.MouseEvent<HTMLDivElement>
        | React.KeyboardEvent<HTMLDivElement>
    ) => {
      event?.preventDefault();
      event?.stopPropagation();
      selectEditorItem(targetItemId);
    },
    [selectEditorItem, targetItemId]
  );
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      handleSelectTarget(event);
    },
    [handleSelectTarget]
  );
  const handleClickCapture = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      handleSelectTarget(event);
    },
    [handleSelectTarget]
  );
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      handleSelectTarget(event);
    },
    [handleSelectTarget]
  );

  return (
    <PageSection background={backgroundColor}>
      <div
        className={`relative h-[300px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5 ${isInteractive ? "cursor-pointer transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2" : ""}`}
        data-testid="entity-field-section-empty-state"
        onClick={isInteractive ? handleClick : undefined}
        onClickCapture={isInteractive ? handleClickCapture : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
      >
        <CircleSlash2 className="w-12 h-12 text-gray-400" />
        <div className="flex flex-col items-center gap-0">
          <Body variant="base" className="text-gray-500 font-medium">
            {pt(
              "emptyStateSectionHidden",
              "Section hidden for this {{entityType}}",
              {
                entityType: entityTypeDisplayName
                  ? entityTypeDisplayName.toLowerCase()
                  : "page",
              }
            )}
          </Body>
          <Body variant="base" className="text-gray-500 font-normal">
            {pt(
              "emptyStateFieldEmpty",
              "{{entityType}}'s mapped field is empty",
              {
                entityType: entityTypeDisplayName
                  ? entityTypeDisplayName.charAt(0).toUpperCase() +
                    entityTypeDisplayName.slice(1)
                  : "Entity",
              }
            )}
          </Body>
        </div>
      </div>
    </PageSection>
  );
};
