import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate85Category,
  SyntheticTemplate85Components,
  type SyntheticTemplate85Props,
} from "../syntheticLoadTest/SyntheticTemplate85Components.tsx";

export interface SyntheticTemplate85ConfigProps
  extends SyntheticTemplate85Props {}

const components: Config<SyntheticTemplate85ConfigProps>["components"] = {
  ...SyntheticTemplate85Components,
};

export const loadTestTemplate85Config: Config<SyntheticTemplate85ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 85",
        components: SyntheticTemplate85Category,
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
