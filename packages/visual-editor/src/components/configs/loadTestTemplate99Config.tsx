import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate99Category,
  SyntheticTemplate99Components,
  type SyntheticTemplate99Props,
} from "../syntheticLoadTest/SyntheticTemplate99Components.tsx";

export interface SyntheticTemplate99ConfigProps
  extends SyntheticTemplate99Props {}

const components: Config<SyntheticTemplate99ConfigProps>["components"] = {
  ...SyntheticTemplate99Components,
};

export const loadTestTemplate99Config: Config<SyntheticTemplate99ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 99",
        components: SyntheticTemplate99Category,
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
