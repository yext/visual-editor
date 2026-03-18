import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate59Category,
  SyntheticTemplate59Components,
  type SyntheticTemplate59Props,
} from "../syntheticLoadTest/SyntheticTemplate59Components.tsx";

export interface SyntheticTemplate59ConfigProps
  extends SyntheticTemplate59Props {}

const components: Config<SyntheticTemplate59ConfigProps>["components"] = {
  ...SyntheticTemplate59Components,
};

export const loadTestTemplate59Config: Config<SyntheticTemplate59ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 59",
        components: SyntheticTemplate59Category,
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
