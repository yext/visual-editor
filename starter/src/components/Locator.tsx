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

type LocatorProps = {
  fieldApiName: string;
  entityType: string;
};

const fields: Fields<LocatorProps> = {
  fieldApiName: {
    label: "Field Name",
    type: "text",
  },
  entityType: {
    label: "Entity Type",
    type: "text",
  },
};

const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields,
  defaultProps: {
    fieldApiName: "builtin.location",
    entityType: "location",
  },
  label: "Locator",
  render: (props) => <Locator {...props} />,
};

const Locator: React.FC<LocatorProps> = ({ fieldApiName, entityType }) => {
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
        searchFields={[{ fieldApiName: fieldApiName, entityType: entityType }]}
        onSelect={(params) => handleFilterSelect(params)}
      />
      <div>
        {resultCount > 0 && <VerticalResults CardComponent={StandardCard} />}
        {resultCount === 0 && !searchLoading && (
          <div className="flex items-center justify-center">
            <p className="pt-4 text-2xl">No results found for this area</p>
          </div>
        )}
      </div>
    </>
  );
};

export { type LocatorProps, LocatorComponent as Locator };
