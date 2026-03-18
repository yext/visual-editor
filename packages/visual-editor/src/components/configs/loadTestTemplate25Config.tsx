import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate25Category,
  SyntheticTemplate25Components,
  type SyntheticTemplate25Props,
} from "../syntheticLoadTest/SyntheticTemplate25Components.tsx";

export interface SyntheticTemplate25ConfigProps
  extends SyntheticTemplate25Props {}

const components: Config<SyntheticTemplate25ConfigProps>["components"] = {
  ...SyntheticTemplate25Components,
};

export const loadTestTemplate25Config: Config<SyntheticTemplate25ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 25",
        components: SyntheticTemplate25Category,
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
