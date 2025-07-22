// Simplified version for StackBlitz compatibility - reduces memory usage
import { DropZone, type Config } from "@measured/puck";
import "@yext/visual-editor/style.css";

// Minimal interface
interface SimpleProps {
  [key: string]: any;
}

// Minimal components object - reduces memory usage
const components: Config<SimpleProps>["components"] = {};

// Simplified config for StackBlitz
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
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            padding: "20px",
            backgroundColor: "#f5f5f5",
          }}
        />
      );
    },
  },
};

// Simplified registry
export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);
