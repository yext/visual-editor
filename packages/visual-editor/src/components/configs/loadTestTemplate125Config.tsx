import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate125Category,
  SyntheticTemplate125Components,
  type SyntheticTemplate125Props,
} from "../syntheticLoadTest/SyntheticTemplate125Components.tsx";

export interface SyntheticTemplate125ConfigProps
  extends SyntheticTemplate125Props {}

const components: Config<SyntheticTemplate125ConfigProps>["components"] = {
  ...SyntheticTemplate125Components,
};

export const loadTestTemplate125Config: Config<SyntheticTemplate125ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 125",
        components: SyntheticTemplate125Category,
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
