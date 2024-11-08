import { Registry } from "./schema.ts";

// type: registry:ui => appears in the `npx shadcn add` list
// type: registry:component => building blocks that shouldn't be used on their own

export const ui: Registry = [
  {
    name: "heading",
    type: "registry:component",
    files: ["atoms/heading.tsx"],
  },
  {
    name: "HeadingText",
    type: "registry:ui",
    registryDependencies: ["heading"],
    files: ["HeadingText.tsx"],
  },
  {
    name: "body",
    type: "registry:component",
    files: ["atoms/body.tsx"],
  },
  {
    name: "BodyText",
    type: "registry:ui",
    registryDependencies: ["body"],
    files: ["BodyText.tsx"],
  },
];
