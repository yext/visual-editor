import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate94Category,
  SyntheticTemplate94Components,
  type SyntheticTemplate94Props,
} from "../syntheticLoadTest/SyntheticTemplate94Components.tsx";

export interface SyntheticTemplate94ConfigProps
  extends SyntheticTemplate94Props {}

const components: Config<SyntheticTemplate94ConfigProps>["components"] = {
  ...SyntheticTemplate94Components,
};

export const loadTestTemplate94Config: Config<SyntheticTemplate94ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 94",
        components: SyntheticTemplate94Category,
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
