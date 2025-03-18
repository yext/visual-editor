import { ComponentConfig, Fields } from "@measured/puck";
import { FilterSearch } from "@yext/search-ui-react";
import {
  CloudChoice,
  CloudRegion,
  Environment,
  provideHeadless,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";
import * as React from "react";

type LocatorProps = {
  text: string;
  apiKey: string;
};

const fields: Fields<LocatorProps> = {
  text: {
    label: "Text",
    type: "text",
  },
  apiKey: {
    label: "Api Key",
    type: "text",
  },
};

const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields,
  defaultProps: {
    text: "Some Placeholder",
    apiKey: "Fake Key",
  },
  label: "Locator",
  render: (props) => <Locator {...props} />,
};

const Locator: React.FC<LocatorProps> = (props) => {
  const config = {
    apiKey: props.apiKey,
    experienceKey: "jacob-test",
    locale: "en",
    experienceVersion: "STAGING",
    businessId: 70452,
    cloudRegion: CloudRegion.US,
    cloudChoice: CloudChoice.GLOBAL_MULTI,
    environment: Environment.PROD,
  };
  const searcher = provideHeadless(config);
  searcher.setVertical("locations");
  return (
    <SearchHeadlessProvider searcher={searcher}>
      <FilterSearch
        searchFields={[
          { fieldApiName: "builtin.location", entityType: "location" },
        ]}
      ></FilterSearch>
    </SearchHeadlessProvider>
  );
};

export { type LocatorProps, LocatorComponent as Locator };
