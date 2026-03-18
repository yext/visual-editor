import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate118Category,
  SyntheticTemplate118Components,
  type SyntheticTemplate118Props,
} from "../syntheticLoadTest/SyntheticTemplate118Components.tsx";

export interface SyntheticTemplate118ConfigProps
  extends SyntheticTemplate118Props {}

const components: Config<SyntheticTemplate118ConfigProps>["components"] = {
  ...SyntheticTemplate118Components,
};

export const loadTestTemplate118Config: Config<SyntheticTemplate118ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 118",
        components: SyntheticTemplate118Category,
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
