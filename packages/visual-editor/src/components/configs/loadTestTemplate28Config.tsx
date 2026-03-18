import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate28Category,
  SyntheticTemplate28Components,
  type SyntheticTemplate28Props,
} from "../syntheticLoadTest/SyntheticTemplate28Components.tsx";

export interface SyntheticTemplate28ConfigProps
  extends SyntheticTemplate28Props {}

const components: Config<SyntheticTemplate28ConfigProps>["components"] = {
  ...SyntheticTemplate28Components,
};

export const loadTestTemplate28Config: Config<SyntheticTemplate28ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 28",
        components: SyntheticTemplate28Category,
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
