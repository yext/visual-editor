import { ComponentConfig, Fields } from "@measured/puck";
import {
  CardComponent,
  CardProps,
  Coordinate,
  FilterSearch,
  OnSelectParams,
  VerticalResults,
} from "@yext/search-ui-react";
import {
  Matcher,
  SelectableStaticFilter,
  useSearchActions,
  useSearchState,
} from "@yext/search-headless-react";
import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { BasicSelector, Button, themeManagerCn } from "@yext/visual-editor";
import { normalizeSlug } from "@yext/visual-editor";
import { useEffect, useState } from "react";
import { HoursStatus, Link } from "@yext/pages-components";
import { Address, Hours } from "../types/autogen.ts";

const DEFAULT_FIELD = "builtin.location";
const DEFAULT_ENTITY_TYPE = "location";

const locatorVariants = cva("", {
  variants: {
    backgroundColor: {
      default: "bg-locator-backgroundColor",
      primary: "bg-palette-primary",
      secondary: "bg-palette-secondary",
      accent: "bg-palette-accent",
      text: "bg-palette-text",
      background: "bg-palette-background",
    },
  },
  defaultVariants: {
    backgroundColor: "default",
  },
});

type LocatorProps = VariantProps<typeof locatorVariants>;

const locatorFields: Fields<LocatorProps> = {
  backgroundColor: BasicSelector("Background Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
};

const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields: locatorFields,
  label: "Locator",
  render: (props) => <Locator {...props} />,
};

type SearchState = "not started" | "loading" | "complete";

const Locator: React.FC<LocatorProps> = (props) => {
  const { backgroundColor } = props;
  const resultCount = useSearchState(
    (state) => state.vertical.resultsCount || 0,
  );

  const searchActions = useSearchActions();
  const handleFilterSelect = (params: OnSelectParams) => {
    const locationFilter: SelectableStaticFilter = {
      displayName: params.newDisplayName,
      selected: true,
      filter: {
        kind: "fieldValue",
        fieldId: params.newFilter.fieldId,
        value: params.newFilter.value,
        matcher: Matcher.Near,
      },
    };
    searchActions.setStaticFilters([locationFilter]);
    searchActions.executeVerticalQuery();
    setSearchState("loading");
  };

  const searchLoading = useSearchState((state) => state.searchStatus.isLoading);
  const [searchState, setSearchState] = useState<SearchState>("not started");

  useEffect(() => {
    if (!searchLoading && searchState === "loading") {
      setSearchState("complete");
    }
  }, [searchLoading]);

  return (
    <>
      <FilterSearch
        searchFields={[
          { fieldApiName: DEFAULT_FIELD, entityType: DEFAULT_ENTITY_TYPE },
        ]}
        onSelect={(params) => handleFilterSelect(params)}
      />
      <div>
        {resultCount > 0 && <VerticalResults CardComponent={LocationCard} />}
        {resultCount === 0 && searchState === "complete" && (
          <div
            className={themeManagerCn(
              "flex items-center justify-center",
              locatorVariants({ backgroundColor }),
            )}
          >
            <p className="pt-4 text-2xl">No results found for this area</p>
          </div>
        )}
      </div>
    </>
  );
};

const LocationCard: CardComponent<Location> = ({
  result,
}: CardProps<Location>): React.JSX.Element => {
  const location = result.rawData;
  const distance = result.distance;

  // function that takes coordinates and returns a google maps link for directions
  const getGoogleMapsLink = (coordinate: Coordinate): string => {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
  };

  const distanceInMiles = distance
    ? (distance / 1609.344).toFixed(1)
    : undefined;

  return (
    <div className="flex justify left border-y p-50">
      <div className="flex p-2.5">
        <div>
          <p className="text-lg py-2 text-rose-500">{location.name}</p>
          <p className="text-sm">{location.address.line1}</p>
          <p className="text-sm">{`${location.address.city}, ${location.address.region} ${location.address.postalCode}`}</p>
          {location.mainPhone && (
            <Link
              target={"_blank"}
              href={`tel:${location.mainPhone}`}
              className="text-sm py-5"
              rel="noreferrer"
            >
              {formatPhoneNumber(location.mainPhone)}
            </Link>
          )}
          {location.hours && (
            <HoursStatus
              hours={location.hours}
              timezone={location.timezone}
              className="text-sm"
            />
          )}
          <div>
            <Link
              target={"_blank"}
              href={getPath(location)}
              className="text-sm py-1000 text-blue-700 cursor-pointer"
              rel="noreferrer"
            >
              <input type="submit" value="View More Information" />
            </Link>
          </div>
          <div>
            {location.yextDisplayCoordinate && (
              <Button
                onClick={() =>
                  window.open(
                    getGoogleMapsLink(
                      location.yextDisplayCoordinate
                        ? location.yextDisplayCoordinate
                        : {
                            latitude: 0,
                            longitude: 0,
                          },
                    ),
                    "_blank",
                  )
                }
                className="flex flex-col text-sm py-3 bg-rose-500 text-stone-50 rounded-lg drop-shadow-md"
              >
                Get Directions
              </Button>
            )}
          </div>
        </div>
      </div>
      {distanceInMiles && (
        <div className="flex items-start p-5 italic">
          {distanceInMiles + " mi"}
        </div>
      )}
    </div>
  );
};

//reformats a phone number in the familiar (123)-456-7890 style
function formatPhoneNumber(phoneNumber: string) {
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const intlCode = match[1] ? "+1 " : "";
    return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
  }
  return null;
}

const getPath = (location: Location) => {
  if (location.slug) {
    return location.slug;
  }

  // TODO: in the same way that locale is hardcoded to 'en' in dev.tsx we may need to eventually have the
  // right language populated here.
  const path = location.address
    ? `${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${location.id}`;

  return normalizeSlug(path);
};

interface Location {
  address: Address;
  hours?: Hours;
  id: string;
  mainPhone?: string;
  name: string;
  neighborhood?: string;
  slug?: string;
  timezone: string;
  yextDisplayCoordinate?: Coordinate;
}

export { type LocatorProps, LocatorComponent as Locator };
