import { Registry } from "./schema.ts";

export const components: Registry = [
  {
    name: "heading",
    type: "registry:component",
    files: ["atoms/heading.tsx"],
  },
  {
    name: "HeadingText",
    type: "registry:component",
    registryDependencies: ["heading"],
    files: ["HeadingText.tsx"],
  },
];
