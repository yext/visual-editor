import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate12Category,
  SyntheticTemplate12Components,
  type SyntheticTemplate12Props,
} from "../syntheticLoadTest/SyntheticTemplate12Components.tsx";

export interface SyntheticTemplate12ConfigProps
  extends SyntheticTemplate12Props {}

const components: Config<SyntheticTemplate12ConfigProps>["components"] = {
  ...SyntheticTemplate12Components,
};

export const loadTestTemplate12Config: Config<SyntheticTemplate12ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 12",
        components: SyntheticTemplate12Category,
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
