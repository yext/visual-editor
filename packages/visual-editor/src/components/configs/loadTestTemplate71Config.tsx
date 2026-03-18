import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate71Category,
  SyntheticTemplate71Components,
  type SyntheticTemplate71Props,
} from "../syntheticLoadTest/SyntheticTemplate71Components.tsx";

export interface SyntheticTemplate71ConfigProps
  extends SyntheticTemplate71Props {}

const components: Config<SyntheticTemplate71ConfigProps>["components"] = {
  ...SyntheticTemplate71Components,
};

export const loadTestTemplate71Config: Config<SyntheticTemplate71ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 71",
        components: SyntheticTemplate71Category,
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
