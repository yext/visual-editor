import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate33Category,
  SyntheticTemplate33Components,
  type SyntheticTemplate33Props,
} from "../syntheticLoadTest/SyntheticTemplate33Components.tsx";

export interface SyntheticTemplate33ConfigProps
  extends SyntheticTemplate33Props {}

const components: Config<SyntheticTemplate33ConfigProps>["components"] = {
  ...SyntheticTemplate33Components,
};

export const loadTestTemplate33Config: Config<SyntheticTemplate33ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 33",
        components: SyntheticTemplate33Category,
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
