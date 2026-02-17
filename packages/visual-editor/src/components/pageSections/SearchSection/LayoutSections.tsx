import { Coordinate, Map, MapboxMaps, Marker } from "@yext/pages-components";
import { DefaultRawDataType, SectionProps } from "@yext/search-ui-react";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
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

  const coordinates: Coordinate[] = results
    .map((result) => result.rawData?.yextDisplayCoordinate)
    .filter((coord): coord is Coordinate => Boolean(coord));

  const coordinateResults = results.filter(
    (r) => r.rawData?.yextDisplayCoordinate
  );
  const firstCoord: any =
    coordinateResults[0]?.rawData?.yextDisplayCoordinate ?? undefined;

  return (
    <div className="flex flex-col mt-12">
      <div className="px-5 py-2.5 flex items-end border rounded-t-md">
        <h2 className="text-[22px]">{header?.props.label}</h2>
      </div>
      {layoutType === "Map" && coordinateResults.length > 0 && firstCoord && (
        <div className="w-full h-[300px] border-x border-t">
          <Map
            apiKey={""}
            controls={false}
            provider={MapboxMaps}
            bounds={coordinates}
            iframeId="preview-frame"
            singleZoom={undefined}
            providerOptions={{
              maxZoom: 12,
            }}
            className="w-full h-[300px]"
          >
            {results.map((result, index) => {
              const coord: any = result.rawData?.yextDisplayCoordinate;
              if (!coord) return null;

              return (
                <Marker
                  key={result.id ?? index}
                  coordinate={coord}
                  id={index + ""}
                >
                  <MapPin size={24} fill="#ef4444" color="#ef4444" />
                </Marker>
              );
            })}
          </Map>
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
