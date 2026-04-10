import { DefaultRawDataType, SectionProps } from "@yext/search-ui-react";
import { MapComponent } from "./MapComponent.tsx";
import {
  FLEX_LAYOUT_CLASSES,
  GRID_LAYOUT_CLASSES,
  VerticalLayout,
} from "./defaultPropsAndTypes.ts";

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
    layoutType === "Grid" ? GRID_LAYOUT_CLASSES : FLEX_LAYOUT_CLASSES;

  return (
    <div className="flex flex-col mt-12">
      <div className="px-5 py-2.5 flex items-end border-gray-300  border rounded-t-md">
        <h2 className="text-[22px]">{header?.props.label}</h2>
      </div>
      {layoutType === "Map" && (
        <div className="w-full h-[300px] border-gray-300 border-x border-t">
          <MapComponent isUniversal={true} results={results} />
        </div>
      )}

      <div
        className={`${layoutClasses} w-full border divide-gray-300 rounded-b-md divide-y`}
      >
        {results.map((result) => (
          <CardComponent key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
};
