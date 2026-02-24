import {
  GenerativeDirectAnswer,
  UniversalResults,
} from "@yext/search-ui-react";
import SourceCard from "./SourceCard.tsx";

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
  return (
    <>
      {enableGDA && !!searchTerm && (
        <>
          {gdaLoading && (
            <section className="p-6 my-8 border border-gray-200 rounded-lg shadow-sm centered-container">
              Loading...
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
