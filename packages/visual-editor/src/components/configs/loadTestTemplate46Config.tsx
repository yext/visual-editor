import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate46Category,
  SyntheticTemplate46Components,
  type SyntheticTemplate46Props,
} from "../syntheticLoadTest/SyntheticTemplate46Components.tsx";

export interface SyntheticTemplate46ConfigProps
  extends SyntheticTemplate46Props {}

const components: Config<SyntheticTemplate46ConfigProps>["components"] = {
  ...SyntheticTemplate46Components,
};

export const loadTestTemplate46Config: Config<SyntheticTemplate46ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 46",
        components: SyntheticTemplate46Category,
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
