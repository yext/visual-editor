import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate51Category,
  SyntheticTemplate51Components,
  type SyntheticTemplate51Props,
} from "../syntheticLoadTest/SyntheticTemplate51Components.tsx";

export interface SyntheticTemplate51ConfigProps
  extends SyntheticTemplate51Props {}

const components: Config<SyntheticTemplate51ConfigProps>["components"] = {
  ...SyntheticTemplate51Components,
};

export const loadTestTemplate51Config: Config<SyntheticTemplate51ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 51",
        components: SyntheticTemplate51Category,
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
