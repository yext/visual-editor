import { DefaultRawDataType, SectionProps } from "@yext/search-ui-react";
import { MapComponent } from "./MapComponent.tsx";
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
  console.log(resultsCount);

  const layoutClasses =
    layoutType === "Grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "flex flex-col w-full";

  // const filteredResults = results.slice(0, resultsCount);

  return (
    <div className="flex flex-col mt-12">
      <div className="px-5 py-2.5 flex items-end border rounded-t-md">
        <h2 className="text-[22px]">{header?.props.label}</h2>
      </div>
      {layoutType === "Map" && (
        <div className="w-full h-[300px] border-x border-t">
          <MapComponent isUniversal={true} results={results} />
        </div>
      )}

      <div className={`${layoutClasses} w-full border rounded-b-md divide-y`}>
        {results.map((result, index) => (
          <CardComponent key={index} result={result} />
        ))}
      </div>
    </div>
  );
};
