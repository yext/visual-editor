import { CircleSlash2 } from "lucide-react";
import { PageSection, Body, pt, BackgroundStyle } from "@yext/visual-editor";
import { useTemplateMetadata } from "../../../internal/hooks/useMessageReceivers";

export const PromoEmptyState: React.FC<{
  isEditing: boolean;
  backgroundStyle: BackgroundStyle | undefined;
}> = (props) => {
  const { isEditing, backgroundStyle } = props;

  if (!isEditing) {
    return <></>;
  }

  const templateMetadata = useTemplateMetadata();
  const entityTypeDisplayName = templateMetadata?.entityTypeDisplayName;

  return (
    <PageSection
      background={backgroundStyle}
      className="flex items-center justify-center"
    >
      <div className="relative h-[300px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5">
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
