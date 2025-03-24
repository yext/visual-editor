import { ComponentConfig, Fields } from "@measured/puck";
import {
  FilterSearch,
  OnSelectParams,
  StandardCard,
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
import { BasicSelector, themeManagerCn } from "@yext/visual-editor";

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
        matcher: Matcher.Equals,
      },
    };
    searchActions.setStaticFilters([locationFilter]);
    searchActions.executeVerticalQuery();
  };

  const searchLoading = useSearchState((state) => state.searchStatus.isLoading);

  return (
    <>
      <FilterSearch
        searchFields={[
          { fieldApiName: DEFAULT_FIELD, entityType: DEFAULT_ENTITY_TYPE },
        ]}
        onSelect={(params) => handleFilterSelect(params)}
      />
      <div>
        {resultCount > 0 && <VerticalResults CardComponent={StandardCard} />}
        {resultCount === 0 && !searchLoading && (
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

export { type LocatorProps, LocatorComponent as Locator };
