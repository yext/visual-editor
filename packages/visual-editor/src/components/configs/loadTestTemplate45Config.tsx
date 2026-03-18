import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate45Category,
  SyntheticTemplate45Components,
  type SyntheticTemplate45Props,
} from "../syntheticLoadTest/SyntheticTemplate45Components.tsx";

export interface SyntheticTemplate45ConfigProps
  extends SyntheticTemplate45Props {}

const components: Config<SyntheticTemplate45ConfigProps>["components"] = {
  ...SyntheticTemplate45Components,
};

export const loadTestTemplate45Config: Config<SyntheticTemplate45ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 45",
        components: SyntheticTemplate45Category,
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
