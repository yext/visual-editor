import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate72Category,
  SyntheticTemplate72Components,
  type SyntheticTemplate72Props,
} from "../syntheticLoadTest/SyntheticTemplate72Components.tsx";

export interface SyntheticTemplate72ConfigProps
  extends SyntheticTemplate72Props {}

const components: Config<SyntheticTemplate72ConfigProps>["components"] = {
  ...SyntheticTemplate72Components,
};

export const loadTestTemplate72Config: Config<SyntheticTemplate72ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 72",
        components: SyntheticTemplate72Category,
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
