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

export const SyntheticTemplate05HeroComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={4}
      componentLabel="SyntheticTemplate05Hero"
    />
  );
};

export const SyntheticTemplate05Hero: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05Hero",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05Hero content lattice",
      summary:
        "Generated component SyntheticTemplate05Hero simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 1",
    },
    stats: {
      primary: 55,
      secondary: 35,
      tertiary: 25,
      seed: 500,
    },
    styles: {
      tone: "copper",
      density: "immersive",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05HeroComponent,
};

export const SyntheticTemplate05MetricsPanelComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={5}
      componentLabel="SyntheticTemplate05MetricsPanel"
    />
  );
};

export const SyntheticTemplate05MetricsPanel: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05MetricsPanel",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05MetricsPanel content lattice",
      summary:
        "Generated component SyntheticTemplate05MetricsPanel simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 2",
    },
    stats: {
      primary: 58,
      secondary: 40,
      tertiary: 34,
      seed: 517,
    },
    styles: {
      tone: "lagoon",
      density: "regular",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05MetricsPanelComponent,
};

export const SyntheticTemplate05StoryGridComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={6}
      componentLabel="SyntheticTemplate05StoryGrid"
    />
  );
};

export const SyntheticTemplate05StoryGrid: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05StoryGrid",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05StoryGrid content lattice",
      summary:
        "Generated component SyntheticTemplate05StoryGrid simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 3",
    },
    stats: {
      primary: 61,
      secondary: 45,
      tertiary: 43,
      seed: 534,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05StoryGridComponent,
};

export const SyntheticTemplate05SignalRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={7}
      componentLabel="SyntheticTemplate05SignalRail"
    />
  );
};

export const SyntheticTemplate05SignalRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05SignalRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05SignalRail content lattice",
      summary:
        "Generated component SyntheticTemplate05SignalRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 4",
    },
    stats: {
      primary: 64,
      secondary: 50,
      tertiary: 52,
      seed: 551,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05SignalRailComponent,
};

export const SyntheticTemplate05FeatureMatrixComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={8}
      componentLabel="SyntheticTemplate05FeatureMatrix"
    />
  );
};

export const SyntheticTemplate05FeatureMatrix: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05FeatureMatrix",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05FeatureMatrix content lattice",
      summary:
        "Generated component SyntheticTemplate05FeatureMatrix simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 5",
    },
    stats: {
      primary: 67,
      secondary: 55,
      tertiary: 61,
      seed: 568,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05FeatureMatrixComponent,
};

export const SyntheticTemplate05JourneyStripComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={9}
      componentLabel="SyntheticTemplate05JourneyStrip"
    />
  );
};

export const SyntheticTemplate05JourneyStrip: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05JourneyStrip",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05JourneyStrip content lattice",
      summary:
        "Generated component SyntheticTemplate05JourneyStrip simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 6",
    },
    stats: {
      primary: 70,
      secondary: 60,
      tertiary: 70,
      seed: 585,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05JourneyStripComponent,
};

export const SyntheticTemplate05ProofStackComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={10}
      componentLabel="SyntheticTemplate05ProofStack"
    />
  );
};

export const SyntheticTemplate05ProofStack: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05ProofStack",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05ProofStack content lattice",
      summary:
        "Generated component SyntheticTemplate05ProofStack simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 7",
    },
    stats: {
      primary: 73,
      secondary: 65,
      tertiary: 79,
      seed: 602,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05ProofStackComponent,
};

export const SyntheticTemplate05MediaMosaicComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={11}
      componentLabel="SyntheticTemplate05MediaMosaic"
    />
  );
};

export const SyntheticTemplate05MediaMosaic: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05MediaMosaic",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05MediaMosaic content lattice",
      summary:
        "Generated component SyntheticTemplate05MediaMosaic simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 8",
    },
    stats: {
      primary: 76,
      secondary: 70,
      tertiary: 88,
      seed: 619,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05MediaMosaicComponent,
};

export const SyntheticTemplate05ComparisonRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={12}
      componentLabel="SyntheticTemplate05ComparisonRail"
    />
  );
};

export const SyntheticTemplate05ComparisonRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05ComparisonRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05ComparisonRail content lattice",
      summary:
        "Generated component SyntheticTemplate05ComparisonRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 9",
    },
    stats: {
      primary: 79,
      secondary: 75,
      tertiary: 97,
      seed: 636,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05ComparisonRailComponent,
};

export const SyntheticTemplate05FAQRibbonComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={13}
      componentLabel="SyntheticTemplate05FAQRibbon"
    />
  );
};

export const SyntheticTemplate05FAQRibbon: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05FAQRibbon",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05FAQRibbon content lattice",
      summary:
        "Generated component SyntheticTemplate05FAQRibbon simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 10",
    },
    stats: {
      primary: 82,
      secondary: 80,
      tertiary: 106,
      seed: 653,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05FAQRibbonComponent,
};

export const SyntheticTemplate05CTAConsoleComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={14}
      componentLabel="SyntheticTemplate05CTAConsole"
    />
  );
};

export const SyntheticTemplate05CTAConsole: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05CTAConsole",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05CTAConsole content lattice",
      summary:
        "Generated component SyntheticTemplate05CTAConsole simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 11",
    },
    stats: {
      primary: 85,
      secondary: 85,
      tertiary: 115,
      seed: 670,
    },
    styles: {
      tone: "copper",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05CTAConsoleComponent,
};

export const SyntheticTemplate05TimelineDeckComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={15}
      componentLabel="SyntheticTemplate05TimelineDeck"
    />
  );
};

export const SyntheticTemplate05TimelineDeck: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate05TimelineDeck",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 5",
      title: "SyntheticTemplate05TimelineDeck content lattice",
      summary:
        "Generated component SyntheticTemplate05TimelineDeck simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 12",
    },
    stats: {
      primary: 88,
      secondary: 90,
      tertiary: 124,
      seed: 687,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate05TimelineDeckComponent,
};

export interface SyntheticTemplate05Props {
  SyntheticTemplate05Hero: SharedSyntheticProps;
  SyntheticTemplate05MetricsPanel: SharedSyntheticProps;
  SyntheticTemplate05StoryGrid: SharedSyntheticProps;
  SyntheticTemplate05SignalRail: SharedSyntheticProps;
  SyntheticTemplate05FeatureMatrix: SharedSyntheticProps;
  SyntheticTemplate05JourneyStrip: SharedSyntheticProps;
  SyntheticTemplate05ProofStack: SharedSyntheticProps;
  SyntheticTemplate05MediaMosaic: SharedSyntheticProps;
  SyntheticTemplate05ComparisonRail: SharedSyntheticProps;
  SyntheticTemplate05FAQRibbon: SharedSyntheticProps;
  SyntheticTemplate05CTAConsole: SharedSyntheticProps;
  SyntheticTemplate05TimelineDeck: SharedSyntheticProps;
}

export const SyntheticTemplate05Components = {
  SyntheticTemplate05Hero,
  SyntheticTemplate05MetricsPanel,
  SyntheticTemplate05StoryGrid,
  SyntheticTemplate05SignalRail,
  SyntheticTemplate05FeatureMatrix,
  SyntheticTemplate05JourneyStrip,
  SyntheticTemplate05ProofStack,
  SyntheticTemplate05MediaMosaic,
  SyntheticTemplate05ComparisonRail,
  SyntheticTemplate05FAQRibbon,
  SyntheticTemplate05CTAConsole,
  SyntheticTemplate05TimelineDeck,
};

export const SyntheticTemplate05Category = Object.keys(
  SyntheticTemplate05Components
) as (keyof SyntheticTemplate05Props)[];

export const SyntheticTemplate05TemplateId = "loadTestTemplate05";
