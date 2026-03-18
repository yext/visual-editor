import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate15Category,
  SyntheticTemplate15Components,
  type SyntheticTemplate15Props,
} from "../syntheticLoadTest/SyntheticTemplate15Components.tsx";

export interface SyntheticTemplate15ConfigProps
  extends SyntheticTemplate15Props {}

const components: Config<SyntheticTemplate15ConfigProps>["components"] = {
  ...SyntheticTemplate15Components,
};

export const loadTestTemplate15Config: Config<SyntheticTemplate15ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 15",
        components: SyntheticTemplate15Category,
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
