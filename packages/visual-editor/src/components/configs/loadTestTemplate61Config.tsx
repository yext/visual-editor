import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate61Category,
  SyntheticTemplate61Components,
  type SyntheticTemplate61Props,
} from "../syntheticLoadTest/SyntheticTemplate61Components.tsx";

export interface SyntheticTemplate61ConfigProps
  extends SyntheticTemplate61Props {}

const components: Config<SyntheticTemplate61ConfigProps>["components"] = {
  ...SyntheticTemplate61Components,
};

export const loadTestTemplate61Config: Config<SyntheticTemplate61ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 61",
        components: SyntheticTemplate61Category,
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
