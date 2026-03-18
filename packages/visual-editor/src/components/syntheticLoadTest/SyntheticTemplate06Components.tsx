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

export const SyntheticTemplate06HeroComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={4}
      componentLabel="SyntheticTemplate06Hero"
    />
  );
};

export const SyntheticTemplate06Hero: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06Hero",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06Hero content lattice",
      summary:
        "Generated component SyntheticTemplate06Hero simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 1",
    },
    stats: {
      primary: 66,
      secondary: 42,
      tertiary: 30,
      seed: 600,
    },
    styles: {
      tone: "lagoon",
      density: "immersive",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06HeroComponent,
};

export const SyntheticTemplate06MetricsPanelComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={5}
      componentLabel="SyntheticTemplate06MetricsPanel"
    />
  );
};

export const SyntheticTemplate06MetricsPanel: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06MetricsPanel",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06MetricsPanel content lattice",
      summary:
        "Generated component SyntheticTemplate06MetricsPanel simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 2",
    },
    stats: {
      primary: 69,
      secondary: 47,
      tertiary: 39,
      seed: 617,
    },
    styles: {
      tone: "moss",
      density: "regular",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06MetricsPanelComponent,
};

export const SyntheticTemplate06StoryGridComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={6}
      componentLabel="SyntheticTemplate06StoryGrid"
    />
  );
};

export const SyntheticTemplate06StoryGrid: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06StoryGrid",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06StoryGrid content lattice",
      summary:
        "Generated component SyntheticTemplate06StoryGrid simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 3",
    },
    stats: {
      primary: 72,
      secondary: 52,
      tertiary: 48,
      seed: 634,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06StoryGridComponent,
};

export const SyntheticTemplate06SignalRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={7}
      componentLabel="SyntheticTemplate06SignalRail"
    />
  );
};

export const SyntheticTemplate06SignalRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06SignalRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06SignalRail content lattice",
      summary:
        "Generated component SyntheticTemplate06SignalRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 4",
    },
    stats: {
      primary: 75,
      secondary: 57,
      tertiary: 57,
      seed: 651,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06SignalRailComponent,
};

export const SyntheticTemplate06FeatureMatrixComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={8}
      componentLabel="SyntheticTemplate06FeatureMatrix"
    />
  );
};

export const SyntheticTemplate06FeatureMatrix: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06FeatureMatrix",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06FeatureMatrix content lattice",
      summary:
        "Generated component SyntheticTemplate06FeatureMatrix simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 5",
    },
    stats: {
      primary: 78,
      secondary: 62,
      tertiary: 66,
      seed: 668,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06FeatureMatrixComponent,
};

export const SyntheticTemplate06JourneyStripComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={9}
      componentLabel="SyntheticTemplate06JourneyStrip"
    />
  );
};

export const SyntheticTemplate06JourneyStrip: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06JourneyStrip",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06JourneyStrip content lattice",
      summary:
        "Generated component SyntheticTemplate06JourneyStrip simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 6",
    },
    stats: {
      primary: 81,
      secondary: 67,
      tertiary: 75,
      seed: 685,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06JourneyStripComponent,
};

export const SyntheticTemplate06ProofStackComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={10}
      componentLabel="SyntheticTemplate06ProofStack"
    />
  );
};

export const SyntheticTemplate06ProofStack: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06ProofStack",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06ProofStack content lattice",
      summary:
        "Generated component SyntheticTemplate06ProofStack simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 7",
    },
    stats: {
      primary: 84,
      secondary: 72,
      tertiary: 84,
      seed: 702,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06ProofStackComponent,
};

export const SyntheticTemplate06MediaMosaicComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={11}
      componentLabel="SyntheticTemplate06MediaMosaic"
    />
  );
};

export const SyntheticTemplate06MediaMosaic: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06MediaMosaic",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06MediaMosaic content lattice",
      summary:
        "Generated component SyntheticTemplate06MediaMosaic simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 8",
    },
    stats: {
      primary: 87,
      secondary: 77,
      tertiary: 93,
      seed: 719,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06MediaMosaicComponent,
};

export const SyntheticTemplate06ComparisonRailComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={12}
      componentLabel="SyntheticTemplate06ComparisonRail"
    />
  );
};

export const SyntheticTemplate06ComparisonRail: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06ComparisonRail",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06ComparisonRail content lattice",
      summary:
        "Generated component SyntheticTemplate06ComparisonRail simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 9",
    },
    stats: {
      primary: 90,
      secondary: 82,
      tertiary: 102,
      seed: 736,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06ComparisonRailComponent,
};

export const SyntheticTemplate06FAQRibbonComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={13}
      componentLabel="SyntheticTemplate06FAQRibbon"
    />
  );
};

export const SyntheticTemplate06FAQRibbon: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06FAQRibbon",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06FAQRibbon content lattice",
      summary:
        "Generated component SyntheticTemplate06FAQRibbon simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 10",
    },
    stats: {
      primary: 93,
      secondary: 87,
      tertiary: 111,
      seed: 753,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06FAQRibbonComponent,
};

export const SyntheticTemplate06CTAConsoleComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={14}
      componentLabel="SyntheticTemplate06CTAConsole"
    />
  );
};

export const SyntheticTemplate06CTAConsole: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06CTAConsole",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06CTAConsole content lattice",
      summary:
        "Generated component SyntheticTemplate06CTAConsole simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 11",
    },
    stats: {
      primary: 96,
      secondary: 92,
      tertiary: 120,
      seed: 770,
    },
    styles: {
      tone: "lagoon",
      density: "compact",
      mirrored: false,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06CTAConsoleComponent,
};

export const SyntheticTemplate06TimelineDeckComponent: PuckComponent<
  SharedSyntheticProps
> = (props) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={15}
      componentLabel="SyntheticTemplate06TimelineDeck"
    />
  );
};

export const SyntheticTemplate06TimelineDeck: ComponentConfig<{
  props: SharedSyntheticProps;
}> = {
  label: "SyntheticTemplate06TimelineDeck",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template 6",
      title: "SyntheticTemplate06TimelineDeck content lattice",
      summary:
        "Generated component SyntheticTemplate06TimelineDeck simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster 12",
    },
    stats: {
      primary: 99,
      secondary: 97,
      tertiary: 129,
      seed: 787,
    },
    styles: {
      tone: "moss",
      density: "compact",
      mirrored: true,
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: SyntheticTemplate06TimelineDeckComponent,
};

export interface SyntheticTemplate06Props {
  SyntheticTemplate06Hero: SharedSyntheticProps;
  SyntheticTemplate06MetricsPanel: SharedSyntheticProps;
  SyntheticTemplate06StoryGrid: SharedSyntheticProps;
  SyntheticTemplate06SignalRail: SharedSyntheticProps;
  SyntheticTemplate06FeatureMatrix: SharedSyntheticProps;
  SyntheticTemplate06JourneyStrip: SharedSyntheticProps;
  SyntheticTemplate06ProofStack: SharedSyntheticProps;
  SyntheticTemplate06MediaMosaic: SharedSyntheticProps;
  SyntheticTemplate06ComparisonRail: SharedSyntheticProps;
  SyntheticTemplate06FAQRibbon: SharedSyntheticProps;
  SyntheticTemplate06CTAConsole: SharedSyntheticProps;
  SyntheticTemplate06TimelineDeck: SharedSyntheticProps;
}

export const SyntheticTemplate06Components = {
  SyntheticTemplate06Hero,
  SyntheticTemplate06MetricsPanel,
  SyntheticTemplate06StoryGrid,
  SyntheticTemplate06SignalRail,
  SyntheticTemplate06FeatureMatrix,
  SyntheticTemplate06JourneyStrip,
  SyntheticTemplate06ProofStack,
  SyntheticTemplate06MediaMosaic,
  SyntheticTemplate06ComparisonRail,
  SyntheticTemplate06FAQRibbon,
  SyntheticTemplate06CTAConsole,
  SyntheticTemplate06TimelineDeck,
};

export const SyntheticTemplate06Category = Object.keys(
  SyntheticTemplate06Components
) as (keyof SyntheticTemplate06Props)[];

export const SyntheticTemplate06TemplateId = "loadTestTemplate06";
