import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate127Category,
  SyntheticTemplate127Components,
  type SyntheticTemplate127Props,
} from "../syntheticLoadTest/SyntheticTemplate127Components.tsx";

export interface SyntheticTemplate127ConfigProps
  extends SyntheticTemplate127Props {}

const components: Config<SyntheticTemplate127ConfigProps>["components"] = {
  ...SyntheticTemplate127Components,
};

export const loadTestTemplate127Config: Config<SyntheticTemplate127ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 127",
        components: SyntheticTemplate127Category,
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
