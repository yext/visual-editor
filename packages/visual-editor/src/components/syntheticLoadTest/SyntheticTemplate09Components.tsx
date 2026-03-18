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

export const SyntheticTemplate09HeroComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={4}
      componentLabel="SyntheticTemplate09Hero"
    />
  );
};

export const SyntheticTemplate09Hero: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09Hero",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09Hero content lattice",
      summary:
        "Generated component SyntheticTemplate09Hero simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 1",
    },
    stats: {
      primary: 99,
      secondary: 63,
      tertiary: 45,
      seed: 900,
    },
    styles: {
      tone: "copper",
      density: "immersive",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09HeroComponent,
};

export const SyntheticTemplate09MetricsPanelComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={5}
      componentLabel="SyntheticTemplate09MetricsPanel"
    />
  );
};

export const SyntheticTemplate09MetricsPanel: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09MetricsPanel",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09MetricsPanel content lattice",
      summary:
        "Generated component SyntheticTemplate09MetricsPanel simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 2",
    },
    stats: {
      primary: 102,
      secondary: 68,
      tertiary: 54,
      seed: 917,
    },
    styles: {
      tone: "lagoon",
      density: "regular",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09MetricsPanelComponent,
};

export const SyntheticTemplate09StoryGridComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={6}
      componentLabel="SyntheticTemplate09StoryGrid"
    />
  );
};

export const SyntheticTemplate09StoryGrid: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09StoryGrid",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09StoryGrid content lattice",
      summary:
        "Generated component SyntheticTemplate09StoryGrid simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 3",
    },
    stats: {
      primary: 105,
      secondary: 73,
      tertiary: 63,
      seed: 934,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09StoryGridComponent,
};

export const SyntheticTemplate09SignalRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={7}
      componentLabel="SyntheticTemplate09SignalRail"
    />
  );
};

export const SyntheticTemplate09SignalRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09SignalRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09SignalRail content lattice",
      summary:
        "Generated component SyntheticTemplate09SignalRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 4",
    },
    stats: {
      primary: 108,
      secondary: 78,
      tertiary: 72,
      seed: 951,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09SignalRailComponent,
};

export const SyntheticTemplate09FeatureMatrixComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={8}
      componentLabel="SyntheticTemplate09FeatureMatrix"
    />
  );
};

export const SyntheticTemplate09FeatureMatrix: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09FeatureMatrix",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09FeatureMatrix content lattice",
      summary:
        "Generated component SyntheticTemplate09FeatureMatrix simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 5",
    },
    stats: {
      primary: 111,
      secondary: 83,
      tertiary: 81,
      seed: 968,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09FeatureMatrixComponent,
};

export const SyntheticTemplate09JourneyStripComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={9}
      componentLabel="SyntheticTemplate09JourneyStrip"
    />
  );
};

export const SyntheticTemplate09JourneyStrip: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09JourneyStrip",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09JourneyStrip content lattice",
      summary:
        "Generated component SyntheticTemplate09JourneyStrip simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 6",
    },
    stats: {
      primary: 114,
      secondary: 88,
      tertiary: 90,
      seed: 985,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09JourneyStripComponent,
};

export const SyntheticTemplate09ProofStackComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={10}
      componentLabel="SyntheticTemplate09ProofStack"
    />
  );
};

export const SyntheticTemplate09ProofStack: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09ProofStack",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09ProofStack content lattice",
      summary:
        "Generated component SyntheticTemplate09ProofStack simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 7",
    },
    stats: {
      primary: 117,
      secondary: 93,
      tertiary: 99,
      seed: 1002,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09ProofStackComponent,
};

export const SyntheticTemplate09MediaMosaicComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={11}
      componentLabel="SyntheticTemplate09MediaMosaic"
    />
  );
};

export const SyntheticTemplate09MediaMosaic: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09MediaMosaic",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09MediaMosaic content lattice",
      summary:
        "Generated component SyntheticTemplate09MediaMosaic simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 8",
    },
    stats: {
      primary: 120,
      secondary: 98,
      tertiary: 108,
      seed: 1019,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09MediaMosaicComponent,
};

export const SyntheticTemplate09ComparisonRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={12}
      componentLabel="SyntheticTemplate09ComparisonRail"
    />
  );
};

export const SyntheticTemplate09ComparisonRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09ComparisonRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09ComparisonRail content lattice",
      summary:
        "Generated component SyntheticTemplate09ComparisonRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 9",
    },
    stats: {
      primary: 123,
      secondary: 103,
      tertiary: 117,
      seed: 1036,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09ComparisonRailComponent,
};

export const SyntheticTemplate09FAQRibbonComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={13}
      componentLabel="SyntheticTemplate09FAQRibbon"
    />
  );
};

export const SyntheticTemplate09FAQRibbon: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09FAQRibbon",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09FAQRibbon content lattice",
      summary:
        "Generated component SyntheticTemplate09FAQRibbon simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 10",
    },
    stats: {
      primary: 126,
      secondary: 108,
      tertiary: 126,
      seed: 1053,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09FAQRibbonComponent,
};

export const SyntheticTemplate09CTAConsoleComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={14}
      componentLabel="SyntheticTemplate09CTAConsole"
    />
  );
};

export const SyntheticTemplate09CTAConsole: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09CTAConsole",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09CTAConsole content lattice",
      summary:
        "Generated component SyntheticTemplate09CTAConsole simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 11",
    },
    stats: {
      primary: 129,
      secondary: 113,
      tertiary: 135,
      seed: 1070,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09CTAConsoleComponent,
};

export const SyntheticTemplate09TimelineDeckComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={15}
      componentLabel="SyntheticTemplate09TimelineDeck"
    />
  );
};

export const SyntheticTemplate09TimelineDeck: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate09TimelineDeck",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 9",
      title: "SyntheticTemplate09TimelineDeck content lattice",
      summary:
        "Generated component SyntheticTemplate09TimelineDeck simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 12",
    },
    stats: {
      primary: 132,
      secondary: 118,
      tertiary: 144,
      seed: 1087,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate09TimelineDeckComponent,
};

export interface SyntheticTemplate09Props {
  SyntheticTemplate09Hero: SharedSyntheticProps;
  SyntheticTemplate09MetricsPanel: SharedSyntheticProps;
  SyntheticTemplate09StoryGrid: SharedSyntheticProps;
  SyntheticTemplate09SignalRail: SharedSyntheticProps;
  SyntheticTemplate09FeatureMatrix: SharedSyntheticProps;
  SyntheticTemplate09JourneyStrip: SharedSyntheticProps;
  SyntheticTemplate09ProofStack: SharedSyntheticProps;
  SyntheticTemplate09MediaMosaic: SharedSyntheticProps;
  SyntheticTemplate09ComparisonRail: SharedSyntheticProps;
  SyntheticTemplate09FAQRibbon: SharedSyntheticProps;
  SyntheticTemplate09CTAConsole: SharedSyntheticProps;
  SyntheticTemplate09TimelineDeck: SharedSyntheticProps;
}

export const SyntheticTemplate09Components = {
  SyntheticTemplate09Hero,
  SyntheticTemplate09MetricsPanel,
  SyntheticTemplate09StoryGrid,
  SyntheticTemplate09SignalRail,
  SyntheticTemplate09FeatureMatrix,
  SyntheticTemplate09JourneyStrip,
  SyntheticTemplate09ProofStack,
  SyntheticTemplate09MediaMosaic,
  SyntheticTemplate09ComparisonRail,
  SyntheticTemplate09FAQRibbon,
  SyntheticTemplate09CTAConsole,
  SyntheticTemplate09TimelineDeck,
};

export const SyntheticTemplate09Category = Object.keys(
  SyntheticTemplate09Components
) as (keyof SyntheticTemplate09Props)[];

export const SyntheticTemplate09TemplateId = "loadTestTemplate09";
