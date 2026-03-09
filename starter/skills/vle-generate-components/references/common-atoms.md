# Common Atoms and Hooks

Quick reference for LLM generation when building VLE components that use document-backed core atoms.

## `useDocument` from `@yext/visual-editor`

Use this hook inside components to read the current stream entity document, which contains data about the location
This is the single source of truth for `hours`, `address`, and `mainPhone` data.

```tsx
import { useDocument } from "@yext/visual-editor";

export function ExampleDocumentRead() {
  const streamDocument = useDocument();

  return <div>{streamDocument.name}</div>;
}
```

## `<HoursTable />` from `@yext/pages-components`

Use `streamDocument.hours` directly for schedule tables.
Only specify the startOfWeek (string) and collapseDays (bool) props.

```tsx
import { useDocument } from "@yext/visual-editor";
import { HoursTable } from "@yext/pages-components";

export const ExampleHoursTable = () => {
  const streamDocument = useDocument();

  if (!streamDocument.hours) {
    return null;
  }

  return (
    <HoursTable
      hours={streamDocument.hours}
      startOfWeek="today"
      collapseDays={false}
    />
  );
};
```

## `<Address />` from `@yext/pages-components`

Use this for formatted address rendering instead of manual line concatenation. Bind it directly to `streamDocument.address`.

```tsx
import { useDocument } from "@yext/visual-editor";
import { Address } from "@yext/pages-components";

export const ExampleAddress = () => {
  const streamDocument = useDocument();

  if (!streamDocument.address) {
    return null;
  }

  return <Address address={streamDocument.address} />;
};
```

## `<HoursStatus />` from `@yext/pages-components`

Use for compact open/closed state and next transition messaging. Drive it directly from `streamDocument.hours`; pass timezone when available for correct status calculation.

```tsx
import { useDocument } from "@yext/visual-editor";
import { HoursStatus } from "@yext/pages-components";

export const ExampleHoursStatus = () => {
  const streamDocument = useDocument();

  if (!streamDocument.hours) {
    return null;
  }

  return (
    <HoursStatus
      hours={streamDocument.hours}
      timezone={streamDocument.timezone}
    />
  );
};
```

## `<Link />` from `@yext/pages-components`

Use `Link` (not raw `<a>`) for typed CTA links. Common pattern is `cta={{ link, linkType }}` plus optional analytics/event props.

```tsx
import { useDocument } from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

export const ExampleLink = () => {
  const streamDocument = useDocument();

  if (!streamDocument.websiteUrl) {
    return null;
  }

  return (
    <Link
      cta={{ link: streamDocument.websiteUrl, linkType: "URL" }}
      eventName="websiteCTA"
      target="_blank"
      rel="noopener noreferrer"
    >
      Visit Website
    </Link>
  );
};
```

## `ArrayField` from `@puckeditor/core`

Use an `ArrayField` when a component has repeated editor-managed items like nav links, FAQs, cards, or social links.

```ts
{
  type: "array",
  arrayFields: {
    label: { type: "text" },
    link: { type: "text" },
  },
  defaultItemProps: {
    label: "Link",
    link: "#",
  },
  getItemSummary: (item) => item.label,
}
```

Notes for generation:

- `arrayFields` defines the fields available on each item in the array.
- `defaultItemProps` is required so newly added rows in the editor start with valid values.
- `getItemSummary` should return a short label so the editor can show a readable item name.
- In component `defaultProps`, initialize the array itself with the right number of items based on the captured HTML
