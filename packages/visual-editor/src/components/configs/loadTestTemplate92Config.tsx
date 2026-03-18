import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate92Category,
  SyntheticTemplate92Components,
  type SyntheticTemplate92Props,
} from "../syntheticLoadTest/SyntheticTemplate92Components.tsx";

export interface SyntheticTemplate92ConfigProps
  extends SyntheticTemplate92Props {}

const components: Config<SyntheticTemplate92ConfigProps>["components"] = {
  ...SyntheticTemplate92Components,
};

export const loadTestTemplate92Config: Config<SyntheticTemplate92ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 92",
        components: SyntheticTemplate92Category,
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
