import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate63Category,
  SyntheticTemplate63Components,
  type SyntheticTemplate63Props,
} from "../syntheticLoadTest/SyntheticTemplate63Components.tsx";

export interface SyntheticTemplate63ConfigProps
  extends SyntheticTemplate63Props {}

const components: Config<SyntheticTemplate63ConfigProps>["components"] = {
  ...SyntheticTemplate63Components,
};

export const loadTestTemplate63Config: Config<SyntheticTemplate63ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 63",
        components: SyntheticTemplate63Category,
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
