import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate62Category,
  SyntheticTemplate62Components,
  type SyntheticTemplate62Props,
} from "../syntheticLoadTest/SyntheticTemplate62Components.tsx";

export interface SyntheticTemplate62ConfigProps
  extends SyntheticTemplate62Props {}

const components: Config<SyntheticTemplate62ConfigProps>["components"] = {
  ...SyntheticTemplate62Components,
};

export const loadTestTemplate62Config: Config<SyntheticTemplate62ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 62",
        components: SyntheticTemplate62Category,
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
