import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate66Category,
  SyntheticTemplate66Components,
  type SyntheticTemplate66Props,
} from "../syntheticLoadTest/SyntheticTemplate66Components.tsx";

export interface SyntheticTemplate66ConfigProps
  extends SyntheticTemplate66Props {}

const components: Config<SyntheticTemplate66ConfigProps>["components"] = {
  ...SyntheticTemplate66Components,
};

export const loadTestTemplate66Config: Config<SyntheticTemplate66ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 66",
        components: SyntheticTemplate66Category,
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
