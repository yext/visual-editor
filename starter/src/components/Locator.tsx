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
import { useDocument } from "@yext/visual-editor";

type LocatorProps = {
  apiKey: string;
};

const fields: Fields<LocatorProps> = {
  apiKey: {
    label: "API Key",
    type: "text",
  },
};

const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields,
  defaultProps: {
    apiKey: "Fake Key",
  },
  label: "Locator",
  render: (props) => <Locator {...props} />,
};

const Locator: React.FC<LocatorProps> = ({ apiKey }) => {
  const document: {
    businessId: number;
  } = useDocument();
  const config = {
    apiKey,
    experienceKey: "jacob-test",
    locale: "en",
    experienceVersion: "STAGING",
    businessId: document.businessId,
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
