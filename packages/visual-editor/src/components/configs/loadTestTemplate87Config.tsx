import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate87Category,
  SyntheticTemplate87Components,
  type SyntheticTemplate87Props,
} from "../syntheticLoadTest/SyntheticTemplate87Components.tsx";

export interface SyntheticTemplate87ConfigProps
  extends SyntheticTemplate87Props {}

const components: Config<SyntheticTemplate87ConfigProps>["components"] = {
  ...SyntheticTemplate87Components,
};

export const loadTestTemplate87Config: Config<SyntheticTemplate87ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 87",
        components: SyntheticTemplate87Category,
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
