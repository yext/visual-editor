import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate31Category,
  SyntheticTemplate31Components,
  type SyntheticTemplate31Props,
} from "../syntheticLoadTest/SyntheticTemplate31Components.tsx";

export interface SyntheticTemplate31ConfigProps
  extends SyntheticTemplate31Props {}

const components: Config<SyntheticTemplate31ConfigProps>["components"] = {
  ...SyntheticTemplate31Components,
};

export const loadTestTemplate31Config: Config<SyntheticTemplate31ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 31",
        components: SyntheticTemplate31Category,
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
