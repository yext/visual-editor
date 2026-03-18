import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate07Category,
  SyntheticTemplate07Components,
  type SyntheticTemplate07Props,
} from "../syntheticLoadTest/SyntheticTemplate07Components.tsx";

export interface SyntheticTemplate07ConfigProps
  extends SyntheticTemplate07Props {}

const components: Config<SyntheticTemplate07ConfigProps>["components"] = {
  ...SyntheticTemplate07Components,
};

export const loadTestTemplate07Config: Config<SyntheticTemplate07ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 07",
        components: SyntheticTemplate07Category,
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
