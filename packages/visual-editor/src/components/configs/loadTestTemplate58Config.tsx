import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate58Category,
  SyntheticTemplate58Components,
  type SyntheticTemplate58Props,
} from "../syntheticLoadTest/SyntheticTemplate58Components.tsx";

export interface SyntheticTemplate58ConfigProps
  extends SyntheticTemplate58Props {}

const components: Config<SyntheticTemplate58ConfigProps>["components"] = {
  ...SyntheticTemplate58Components,
};

export const loadTestTemplate58Config: Config<SyntheticTemplate58ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 58",
        components: SyntheticTemplate58Category,
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
