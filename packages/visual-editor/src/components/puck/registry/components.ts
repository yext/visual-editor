import { Registry } from "./schema.ts";

// type: registry:ui => appears in the `npx shadcn add` list
// type: registry:component => building blocks that shouldn't be used on their own

export const ui: Registry["items"] = [
  {
    name: "heading",
    type: "registry:component",
    files: [{ path: "atoms/heading.tsx", type: "registry:component" }],
  },
  {
    name: "body",
    type: "registry:component",
    files: [{ path: "atoms/body.tsx", type: "registry:component" }],
  },
  {
    name: "button",
    type: "registry:component",
    files: [{ path: "atoms/button.tsx", type: "registry:component" }],
  },
  {
    name: "cta",
    type: "registry:component",
    registryDependencies: ["button"],
    files: [{ path: "atoms/cta.tsx", type: "registry:component" }],
  },
  {
    name: "section",
    type: "registry:component",
    files: [{ path: "atoms/section.tsx", type: "registry:component" }],
  },
  {
    name: "mail_outline",
    type: "registry:component",
    files: [
      { path: "assets/mail_outline.svg", type: "registry:component" },
      { path: "assets/svg.d.ts", type: "registry:component" },
    ],
  },
  {
    name: "maybeLink",
    type: "registry:component",
    files: [{ path: "assets/maybeLink.tsx", type: "registry:component" }],
  },
  {
    name: "layout",
    type: "registry:component",
    files: [{ path: "Layout.tsx", type: "registry:component" }],
  },
  {
    name: "Address",
    type: "registry:ui",
    registryDependencies: ["section"],
    files: [{ path: "Address.tsx", type: "registry:ui" }],
  },
  {
    name: "Banner",
    type: "registry:ui",
    registryDependencies: ["body"],
    files: [{ path: "Banner.tsx", type: "registry:ui" }],
  },
  {
    name: "BodyText",
    type: "registry:ui",
    registryDependencies: ["body"],
    files: [{ path: "BodyText.tsx", type: "registry:ui" }],
  },
  {
    name: "Breadcrumbs",
    type: "registry:ui",
    registryDependencies: ["maybeLink"],
    files: [{ path: "Breadcrumbs.tsx", type: "registry:ui" }],
  },
  {
    name: "CtaWrapper",
    type: "registry:ui",
    registryDependencies: ["cta"],
    files: [{ path: "CtaWrapper.tsx", type: "registry:ui" }],
  },
  {
    name: "Directory",
    type: "registry:ui",
    registryDependencies: ["maybeLink, Breadcrumbs"],
    files: [{ path: "Directory.tsx", type: "registry:ui" }],
  },
  {
    name: "Emails",
    type: "registry:ui",
    registryDependencies: ["mail_outline"],
    files: [{ path: "Emails.tsx", type: "registry:ui" }],
  },
  {
    name: "Flex",
    type: "registry:ui",
    registryDependencies: ["layout"],
    files: [{ path: "Flex.tsx", type: "registry:ui" }],
  },
  {
    name: "Footer",
    type: "registry:ui",
    registryDependencies: ["body"],
    files: [{ path: "Footer.tsx", type: "registry:ui" }],
  },
  {
    name: "GetDirections",
    type: "registry:ui",
    registryDependencies: ["button"],
    files: [{ path: "GetDirections.tsx", type: "registry:ui" }],
  },
  {
    name: "Grid",
    type: "registry:ui",
    registryDependencies: ["section", "layout"],
    files: [{ path: "Grid.tsx", type: "registry:ui" }],
  },
  {
    name: "Header",
    type: "registry:ui",
    files: [{ path: "Header.tsx", type: "registry:ui" }],
  },
  {
    name: "HeadingText",
    type: "registry:ui",
    registryDependencies: ["heading"],
    files: [{ path: "HeadingText.tsx", type: "registry:ui" }],
  },
  {
    name: "HoursTable",
    type: "registry:ui",
    registryDependencies: ["section"],
    files: [{ path: "HoursTable.tsx", type: "registry:ui" }],
  },
  {
    name: "HoursStatus",
    type: "registry:ui",
    files: [{ path: "HoursStatus.tsx", type: "registry:ui" }],
  },
  {
    name: "Image",
    type: "registry:ui",
    files: [{ path: "Image.tsx", type: "registry:ui" }],
  },
  {
    name: "Phone",
    type: "registry:ui",
    files: [{ path: "Phone.tsx", type: "registry:ui" }],
  },
  {
    name: "TextList",
    type: "registry:ui",
    files: [{ path: "TextList.tsx", type: "registry:ui" }],
  },
  {
    name: "Promo",
    type: "registry:ui",
    files: [{ path: "Promo.tsx", type: "registry:ui" }],
    registryDependencies: ["section", "heading", "cta", "body", "Image"],
  },
  {
    name: "Card",
    type: "registry:ui",
    files: [{ path: "Card.tsx", type: "registry:ui" }],
    registryDependencies: ["section", "heading", "cta", "body", "Image"],
  },
];
