import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate21Category,
  SyntheticTemplate21Components,
  type SyntheticTemplate21Props,
} from "../syntheticLoadTest/SyntheticTemplate21Components.tsx";

export interface SyntheticTemplate21ConfigProps
  extends SyntheticTemplate21Props {}

const components: Config<SyntheticTemplate21ConfigProps>["components"] = {
  ...SyntheticTemplate21Components,
};

export const loadTestTemplate21Config: Config<SyntheticTemplate21ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 21",
        components: SyntheticTemplate21Category,
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
