import { VerticalResults, StandardCard, Facets } from "@yext/search-ui-react";
import Cards from "./Cards.tsx";
import { MapComponent } from "./MapComponent.tsx";
import { VerticalConfigProps } from "./propsAndTypes.ts";

interface VerticalResultsSectionProps {
  verticalKey: string;
  verticals: VerticalConfigProps[];
  currentVerticalConfig?: VerticalConfigProps;
  puck: any;
  facetsLength: any;
}

export const VerticalResultsSection = ({
  verticalKey,
  verticals,
  currentVerticalConfig,
  puck,
  facetsLength,
}: VerticalResultsSectionProps) => {
  if (currentVerticalConfig?.layout === "Map") {
    return (
      <div className="flex gap-6 px-12">
        <div className="flex-1">
          <VerticalResults CardComponent={StandardCard} />
        </div>

        <div className="w-1/2 !h-[800px]">
          <MapComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex flex-grow pt-8">
      <div
        className={`w-[200px] mr-6 ${
          !puck.isEditing ? "-ml-[224px]" : ""
        } ${facetsLength ? "" : "none"}`}
      >
        <Facets
          customCssClasses={{ facetsContainer: "!text-lg w-[200px]" }}
          searchOnChange
        />
      </div>

      <div className="flex-grow">
        <VerticalResults
          customCssClasses={{
            verticalResultsContainer:
              "flex flex-col border rounded-md divide-y",
          }}
          CardComponent={(props) => (
            <Cards
              {...props}
              cardType={
                verticals.find((v) => v.verticalKey === verticalKey)?.cardType
              }
            />
          )}
        />
      </div>
    </div>
  );
};
