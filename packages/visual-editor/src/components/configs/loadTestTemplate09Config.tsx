import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate09Category,
  SyntheticTemplate09Components,
  type SyntheticTemplate09Props,
} from "../syntheticLoadTest/SyntheticTemplate09Components.tsx";

export interface SyntheticTemplate09ConfigProps
  extends SyntheticTemplate09Props {}

const components: Config<SyntheticTemplate09ConfigProps>["components"] = {
  ...SyntheticTemplate09Components,
};

export const loadTestTemplate09Config: Config<SyntheticTemplate09ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 09",
        components: SyntheticTemplate09Category,
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
