# Common Atoms and Hooks

Quick reference for LLM generation when building VLE components that use document-backed core atoms.

## `useDocument` from `@yext/visual-editor`

Use this hook inside components to read the current stream entity document, which contains data about the location
This is the single source of truth for `address` and `mainPhone` data. Hours should be resolved from a `YextEntityField<HoursType>` prop against the current stream document.

```tsx
import { useDocument } from "@yext/visual-editor";

export function ExampleDocumentRead() {
  const streamDocument = useDocument();

  return <div>{streamDocument.name}</div>;
}
```

## `<HoursTable />` from `@yext/pages-components`

Use a `YextEntityField<HoursType>` prop resolved against the stream document when the source is fundamentally a normal day-and-interval table.
Prefer `HoursTable` when you can match the source with stock props and section-local CSS instead of rewriting the entire hours block.
The main override surface is `dayOfWeekNames`, `startOfWeek`, `collapseDays`, `intervalStringsBuilderFn`, and `className`.
`HoursTable` does not need to be replaced just to fix copy, spacing, bolding, borders, row width, or "today" styling.
If stock table CSS causes width or spacing issues, keep `HoursTable` and fix the layout with section-local wrapper classes such as grid/flex row sizing, `min-w-0`, and `is-today` styling.
When `HoursTable` is used in narrow or multi-column layouts, always inspect spacing. The stock CSS gives rows a fixed width and bolds `.is-today`, which can cause overlap and visual mismatches. Before switching to custom hours markup, add section-local `className` overrides for row width, row layout, `min-w-0`, interval alignment, and `.is-today`.
`HoursTable` has stock layout CSS that is hostile to constrained or multi-column layouts. In the library stylesheet, `.HoursTable-row` is a flex row with a fixed width and `.is-today` is bold by default. In side-by-side tables or narrow containers this often causes overlap, bad spacing, or unwanted emphasis. Do not treat these as reasons to abandon `HoursTable`. First fix them with section-local `className` overrides.
Before going custom for a stock-style day-and-interval table, try these fixes in order:

- force each `HoursTable` column wrapper to `min-w-0`
- override `.HoursTable-row` to `width: 100%`
- prefer an explicit two-column row layout in tight spaces such as `grid-cols-[dayWidth_minmax(0,1fr)]`
- set `min-w-0` on `.HoursTable-row` and `.HoursTable-intervals`
- right-align `.HoursTable-intervals` when the source does
- use `whitespace-nowrap` on `.HoursTable-interval` when the source keeps intervals on one line
- override `.is-today` when the source does not bold the current day

```tsx
import {
  resolveComponentData,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { HoursTable, HoursType } from "@yext/pages-components";

type ExampleHoursTableProps = {
  data: {
    hours: YextEntityField<HoursType>;
  };
};

export const ExampleHoursTableFields = {
  data: {
    label: "Data",
    type: "object",
    objectFields: {
      hours: YextEntityFieldSelector<any, HoursType>({
        label: "Hours",
        filter: {
          types: ["type.hours"],
        },
      }),
    },
  },
};

export const ExampleHoursTable = ({ data }: ExampleHoursTableProps) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const hours = resolveComponentData(data.hours, locale, streamDocument);

  if (!hours) {
    return null;
  }

  return (
    <HoursTable
      hours={hours}
      dayOfWeekNames={{
        monday: "Mon:",
        tuesday: "Tue:",
        wednesday: "Wed:",
        thursday: "Thu:",
        friday: "Fri:",
        saturday: "Sat:",
        sunday: "Sun:",
      }}
      startOfWeek="monday"
      collapseDays={false}
      intervalStringsBuilderFn={(day, timeOptions) =>
        day.intervals.length === 0
          ? ["Closed"]
          : day.intervals.map(
              (interval) =>
                `${interval.getStartTime("en", timeOptions)} - ${interval.getEndTime("en", timeOptions)}`,
            )
      }
      timeOptions={{ hour12: true }}
      className="hours-table w-full min-w-0 text-sm [&_.HoursTable-row]:grid [&_.HoursTable-row]:w-full [&_.HoursTable-row]:min-w-0 [&_.HoursTable-row]:grid-cols-[52px_minmax(0,1fr)] [&_.HoursTable-row]:gap-x-4 [&_.HoursTable-day]:font-semibold [&_.HoursTable-intervals]:min-w-0 [&_.HoursTable-intervals]:text-right [&_.HoursTable-interval]:whitespace-nowrap"
    />
  );
};

export const ExampleHoursTableDefaultProps = {
  data: {
    hours: {
      field: "hours",
      constantValue: {},
    },
  },
};
```

## `<HoursStatus />` from `@yext/pages-components`

Use for compact open/closed state and next transition messaging when the source design includes a live status line.
Drive it from a resolved `YextEntityField<HoursType>` value; prefer passing `streamDocument.timezone` so status is calculated in the business timezone.
Prefer the stock template override props when the source needs different wording or markup but still follows the same status pattern.
The supported override hooks are `currentTemplate`, `separatorTemplate`, `futureTemplate`, `timeTemplate`, `dayOfWeekTemplate`, and `statusTemplate`.
Use these to change copy, separators, bolding, inline markup, and day/time formatting before considering custom status logic.
Stock `HoursStatus` can be rendered directly. Only add a two-pass/client-only pattern if you introduce custom render-time time logic such as `DateTime.now()`. Do not guess the business timezone from the renderer environment.

```tsx
import {
  resolveComponentData,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { HoursStatus, HoursType } from "@yext/pages-components";

type ExampleHoursStatusProps = {
  data: {
    hours: YextEntityField<HoursType>;
  };
};

export const ExampleHoursStatusFields = {
  data: {
    label: "Data",
    type: "object",
    objectFields: {
      hours: YextEntityFieldSelector<any, HoursType>({
        label: "Hours",
        filter: {
          types: ["type.hours"],
        },
      }),
    },
  },
};

export const ExampleHoursStatus = ({ data }: ExampleHoursStatusProps) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const hours = resolveComponentData(data.hours, locale, streamDocument);

  if (!hours) {
    return null;
  }

  return (
    <HoursStatus
      hours={hours}
      timezone={streamDocument.timezone}
      currentTemplate={(status) => {
        const isOpen24Hours = status.currentInterval?.is24h?.() ?? false;
        const isIndefinitelyClosed = !status.futureInterval;

        return (
          <span className="font-semibold">
            {isOpen24Hours
              ? "Open 24 Hours"
              : isIndefinitelyClosed
                ? "Temporarily Closed"
                : status.isOpen
                  ? "Open now"
                  : "Closed now"}
          </span>
        );
      }}
      separatorTemplate={(status) => {
        const isOpen24Hours = status.currentInterval?.is24h?.() ?? false;
        const isIndefinitelyClosed = !status.futureInterval;

        return isOpen24Hours || isIndefinitelyClosed ? null : (
          <span className="mx-2">|</span>
        );
      }}
      futureTemplate={(status) => {
        const isOpen24Hours = status.currentInterval?.is24h?.() ?? false;
        const isIndefinitelyClosed = !status.futureInterval;

        if (isOpen24Hours || isIndefinitelyClosed) {
          return null;
        }

        return status.isOpen ? <span>Closes at </span> : <span>Opens at </span>;
      }}
      timeTemplate={(status) => {
        const isOpen24Hours = status.currentInterval?.is24h?.() ?? false;
        const interval = status.isOpen
          ? status.currentInterval
          : status.futureInterval;

        if (isOpen24Hours || !interval) {
          return null;
        }

        return (
          <span>
            {status.isOpen
              ? interval.getEndTime("en", status.timeOptions)
              : interval.getStartTime("en", status.timeOptions)}
          </span>
        );
      }}
      dayOfWeekTemplate={(status) => {
        const isOpen24Hours = status.currentInterval?.is24h?.() ?? false;
        const interval = status.isOpen
          ? status.currentInterval
          : status.futureInterval;

        if (isOpen24Hours || !interval) {
          return null;
        }

        const date = status.isOpen ? interval.end : interval.start;
        return <span className="ml-1">{date?.toFormat("cccc")}</span>;
      }}
    />
  );
};

export const ExampleHoursStatusDefaultProps = {
  data: {
    hours: {
      field: "hours",
      constantValue: {},
    },
  },
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

## `<Link />` from `@yext/pages-components`

Use `Link` (not raw `<a>`) for typed CTA links. Render the visible label as child text or child markup. Common pattern is `cta={{ link, linkType }}` plus optional analytics/event props.

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
      cta={{
        link: streamDocument.websiteUrl,
        linkType: "URL",
      }}
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
