import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate73Category,
  SyntheticTemplate73Components,
  type SyntheticTemplate73Props,
} from "../syntheticLoadTest/SyntheticTemplate73Components.tsx";

export interface SyntheticTemplate73ConfigProps
  extends SyntheticTemplate73Props {}

const components: Config<SyntheticTemplate73ConfigProps>["components"] = {
  ...SyntheticTemplate73Components,
};

export const loadTestTemplate73Config: Config<SyntheticTemplate73ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 73",
        components: SyntheticTemplate73Category,
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
