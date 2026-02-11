import { SectionProps, DefaultRawDataType } from "@yext/search-ui-react";
import { VerticalLayout } from "./propsAndTypes.ts";

interface LayoutSectionProps extends SectionProps<DefaultRawDataType> {
  layoutType: VerticalLayout;
  resultsCount: number;
}

export const LayoutSection = ({
  layoutType,
  results,
  CardComponent,
  header,
  resultsCount = 4,
}: LayoutSectionProps) => {
  if (!CardComponent) return null;
  const layoutClasses =
    layoutType === "Grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "flex flex-col gap-4 w-full";
  console.log(resultsCount);

  // const filteredResults = results.slice(0, resultsCount);

  return (
    <div className="border flex flex-col gap-4">
      <h2 className="font-bold text-base md:text-lg py-4 pl-4 bg-black !text-white">
        {header?.props.label.toUpperCase()}
      </h2>

      <div className={`${layoutClasses} w-full`}>
        {results.map((result, index) => (
          <CardComponent key={index} result={result} />
        ))}
      </div>
    </div>
  );
};
