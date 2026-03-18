import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate123Category,
  SyntheticTemplate123Components,
  type SyntheticTemplate123Props,
} from "../syntheticLoadTest/SyntheticTemplate123Components.tsx";

export interface SyntheticTemplate123ConfigProps
  extends SyntheticTemplate123Props {}

const components: Config<SyntheticTemplate123ConfigProps>["components"] = {
  ...SyntheticTemplate123Components,
};

export const loadTestTemplate123Config: Config<SyntheticTemplate123ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 123",
        components: SyntheticTemplate123Category,
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
