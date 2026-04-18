import { UniversalResults } from "@yext/search-ui-react";
import GDAResponse from "./GDAResponse.tsx";
import { SearchCtaStyles } from "./defaultPropsAndTypes.ts";

interface UniversalResultsSectionProps {
  enableGDA: boolean;
  searchTerm?: string;
  gdaLoading: boolean;
  verticalConfigMap: any;
  ctaStyles?: SearchCtaStyles;
}

export const UniversalResultsSection = ({
  enableGDA,
  searchTerm,
  gdaLoading,
  verticalConfigMap,
  ctaStyles,
}: UniversalResultsSectionProps) => {
  return (
    <>
      {enableGDA && !!searchTerm && (
        <GDAResponse loading={gdaLoading} ctaStyles={ctaStyles} />
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
