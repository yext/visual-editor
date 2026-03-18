import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate08Category,
  SyntheticTemplate08Components,
  type SyntheticTemplate08Props,
} from "../syntheticLoadTest/SyntheticTemplate08Components.tsx";

export interface SyntheticTemplate08ConfigProps
  extends SyntheticTemplate08Props {}

const components: Config<SyntheticTemplate08ConfigProps>["components"] = {
  ...SyntheticTemplate08Components,
};

export const loadTestTemplate08Config: Config<SyntheticTemplate08ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 08",
        components: SyntheticTemplate08Category,
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
