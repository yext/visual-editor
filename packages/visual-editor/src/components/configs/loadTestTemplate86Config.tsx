import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate86Category,
  SyntheticTemplate86Components,
  type SyntheticTemplate86Props,
} from "../syntheticLoadTest/SyntheticTemplate86Components.tsx";

export interface SyntheticTemplate86ConfigProps
  extends SyntheticTemplate86Props {}

const components: Config<SyntheticTemplate86ConfigProps>["components"] = {
  ...SyntheticTemplate86Components,
};

export const loadTestTemplate86Config: Config<SyntheticTemplate86ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 86",
        components: SyntheticTemplate86Category,
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
