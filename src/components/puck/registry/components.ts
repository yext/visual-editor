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
    name: "body",
    type: "registry:component",
    files: ["atoms/body.tsx"],
  },
  {
    name: "button",
    type: "registry:component",
    files: ["atoms/button.tsx"],
  },
  {
    name: "cta",
    type: "registry:component",
    registryDependencies: ["button"],
    files: ["atoms/cta.tsx"],
  },
  {
    name: "section",
    type: "registry:component",
    files: ["atoms/section.tsx"],
  },
  {
    name: "mail_outline",
    type: "registry:component",
    files: ["assets/mail_outline.svg", "assets/svg.d.ts"],
  },
  {
    name: "Address",
    type: "registry:ui",
    registryDependencies: ["section"],
    files: ["Address.tsx"],
  },
  {
    name: "BodyText",
    type: "registry:ui",
    registryDependencies: ["body"],
    files: ["BodyText.tsx"],
  },
  {
    name: "CtaWrapper",
    type: "registry:ui",
    registryDependencies: ["cta"],
    files: ["CtaWrapper.tsx"],
  },
  {
    name: "Emails",
    type: "registry:ui",
    registryDependencies: ["mail_outline"],
    files: ["Emails.tsx"],
  },
  {
    name: "FlexContainer",
    type: "registry:ui",
    files: ["FlexContainer.tsx"],
  },
  {
    name: "Footer",
    type: "registry:ui",
    registryDependencies: ["body"],
    files: ["Footer.tsx"],
  },
  {
    name: "GetDirections",
    type: "registry:ui",
    registryDependencies: ["button", "section"],
    files: ["GetDirections.tsx"],
  },
  {
    name: "GridSection",
    type: "registry:ui",
    registryDependencies: ["section"],
    files: ["GridSection.tsx"],
  },
  {
    name: "Header",
    type: "registry:ui",
    files: ["Header.tsx"],
  },
  {
    name: "HeadingText",
    type: "registry:ui",
    registryDependencies: ["heading"],
    files: ["HeadingText.tsx"],
  },
  {
    name: "HoursTable",
    type: "registry:ui",
    registryDependencies: ["section"],
    files: ["HoursTable.tsx"],
  },
  {
    name: "HoursStatus",
    type: "registry:ui",
    files: ["HoursStatus.tsx"],
  },
  {
    name: "Image",
    type: "registry:ui",
    files: ["Image.tsx"],
  },
  {
    name: "Phone",
    type: "registry:ui",
    files: ["Phone.tsx"],
  },
  {
    name: "TextList",
    type: "registry:ui",
    files: ["TextList.tsx"],
  },
  {
    name: "Promo",
    type: "registry:ui",
    files: ["Promo.tsx"],
    registryDependencies: ["section", "heading", "cta", "body", "Image"],
  },
  {
    name: "Card",
    type: "registry:ui",
    files: ["Card.tsx"],
    registryDependencies: ["section", "heading", "cta", "body", "Image"],
  },
];
