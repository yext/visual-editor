import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate74Category,
  SyntheticTemplate74Components,
  type SyntheticTemplate74Props,
} from "../syntheticLoadTest/SyntheticTemplate74Components.tsx";

export interface SyntheticTemplate74ConfigProps
  extends SyntheticTemplate74Props {}

const components: Config<SyntheticTemplate74ConfigProps>["components"] = {
  ...SyntheticTemplate74Components,
};

export const loadTestTemplate74Config: Config<SyntheticTemplate74ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 74",
        components: SyntheticTemplate74Category,
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
