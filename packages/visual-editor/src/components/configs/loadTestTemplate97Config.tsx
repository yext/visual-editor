import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate97Category,
  SyntheticTemplate97Components,
  type SyntheticTemplate97Props,
} from "../syntheticLoadTest/SyntheticTemplate97Components.tsx";

export interface SyntheticTemplate97ConfigProps
  extends SyntheticTemplate97Props {}

const components: Config<SyntheticTemplate97ConfigProps>["components"] = {
  ...SyntheticTemplate97Components,
};

export const loadTestTemplate97Config: Config<SyntheticTemplate97ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 97",
        components: SyntheticTemplate97Category,
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
