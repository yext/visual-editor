import React from "react";
import { DefaultRawDataType, SectionProps } from "@yext/search-ui-react";

export const GridSection = ({
  results,
  CardComponent,
}: SectionProps<DefaultRawDataType>) => {
  if (!results || !results.length || !CardComponent) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.map((result, index) => (
        <CardComponent key={index} result={result} />
      ))}
    </div>
  );
};
