import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate111Category,
  SyntheticTemplate111Components,
  type SyntheticTemplate111Props,
} from "../syntheticLoadTest/SyntheticTemplate111Components.tsx";

export interface SyntheticTemplate111ConfigProps
  extends SyntheticTemplate111Props {}

const components: Config<SyntheticTemplate111ConfigProps>["components"] = {
  ...SyntheticTemplate111Components,
};

export const loadTestTemplate111Config: Config<SyntheticTemplate111ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 111",
        components: SyntheticTemplate111Category,
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
