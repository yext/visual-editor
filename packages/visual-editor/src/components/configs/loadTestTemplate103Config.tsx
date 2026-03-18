import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate103Category,
  SyntheticTemplate103Components,
  type SyntheticTemplate103Props,
} from "../syntheticLoadTest/SyntheticTemplate103Components.tsx";

export interface SyntheticTemplate103ConfigProps
  extends SyntheticTemplate103Props {}

const components: Config<SyntheticTemplate103ConfigProps>["components"] = {
  ...SyntheticTemplate103Components,
};

export const loadTestTemplate103Config: Config<SyntheticTemplate103ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 103",
        components: SyntheticTemplate103Category,
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
