import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate89Category,
  SyntheticTemplate89Components,
  type SyntheticTemplate89Props,
} from "../syntheticLoadTest/SyntheticTemplate89Components.tsx";

export interface SyntheticTemplate89ConfigProps
  extends SyntheticTemplate89Props {}

const components: Config<SyntheticTemplate89ConfigProps>["components"] = {
  ...SyntheticTemplate89Components,
};

export const loadTestTemplate89Config: Config<SyntheticTemplate89ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 89",
        components: SyntheticTemplate89Category,
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
