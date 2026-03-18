import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate20Category,
  SyntheticTemplate20Components,
  type SyntheticTemplate20Props,
} from "../syntheticLoadTest/SyntheticTemplate20Components.tsx";

export interface SyntheticTemplate20ConfigProps
  extends SyntheticTemplate20Props {}

const components: Config<SyntheticTemplate20ConfigProps>["components"] = {
  ...SyntheticTemplate20Components,
};

export const loadTestTemplate20Config: Config<SyntheticTemplate20ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 20",
        components: SyntheticTemplate20Category,
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
