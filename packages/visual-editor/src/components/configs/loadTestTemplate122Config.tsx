import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate122Category,
  SyntheticTemplate122Components,
  type SyntheticTemplate122Props,
} from "../syntheticLoadTest/SyntheticTemplate122Components.tsx";

export interface SyntheticTemplate122ConfigProps
  extends SyntheticTemplate122Props {}

const components: Config<SyntheticTemplate122ConfigProps>["components"] = {
  ...SyntheticTemplate122Components,
};

export const loadTestTemplate122Config: Config<SyntheticTemplate122ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 122",
        components: SyntheticTemplate122Category,
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
