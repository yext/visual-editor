import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate105Category,
  SyntheticTemplate105Components,
  type SyntheticTemplate105Props,
} from "../syntheticLoadTest/SyntheticTemplate105Components.tsx";

export interface SyntheticTemplate105ConfigProps
  extends SyntheticTemplate105Props {}

const components: Config<SyntheticTemplate105ConfigProps>["components"] = {
  ...SyntheticTemplate105Components,
};

export const loadTestTemplate105Config: Config<SyntheticTemplate105ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 105",
        components: SyntheticTemplate105Category,
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
