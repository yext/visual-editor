import { GenerativeDirectAnswer } from "@yext/search-ui-react";
import SourceCard from "./SourceCard.tsx";
import { useTranslation } from "react-i18next";
import { SearchCtaStyles } from "./defaultPropsAndTypes.ts";

type GDAResponseProps = {
  loading?: boolean;
  ctaStyles?: SearchCtaStyles;
};

const GDAResponse = ({ loading = true, ctaStyles }: GDAResponseProps) => {
  const { t } = useTranslation();
  return (
    <>
      {loading && (
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm my-4 animate-pulse">
          <div className="text-xl">
            {t("generatingAIAnswer", "Generating AI Answer...")}
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-[95%]" />
            <div className="h-4 bg-gray-200 rounded w-[90%]" />
            <div className="h-4 bg-gray-200 rounded w-[85%]" />
          </div>

          <div className="border-b border-gray-200 w-full pb-6 mb-6 !py-5" />

          <div className="text-xl text-gray-300">{t("sources", "Sources")}</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-md" />
            ))}
          </div>
        </div>
      )}
      <GenerativeDirectAnswer
        CitationCard={(props) => (
          <SourceCard props={props} ctaStyles={ctaStyles} />
        )}
        customCssClasses={{
          container: "my-4",
          divider: "!py-5",
          citationsContainer: "grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4",
        }}
      />
    </>
  );
};

export default GDAResponse;
