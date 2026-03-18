import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate100Category,
  SyntheticTemplate100Components,
  type SyntheticTemplate100Props,
} from "../syntheticLoadTest/SyntheticTemplate100Components.tsx";

export interface SyntheticTemplate100ConfigProps
  extends SyntheticTemplate100Props {}

const components: Config<SyntheticTemplate100ConfigProps>["components"] = {
  ...SyntheticTemplate100Components,
};

export const loadTestTemplate100Config: Config<SyntheticTemplate100ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 100",
        components: SyntheticTemplate100Category,
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
