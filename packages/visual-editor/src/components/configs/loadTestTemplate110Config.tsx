import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate110Category,
  SyntheticTemplate110Components,
  type SyntheticTemplate110Props,
} from "../syntheticLoadTest/SyntheticTemplate110Components.tsx";

export interface SyntheticTemplate110ConfigProps
  extends SyntheticTemplate110Props {}

const components: Config<SyntheticTemplate110ConfigProps>["components"] = {
  ...SyntheticTemplate110Components,
};

export const loadTestTemplate110Config: Config<SyntheticTemplate110ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 110",
        components: SyntheticTemplate110Category,
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
