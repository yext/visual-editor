import {
  GenerativeDirectAnswer,
  UniversalResults,
} from "@yext/search-ui-react";
import SourceCard from "./SourceCard.tsx";
import { useTranslation } from "react-i18next";

interface UniversalResultsSectionProps {
  enableGDA: boolean;
  searchTerm?: string;
  gdaLoading: boolean;
  verticalConfigMap: any;
}

export const UniversalResultsSection = ({
  enableGDA,
  searchTerm,
  gdaLoading,
  verticalConfigMap,
}: UniversalResultsSectionProps) => {
  const { t } = useTranslation();
  return (
    <>
      {enableGDA && !!searchTerm && (
        <>
          {gdaLoading && (
            <section className="p-6 my-8 border border-gray-200 rounded-lg shadow-sm centered-container">
              {t("loadingResults", "Loading Results...")}
            </section>
          )}

          <GenerativeDirectAnswer
            CitationCard={SourceCard}
            customCssClasses={{ container: "my-4", divider: "!py-5" }}
          />
        </>
      )}

      <UniversalResults
        verticalConfigMap={verticalConfigMap}
        customCssClasses={{
          sectionHeaderIconContainer: "hidden",
          sectionHeaderLabel: "!pl-0",
        }}
      />
    </>
  );
};
