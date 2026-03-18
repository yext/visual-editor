import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate98Category,
  SyntheticTemplate98Components,
  type SyntheticTemplate98Props,
} from "../syntheticLoadTest/SyntheticTemplate98Components.tsx";

export interface SyntheticTemplate98ConfigProps
  extends SyntheticTemplate98Props {}

const components: Config<SyntheticTemplate98ConfigProps>["components"] = {
  ...SyntheticTemplate98Components,
};

export const loadTestTemplate98Config: Config<SyntheticTemplate98ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 98",
        components: SyntheticTemplate98Category,
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
