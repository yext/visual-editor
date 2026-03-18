import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate05Category,
  SyntheticTemplate05Components,
  type SyntheticTemplate05Props,
} from "../syntheticLoadTest/SyntheticTemplate05Components.tsx";

export interface SyntheticTemplate05ConfigProps
  extends SyntheticTemplate05Props {}

const components: Config<SyntheticTemplate05ConfigProps>["components"] = {
  ...SyntheticTemplate05Components,
};

export const loadTestTemplate05Config: Config<SyntheticTemplate05ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 05",
        components: SyntheticTemplate05Category,
      },
    },
    root: {
      render: () => (
        <DropZone
          zone="default-zone"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        />
      ),
    },
  };
