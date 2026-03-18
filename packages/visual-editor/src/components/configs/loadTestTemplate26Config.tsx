import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate26Category,
  SyntheticTemplate26Components,
  type SyntheticTemplate26Props,
} from "../syntheticLoadTest/SyntheticTemplate26Components.tsx";

export interface SyntheticTemplate26ConfigProps
  extends SyntheticTemplate26Props {}

const components: Config<SyntheticTemplate26ConfigProps>["components"] = {
  ...SyntheticTemplate26Components,
};

export const loadTestTemplate26Config: Config<SyntheticTemplate26ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 26",
        components: SyntheticTemplate26Category,
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
