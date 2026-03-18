import React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";

type SyntheticTone = "copper" | "lagoon" | "moss" | "graphite";
type SyntheticDensity = "compact" | "regular" | "immersive";

const toneClasses: Record<SyntheticTone, string> = {
  copper:
    "from-amber-100 via-orange-50 to-rose-100 border-amber-300 text-amber-950",
  lagoon: "from-cyan-100 via-sky-50 to-blue-100 border-sky-300 text-sky-950",
  moss: "from-lime-100 via-emerald-50 to-green-100 border-emerald-300 text-emerald-950",
  graphite:
    "from-slate-200 via-zinc-100 to-stone-100 border-slate-400 text-slate-950",
};

const densityClasses: Record<SyntheticDensity, string> = {
  compact: "gap-3 p-4",
  regular: "gap-5 p-6",
  immersive: "gap-7 p-8",
};

type SharedSyntheticProps = {
  content: {
    eyebrow: string;
    title: string;
    summary: string;
    emphasis: string;
  };
  stats: {
    primary: number;
    secondary: number;
    tertiary: number;
    seed: number;
  };
  styles: {
    tone: SyntheticTone;
    density: SyntheticDensity;
    mirrored: boolean;
    highlightLabel: string;
  };
  liveVisibility: boolean;
};

const sharedFields: Fields<SharedSyntheticProps> = {
  content: {
    type: "object",
    objectFields: {
      eyebrow: { type: "text" },
      title: { type: "text" },
      summary: { type: "textarea" },
      emphasis: { type: "text" },
    },
  },
  stats: {
    type: "object",
    objectFields: {
      primary: { type: "number" },
      secondary: { type: "number" },
      tertiary: { type: "number" },
      seed: { type: "number" },
    },
  },
  styles: {
    type: "object",
    objectFields: {
      tone: {
        type: "radio",
        options: [
          { label: "Copper", value: "copper" },
          { label: "Lagoon", value: "lagoon" },
          { label: "Moss", value: "moss" },
          { label: "Graphite", value: "graphite" },
        ],
      },
      density: {
        type: "radio",
        options: [
          { label: "Compact", value: "compact" },
          { label: "Regular", value: "regular" },
          { label: "Immersive", value: "immersive" },
        ],
      },
      mirrored: {
        type: "radio",
        options: [
          { label: "Mirrored", value: true },
          { label: "Standard", value: false },
        ],
      },
      highlightLabel: { type: "text" },
    },
  },
  liveVisibility: {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  },
};

const SharedSyntheticSurface: React.FC<
  SharedSyntheticProps & {
    cardCount: number;
    componentLabel: string;
  }
> = ({ content, stats, styles, liveVisibility, cardCount, componentLabel }) => {
  if (!liveVisibility) {
    return null;
  }

  const cards = Array.from({ length: cardCount }, (_, index) => {
    const spread = stats.seed + index * 7;
    return {
      id: `${componentLabel}-${index}`,
      label: `${styles.highlightLabel} ${index + 1}`,
      value: spread + stats.primary + index,
      delta: stats.secondary - index + stats.tertiary,
    };
  });

  return (
    <section
      className={`my-4 flex flex-col rounded-3xl border bg-gradient-to-br shadow-sm ${toneClasses[styles.tone]} ${densityClasses[styles.density]}`}
    >
      <div
        className={`grid items-start gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] ${styles.mirrored ? "md:[&>*:first-child]:order-2" : ""}`}
      >
        <div className="space-y-4">
          <div className="inline-flex w-fit rounded-full border border-current/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
            {content.eyebrow}
          </div>
          <div className="space-y-2">
            <h2 className="max-w-3xl text-3xl font-black tracking-tight md:text-4xl">
              {content.title}
            </h2>
            <p className="max-w-2xl text-sm leading-6 opacity-80 md:text-base">
              {content.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="rounded-full bg-white/70 px-3 py-2">
              {content.emphasis}
            </span>
            <span className="rounded-full bg-black/5 px-3 py-2">
              {componentLabel}
            </span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs uppercase tracking-[0.2em] opacity-70">
              Throughput
            </div>
            <div className="mt-2 text-3xl font-black">{stats.primary}</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs uppercase tracking-[0.2em] opacity-70">
              Variants
            </div>
            <div className="mt-2 text-3xl font-black">{stats.secondary}</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs uppercase tracking-[0.2em] opacity-70">
              Fragments
            </div>
            <div className="mt-2 text-3xl font-black">{stats.tertiary}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.id}
            className="rounded-2xl border border-current/10 bg-white/70 p-4"
          >
            <div className="text-xs uppercase tracking-[0.2em] opacity-70">
              {card.label}
            </div>
            <div className="mt-3 text-2xl font-black">{card.value}</div>
            <div className="mt-2 text-sm opacity-80">
              Load band {card.delta} built from seed {stats.seed}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export const SyntheticTemplate02HeroComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={4}
      componentLabel="SyntheticTemplate02Hero"
    />
  );
};

export const SyntheticTemplate02Hero: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02Hero",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02Hero content lattice",
      summary:
        "Generated component SyntheticTemplate02Hero simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 1",
    },
    stats: {
      primary: 22,
      secondary: 14,
      tertiary: 10,
      seed: 200,
    },
    styles: {
      tone: "lagoon",
      density: "immersive",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02HeroComponent,
};

export const SyntheticTemplate02MetricsPanelComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={5}
      componentLabel="SyntheticTemplate02MetricsPanel"
    />
  );
};

export const SyntheticTemplate02MetricsPanel: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02MetricsPanel",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02MetricsPanel content lattice",
      summary:
        "Generated component SyntheticTemplate02MetricsPanel simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 2",
    },
    stats: {
      primary: 25,
      secondary: 19,
      tertiary: 19,
      seed: 217,
    },
    styles: {
      tone: "moss",
      density: "regular",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02MetricsPanelComponent,
};

export const SyntheticTemplate02StoryGridComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={6}
      componentLabel="SyntheticTemplate02StoryGrid"
    />
  );
};

export const SyntheticTemplate02StoryGrid: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02StoryGrid",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02StoryGrid content lattice",
      summary:
        "Generated component SyntheticTemplate02StoryGrid simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 3",
    },
    stats: {
      primary: 28,
      secondary: 24,
      tertiary: 28,
      seed: 234,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02StoryGridComponent,
};

export const SyntheticTemplate02SignalRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={7}
      componentLabel="SyntheticTemplate02SignalRail"
    />
  );
};

export const SyntheticTemplate02SignalRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02SignalRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02SignalRail content lattice",
      summary:
        "Generated component SyntheticTemplate02SignalRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 4",
    },
    stats: {
      primary: 31,
      secondary: 29,
      tertiary: 37,
      seed: 251,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02SignalRailComponent,
};

export const SyntheticTemplate02FeatureMatrixComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={8}
      componentLabel="SyntheticTemplate02FeatureMatrix"
    />
  );
};

export const SyntheticTemplate02FeatureMatrix: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02FeatureMatrix",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02FeatureMatrix content lattice",
      summary:
        "Generated component SyntheticTemplate02FeatureMatrix simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 5",
    },
    stats: {
      primary: 34,
      secondary: 34,
      tertiary: 46,
      seed: 268,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02FeatureMatrixComponent,
};

export const SyntheticTemplate02JourneyStripComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={9}
      componentLabel="SyntheticTemplate02JourneyStrip"
    />
  );
};

export const SyntheticTemplate02JourneyStrip: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02JourneyStrip",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02JourneyStrip content lattice",
      summary:
        "Generated component SyntheticTemplate02JourneyStrip simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 6",
    },
    stats: {
      primary: 37,
      secondary: 39,
      tertiary: 55,
      seed: 285,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02JourneyStripComponent,
};

export const SyntheticTemplate02ProofStackComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={10}
      componentLabel="SyntheticTemplate02ProofStack"
    />
  );
};

export const SyntheticTemplate02ProofStack: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02ProofStack",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02ProofStack content lattice",
      summary:
        "Generated component SyntheticTemplate02ProofStack simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 7",
    },
    stats: {
      primary: 40,
      secondary: 44,
      tertiary: 64,
      seed: 302,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02ProofStackComponent,
};

export const SyntheticTemplate02MediaMosaicComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={11}
      componentLabel="SyntheticTemplate02MediaMosaic"
    />
  );
};

export const SyntheticTemplate02MediaMosaic: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02MediaMosaic",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02MediaMosaic content lattice",
      summary:
        "Generated component SyntheticTemplate02MediaMosaic simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 8",
    },
    stats: {
      primary: 43,
      secondary: 49,
      tertiary: 73,
      seed: 319,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02MediaMosaicComponent,
};

export const SyntheticTemplate02ComparisonRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={12}
      componentLabel="SyntheticTemplate02ComparisonRail"
    />
  );
};

export const SyntheticTemplate02ComparisonRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02ComparisonRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02ComparisonRail content lattice",
      summary:
        "Generated component SyntheticTemplate02ComparisonRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 9",
    },
    stats: {
      primary: 46,
      secondary: 54,
      tertiary: 82,
      seed: 336,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02ComparisonRailComponent,
};

export const SyntheticTemplate02FAQRibbonComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={13}
      componentLabel="SyntheticTemplate02FAQRibbon"
    />
  );
};

export const SyntheticTemplate02FAQRibbon: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02FAQRibbon",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02FAQRibbon content lattice",
      summary:
        "Generated component SyntheticTemplate02FAQRibbon simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 10",
    },
    stats: {
      primary: 49,
      secondary: 59,
      tertiary: 91,
      seed: 353,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02FAQRibbonComponent,
};

export const SyntheticTemplate02CTAConsoleComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={14}
      componentLabel="SyntheticTemplate02CTAConsole"
    />
  );
};

export const SyntheticTemplate02CTAConsole: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02CTAConsole",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02CTAConsole content lattice",
      summary:
        "Generated component SyntheticTemplate02CTAConsole simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 11",
    },
    stats: {
      primary: 52,
      secondary: 64,
      tertiary: 100,
      seed: 370,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02CTAConsoleComponent,
};

export const SyntheticTemplate02TimelineDeckComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={15}
      componentLabel="SyntheticTemplate02TimelineDeck"
    />
  );
};

export const SyntheticTemplate02TimelineDeck: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate02TimelineDeck",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 2",
      title: "SyntheticTemplate02TimelineDeck content lattice",
      summary:
        "Generated component SyntheticTemplate02TimelineDeck simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 12",
    },
    stats: {
      primary: 55,
      secondary: 69,
      tertiary: 109,
      seed: 387,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate02TimelineDeckComponent,
};

export interface SyntheticTemplate02Props {
  SyntheticTemplate02Hero: SharedSyntheticProps;
  SyntheticTemplate02MetricsPanel: SharedSyntheticProps;
  SyntheticTemplate02StoryGrid: SharedSyntheticProps;
  SyntheticTemplate02SignalRail: SharedSyntheticProps;
  SyntheticTemplate02FeatureMatrix: SharedSyntheticProps;
  SyntheticTemplate02JourneyStrip: SharedSyntheticProps;
  SyntheticTemplate02ProofStack: SharedSyntheticProps;
  SyntheticTemplate02MediaMosaic: SharedSyntheticProps;
  SyntheticTemplate02ComparisonRail: SharedSyntheticProps;
  SyntheticTemplate02FAQRibbon: SharedSyntheticProps;
  SyntheticTemplate02CTAConsole: SharedSyntheticProps;
  SyntheticTemplate02TimelineDeck: SharedSyntheticProps;
}

export const SyntheticTemplate02Components = {
  SyntheticTemplate02Hero,
  SyntheticTemplate02MetricsPanel,
  SyntheticTemplate02StoryGrid,
  SyntheticTemplate02SignalRail,
  SyntheticTemplate02FeatureMatrix,
  SyntheticTemplate02JourneyStrip,
  SyntheticTemplate02ProofStack,
  SyntheticTemplate02MediaMosaic,
  SyntheticTemplate02ComparisonRail,
  SyntheticTemplate02FAQRibbon,
  SyntheticTemplate02CTAConsole,
  SyntheticTemplate02TimelineDeck,
};

export const SyntheticTemplate02Category = Object.keys(
  SyntheticTemplate02Components
) as (keyof SyntheticTemplate02Props)[];

export const SyntheticTemplate02TemplateId = "loadTestTemplate02";
