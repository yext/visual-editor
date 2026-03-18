import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate91Category,
  SyntheticTemplate91Components,
  type SyntheticTemplate91Props,
} from "../syntheticLoadTest/SyntheticTemplate91Components.tsx";

export interface SyntheticTemplate91ConfigProps
  extends SyntheticTemplate91Props {}

const components: Config<SyntheticTemplate91ConfigProps>["components"] = {
  ...SyntheticTemplate91Components,
};

export const loadTestTemplate91Config: Config<SyntheticTemplate91ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 91",
        components: SyntheticTemplate91Category,
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
