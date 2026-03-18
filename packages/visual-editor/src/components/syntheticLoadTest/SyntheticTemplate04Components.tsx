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

export const SyntheticTemplate04HeroComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={4}
      componentLabel="SyntheticTemplate04Hero"
    />
  );
};

export const SyntheticTemplate04Hero: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04Hero",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04Hero content lattice",
      summary:
        "Generated component SyntheticTemplate04Hero simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 1",
    },
    stats: {
      primary: 44,
      secondary: 28,
      tertiary: 20,
      seed: 400,
    },
    styles: {
      tone: "graphite",
      density: "immersive",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04HeroComponent,
};

export const SyntheticTemplate04MetricsPanelComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={5}
      componentLabel="SyntheticTemplate04MetricsPanel"
    />
  );
};

export const SyntheticTemplate04MetricsPanel: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04MetricsPanel",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04MetricsPanel content lattice",
      summary:
        "Generated component SyntheticTemplate04MetricsPanel simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 2",
    },
    stats: {
      primary: 47,
      secondary: 33,
      tertiary: 29,
      seed: 417,
    },
    styles: {
      tone: "copper",
      density: "regular",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04MetricsPanelComponent,
};

export const SyntheticTemplate04StoryGridComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={6}
      componentLabel="SyntheticTemplate04StoryGrid"
    />
  );
};

export const SyntheticTemplate04StoryGrid: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04StoryGrid",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04StoryGrid content lattice",
      summary:
        "Generated component SyntheticTemplate04StoryGrid simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 3",
    },
    stats: {
      primary: 50,
      secondary: 38,
      tertiary: 38,
      seed: 434,
    },
    styles: {
      tone: "graphite",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04StoryGridComponent,
};

export const SyntheticTemplate04SignalRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={7}
      componentLabel="SyntheticTemplate04SignalRail"
    />
  );
};

export const SyntheticTemplate04SignalRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04SignalRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04SignalRail content lattice",
      summary:
        "Generated component SyntheticTemplate04SignalRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 4",
    },
    stats: {
      primary: 53,
      secondary: 43,
      tertiary: 47,
      seed: 451,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04SignalRailComponent,
};

export const SyntheticTemplate04FeatureMatrixComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={8}
      componentLabel="SyntheticTemplate04FeatureMatrix"
    />
  );
};

export const SyntheticTemplate04FeatureMatrix: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04FeatureMatrix",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04FeatureMatrix content lattice",
      summary:
        "Generated component SyntheticTemplate04FeatureMatrix simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 5",
    },
    stats: {
      primary: 56,
      secondary: 48,
      tertiary: 56,
      seed: 468,
    },
    styles: {
      tone: "graphite",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04FeatureMatrixComponent,
};

export const SyntheticTemplate04JourneyStripComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={9}
      componentLabel="SyntheticTemplate04JourneyStrip"
    />
  );
};

export const SyntheticTemplate04JourneyStrip: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04JourneyStrip",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04JourneyStrip content lattice",
      summary:
        "Generated component SyntheticTemplate04JourneyStrip simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 6",
    },
    stats: {
      primary: 59,
      secondary: 53,
      tertiary: 65,
      seed: 485,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04JourneyStripComponent,
};

export const SyntheticTemplate04ProofStackComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={10}
      componentLabel="SyntheticTemplate04ProofStack"
    />
  );
};

export const SyntheticTemplate04ProofStack: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04ProofStack",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04ProofStack content lattice",
      summary:
        "Generated component SyntheticTemplate04ProofStack simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 7",
    },
    stats: {
      primary: 62,
      secondary: 58,
      tertiary: 74,
      seed: 502,
    },
    styles: {
      tone: "graphite",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04ProofStackComponent,
};

export const SyntheticTemplate04MediaMosaicComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={11}
      componentLabel="SyntheticTemplate04MediaMosaic"
    />
  );
};

export const SyntheticTemplate04MediaMosaic: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04MediaMosaic",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04MediaMosaic content lattice",
      summary:
        "Generated component SyntheticTemplate04MediaMosaic simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 8",
    },
    stats: {
      primary: 65,
      secondary: 63,
      tertiary: 83,
      seed: 519,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04MediaMosaicComponent,
};

export const SyntheticTemplate04ComparisonRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={12}
      componentLabel="SyntheticTemplate04ComparisonRail"
    />
  );
};

export const SyntheticTemplate04ComparisonRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04ComparisonRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04ComparisonRail content lattice",
      summary:
        "Generated component SyntheticTemplate04ComparisonRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 9",
    },
    stats: {
      primary: 68,
      secondary: 68,
      tertiary: 92,
      seed: 536,
    },
    styles: {
      tone: "graphite",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04ComparisonRailComponent,
};

export const SyntheticTemplate04FAQRibbonComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={13}
      componentLabel="SyntheticTemplate04FAQRibbon"
    />
  );
};

export const SyntheticTemplate04FAQRibbon: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04FAQRibbon",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04FAQRibbon content lattice",
      summary:
        "Generated component SyntheticTemplate04FAQRibbon simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 10",
    },
    stats: {
      primary: 71,
      secondary: 73,
      tertiary: 101,
      seed: 553,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04FAQRibbonComponent,
};

export const SyntheticTemplate04CTAConsoleComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={14}
      componentLabel="SyntheticTemplate04CTAConsole"
    />
  );
};

export const SyntheticTemplate04CTAConsole: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04CTAConsole",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04CTAConsole content lattice",
      summary:
        "Generated component SyntheticTemplate04CTAConsole simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 11",
    },
    stats: {
      primary: 74,
      secondary: 78,
      tertiary: 110,
      seed: 570,
    },
    styles: {
      tone: "graphite",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04CTAConsoleComponent,
};

export const SyntheticTemplate04TimelineDeckComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={15}
      componentLabel="SyntheticTemplate04TimelineDeck"
    />
  );
};

export const SyntheticTemplate04TimelineDeck: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate04TimelineDeck",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 4",
      title: "SyntheticTemplate04TimelineDeck content lattice",
      summary:
        "Generated component SyntheticTemplate04TimelineDeck simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 12",
    },
    stats: {
      primary: 77,
      secondary: 83,
      tertiary: 119,
      seed: 587,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate04TimelineDeckComponent,
};

export interface SyntheticTemplate04Props {
  SyntheticTemplate04Hero: SharedSyntheticProps;
  SyntheticTemplate04MetricsPanel: SharedSyntheticProps;
  SyntheticTemplate04StoryGrid: SharedSyntheticProps;
  SyntheticTemplate04SignalRail: SharedSyntheticProps;
  SyntheticTemplate04FeatureMatrix: SharedSyntheticProps;
  SyntheticTemplate04JourneyStrip: SharedSyntheticProps;
  SyntheticTemplate04ProofStack: SharedSyntheticProps;
  SyntheticTemplate04MediaMosaic: SharedSyntheticProps;
  SyntheticTemplate04ComparisonRail: SharedSyntheticProps;
  SyntheticTemplate04FAQRibbon: SharedSyntheticProps;
  SyntheticTemplate04CTAConsole: SharedSyntheticProps;
  SyntheticTemplate04TimelineDeck: SharedSyntheticProps;
}

export const SyntheticTemplate04Components = {
  SyntheticTemplate04Hero,
  SyntheticTemplate04MetricsPanel,
  SyntheticTemplate04StoryGrid,
  SyntheticTemplate04SignalRail,
  SyntheticTemplate04FeatureMatrix,
  SyntheticTemplate04JourneyStrip,
  SyntheticTemplate04ProofStack,
  SyntheticTemplate04MediaMosaic,
  SyntheticTemplate04ComparisonRail,
  SyntheticTemplate04FAQRibbon,
  SyntheticTemplate04CTAConsole,
  SyntheticTemplate04TimelineDeck,
};

export const SyntheticTemplate04Category = Object.keys(
  SyntheticTemplate04Components
) as (keyof SyntheticTemplate04Props)[];

export const SyntheticTemplate04TemplateId = "loadTestTemplate04";
