import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate101Category,
  SyntheticTemplate101Components,
  type SyntheticTemplate101Props,
} from "../syntheticLoadTest/SyntheticTemplate101Components.tsx";

export interface SyntheticTemplate101ConfigProps
  extends SyntheticTemplate101Props {}

const components: Config<SyntheticTemplate101ConfigProps>["components"] = {
  ...SyntheticTemplate101Components,
};

export const loadTestTemplate101Config: Config<SyntheticTemplate101ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 101",
        components: SyntheticTemplate101Category,
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
