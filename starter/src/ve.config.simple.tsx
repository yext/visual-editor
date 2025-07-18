// Simplified version for StackBlitz compatibility
import { DropZone, type Config } from "@measured/puck";
import "@yext/visual-editor/style.css";

// Simplified interface
interface SimpleProps {
  [key: string]: any;
}

// Minimal components object
const components: Config<SimpleProps>["components"] = {};

// Simplified config
export const mainConfig: Config<SimpleProps> = {
  components,
  categories: {
    pageSections: {
      title: "Page Sections",
      components: [],
    },
    directory: {
      title: "Directory",
      components: [],
    },
  },
  root: {
    render: () => {
      return (
        <DropZone
          zone="default-zone"
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        />
      );
    },
  },
};

export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);
