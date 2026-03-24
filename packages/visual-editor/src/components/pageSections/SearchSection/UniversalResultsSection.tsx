import { UniversalResults } from "@yext/search-ui-react";
import GDAResponse from "./GDAResponse.tsx";

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
      {enableGDA && !!searchTerm && <GDAResponse loading={gdaLoading} />}

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
