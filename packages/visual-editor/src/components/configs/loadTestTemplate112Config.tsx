import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate112Category,
  SyntheticTemplate112Components,
  type SyntheticTemplate112Props,
} from "../syntheticLoadTest/SyntheticTemplate112Components.tsx";

export interface SyntheticTemplate112ConfigProps
  extends SyntheticTemplate112Props {}

const components: Config<SyntheticTemplate112ConfigProps>["components"] = {
  ...SyntheticTemplate112Components,
};

export const loadTestTemplate112Config: Config<SyntheticTemplate112ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 112",
        components: SyntheticTemplate112Category,
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
