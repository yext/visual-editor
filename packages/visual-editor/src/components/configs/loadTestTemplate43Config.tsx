import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate43Category,
  SyntheticTemplate43Components,
  type SyntheticTemplate43Props,
} from "../syntheticLoadTest/SyntheticTemplate43Components.tsx";

export interface SyntheticTemplate43ConfigProps
  extends SyntheticTemplate43Props {}

const components: Config<SyntheticTemplate43ConfigProps>["components"] = {
  ...SyntheticTemplate43Components,
};

export const loadTestTemplate43Config: Config<SyntheticTemplate43ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 43",
        components: SyntheticTemplate43Category,
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
