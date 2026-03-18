import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packageRoot = path.join(repoRoot, "packages/visual-editor");
const componentsDir = path.join(
  packageRoot,
  "src/components/syntheticLoadTest"
);
const configsDir = path.join(packageRoot, "src/components/configs");
const templatesDir = path.join(packageRoot, "src/vite-plugin/templates");
const configsIndexPath = path.join(configsDir, "index.ts");
const pluginPath = path.join(packageRoot, "src/vite-plugin/plugin.ts");

const TEMPLATE_COUNT = 128;
const templateNumbers = Array.from(
  { length: TEMPLATE_COUNT },
  (_, index) => index + 1
);

const componentNames = [
  "Hero",
  "MetricsPanel",
  "StoryGrid",
  "SignalRail",
  "FeatureMatrix",
  "JourneyStrip",
  "ProofStack",
  "MediaMosaic",
  "ComparisonRail",
  "FAQRibbon",
  "CTAConsole",
  "TimelineDeck",
];

const tones = [
  { name: "copper", bg: "from-amber-100 via-orange-50 to-rose-100" },
  { name: "lagoon", bg: "from-cyan-100 via-sky-50 to-blue-100" },
  { name: "moss", bg: "from-lime-100 via-emerald-50 to-green-100" },
  { name: "graphite", bg: "from-slate-200 via-zinc-100 to-stone-100" },
];

fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(configsDir, { recursive: true });
fs.mkdirSync(templatesDir, { recursive: true });

const toTemplateId = (number) =>
  `loadTestTemplate${String(number).padStart(2, "0")}`;

const cleanupGeneratedFiles = (directoryPath, matcher) => {
  for (const entry of fs.readdirSync(directoryPath)) {
    if (matcher.test(entry)) {
      fs.rmSync(path.join(directoryPath, entry), { force: true });
    }
  }
};

const createConfigsIndexFile = () => {
  const syntheticExports = templateNumbers
    .map((number) => {
      const templateNumber = String(number).padStart(2, "0");
      return `export {
  loadTestTemplate${templateNumber}Config,
  type SyntheticTemplate${templateNumber}ConfigProps,
} from "./loadTestTemplate${templateNumber}Config.tsx";`;
    })
    .join("\n");

  return `export { mainConfig, type MainConfigProps } from "./mainConfig.tsx";
export {
  directoryConfig,
  type DirectoryConfigProps,
} from "./directoryConfig.tsx";
export { locatorConfig, type LocatorConfigProps } from "./locatorConfig.tsx";
${syntheticExports}
`;
};

const createPluginFile = () => {
  const syntheticImports = templateNumbers
    .map((number) => {
      const templateNumber = String(number).padStart(2, "0");
      return `import loadTestTemplate${templateNumber} from "./templates/loadTestTemplate${templateNumber}.tsx?raw";`;
    })
    .join("\n");

  const syntheticTemplateList = templateNumbers
    .map((number) => `  loadTestTemplate${String(number).padStart(2, "0")},`)
    .join("\n");

  return `import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import mainTemplate from "./templates/main.tsx?raw";
import editTemplate from "./templates/edit.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import locatorTemplate from "./templates/locator.tsx?raw";
${syntheticImports}
import { ComponentField, ComponentFields } from "../types/fields.ts";
import { defaultLayoutData } from "./defaultLayoutData.ts";

type TemplateManifestEntry = {
  name: string;
  description: string;
  exampleSiteUrl: string;
  layoutRequired: boolean;
  defaultLayoutData?: any;
  componentFields?: ComponentField[];
};

type VirtualFile = {
  filepath: string;
  content: any;
  templateManifestEntry?: TemplateManifestEntry;
};

const syntheticTemplates: VirtualFile[] = [
${syntheticTemplateList}
].map((content, index) => {
  const templateNumber = String(index + 1).padStart(2, "0");

  return {
    filepath: \`src/templates/loadTestTemplate\${templateNumber}.tsx\`,
    content,
    templateManifestEntry: {
      name: \`loadTestTemplate\${templateNumber}\`,
      description:
        "Synthetic load-test template generated to stress bundle size, config registration, and template manifest growth.",
      exampleSiteUrl: "",
      layoutRequired: true,
    },
  };
});

/**
 * virtualFiles defines the template files that are to be generated and inserted into
 * the repo during buildStart
 *
 * It also defines entries that will be used to generate the template-manifest.json
 */
const virtualFiles: VirtualFile[] = [
  {
    filepath: "src/templates/main.tsx",
    content: mainTemplate,
    templateManifestEntry: {
      name: "main",
      description:
        "Use this template to generate pages for each of your Locations.",
      exampleSiteUrl: "",
      layoutRequired: true,
      defaultLayoutData: defaultLayoutData.main,
      componentFields: [
        ComponentFields.PromoSection,
        ComponentFields.ProductSection,
        ComponentFields.EventSection,
        ComponentFields.FAQSection,
        ComponentFields.TestimonialSection,
        ComponentFields.InsightSection,
        ComponentFields.TeamSection,
      ],
    },
  },
  {
    filepath: "src/templates/directory.tsx",
    content: directoryTemplate,
    templateManifestEntry: {
      name: "directory",
      description:
        "Use this template to generate pages for each of your Directory entities.",
      exampleSiteUrl: "",
      layoutRequired: true,
      defaultLayoutData: defaultLayoutData.directory,
      // no componentFields are defined because this is handled in the back-end for the dynamically
      // generated DM fields
    },
  },
  {
    filepath: "src/templates/locator.tsx",
    content: locatorTemplate,
    templateManifestEntry: {
      name: "locator",
      description: "Use this template to generate pages for your Locators.",
      exampleSiteUrl: "",
      layoutRequired: true,
      defaultLayoutData: defaultLayoutData.locator,
    },
  },
  {
    filepath: "src/templates/edit.tsx",
    content: editTemplate,
  },
  ...syntheticTemplates,
];

export const yextVisualEditorPlugin = (): Plugin => {
  let isBuildMode = false;
  const filesToCleanup: string[] = [];

  /**
   * generateFiles generates the template files and .temlpate-manifest.json file
   *
   * Does not overwrite files that already exists
   *
   * Created files will be marked for deletion on buildEnd
   */
  const generateFiles = () => {
    // Create a structure to store the manifest data
    const manifest: {
      templates: TemplateManifestEntry[];
    } = { templates: [] };

    // Iterate over each template definition
    virtualFiles.forEach((virtualFile: VirtualFile) => {
      const filePath = path.join(process.cwd(), virtualFile.filepath);

      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Write the content to the file if it doesn't already exist
      if (!fs.existsSync(filePath)) {
        filesToCleanup.push(filePath);
        fs.writeFileSync(filePath, virtualFile.content);
      }

      // populate template-manifest object
      if (virtualFile.templateManifestEntry) {
        manifest.templates.push(virtualFile.templateManifestEntry);
      }
    });

    const manifestPath = path.join(process.cwd(), ".template-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      // Write the manifest to the .template-manifest.json file
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
  };

  const cleanupFiles = () => {
    filesToCleanup.forEach((filePath) => {
      fs.rmSync(filePath, { force: true });
    });
  };

  // cleanup on interruption (ctrl + C)
  process.on("SIGINT", () => {
    cleanupFiles();
    process.nextTick(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    cleanupFiles();
    process.nextTick(() => process.exit(0));
  });

  return {
    name: "vite-plugin-yext-visual-editor",
    config(_, { command }) {
      isBuildMode = command === "build";
    },
    buildStart() {
      generateFiles();
    },
    buildEnd() {
      if (isBuildMode) {
        cleanupFiles();
      }
    },
  };
};
`;
};

const createComponentFile = (number) => {
  const templateId = toTemplateId(number);
  const componentPrefix = `SyntheticTemplate${String(number).padStart(2, "0")}`;
  const tone = tones[(number - 1) % tones.length];
  const otherTone = tones[number % tones.length];

  const componentBlocks = componentNames
    .map((name, index) =>
      createComponentBlock({
        componentPrefix,
        componentName: `${componentPrefix}${name}`,
        variantIndex: index,
        tone,
        otherTone,
        templateNumber: number,
      })
    )
    .join("\n\n");

  return `import React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";

type SyntheticTone = "copper" | "lagoon" | "moss" | "graphite";
type SyntheticDensity = "compact" | "regular" | "immersive";

const toneClasses: Record<SyntheticTone, string> = {
  copper: "from-amber-100 via-orange-50 to-rose-100 border-amber-300 text-amber-950",
  lagoon: "from-cyan-100 via-sky-50 to-blue-100 border-sky-300 text-sky-950",
  moss: "from-lime-100 via-emerald-50 to-green-100 border-emerald-300 text-emerald-950",
  graphite: "from-slate-200 via-zinc-100 to-stone-100 border-slate-400 text-slate-950",
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
      id: \`\${componentLabel}-\${index}\`,
      label: \`\${styles.highlightLabel} \${index + 1}\`,
      value: spread + stats.primary + index,
      delta: stats.secondary - index + stats.tertiary,
    };
  });

  return (
    <section
      className={\`my-4 flex flex-col rounded-3xl border bg-gradient-to-br shadow-sm \${toneClasses[styles.tone]} \${densityClasses[styles.density]}\`}
    >
      <div
        className={\`grid items-start gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] \${styles.mirrored ? "md:[&>*:first-child]:order-2" : ""}\`}
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

${componentBlocks}

export interface ${componentPrefix}Props {
  ${componentNames.map((name) => `${componentPrefix}${name}: SharedSyntheticProps;`).join("\n  ")}
}

export const ${componentPrefix}Components = {
  ${componentNames.map((name) => `${componentPrefix}${name}`).join(",\n  ")},
};

export const ${componentPrefix}Category = Object.keys(
  ${componentPrefix}Components
) as (keyof ${componentPrefix}Props)[];

export const ${componentPrefix}TemplateId = "${templateId}";
`;
};

const createComponentBlock = ({
  componentName,
  variantIndex,
  tone,
  otherTone,
  templateNumber,
}) => {
  const cardCount = 4 + variantIndex;
  const primary = templateNumber * 11 + variantIndex * 3;
  const secondary = templateNumber * 7 + variantIndex * 5;
  const tertiary = templateNumber * 5 + variantIndex * 9;
  const renderName = `${componentName}Component`;

  return `export const ${renderName}: PuckComponent<SharedSyntheticProps> = (
  props
) => {
  return (
    <SharedSyntheticSurface
      {...props}
      cardCount={${cardCount}}
      componentLabel="${componentName}"
    />
  );
};

export const ${componentName}: ComponentConfig<{ props: SharedSyntheticProps }> = {
  label: "${componentName}",
  fields: sharedFields,
  defaultProps: {
    content: {
      eyebrow: "Synthetic template ${templateNumber}",
      title: "${componentName} content lattice",
      summary:
        "Generated component ${componentName} simulates a heavier template module with nested field groups, repeated card rendering, and differentiated static content.",
      emphasis: "cluster ${variantIndex + 1}",
    },
    stats: {
      primary: ${primary},
      secondary: ${secondary},
      tertiary: ${tertiary},
      seed: ${templateNumber * 100 + variantIndex * 17},
    },
    styles: {
      tone: "${variantIndex % 2 === 0 ? tone.name : otherTone.name}",
      density: "${variantIndex === 0 ? "immersive" : variantIndex === 1 ? "regular" : "compact"}",
      mirrored: ${variantIndex % 2 === 1},
      highlightLabel: "signal band",
    },
    liveVisibility: true,
  },
  render: ${renderName},
};`;
};

const createConfigFile = (number) => {
  const templateNumber = String(number).padStart(2, "0");
  const componentPrefix = `SyntheticTemplate${templateNumber}`;
  const configName = `${toTemplateId(number)}Config`;

  return `import { Config, DropZone } from "@puckeditor/core";
import {
  ${componentPrefix}Category,
  ${componentPrefix}Components,
  type ${componentPrefix}Props,
} from "../syntheticLoadTest/${componentPrefix}Components.tsx";

export interface ${componentPrefix}ConfigProps extends ${componentPrefix}Props {}

const components: Config<${componentPrefix}ConfigProps>["components"] = {
  ...${componentPrefix}Components,
};

export const ${configName}: Config<${componentPrefix}ConfigProps> = {
  components,
  categories: {
    syntheticLoad: {
      title: "Synthetic Load Template ${templateNumber}",
      components: ${componentPrefix}Category,
    },
  },
  root: {
    render: () => (
      <DropZone
        zone="default-zone"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      />
    ),
  },
};
`;
};

const createTemplateFile = (number) => {
  const templateId = toTemplateId(number);
  const templateNumber = String(number).padStart(2, "0");
  const configName = `${templateId}Config`;
  const componentPrefix = `SyntheticTemplate${templateNumber}`;

  return `/** THIS FILE IS AUTOGENERATED AND SHOULD NOT BE EDITED */
import "@yext/visual-editor/style.css";
import "../index.css";
import {
  Template,
  GetPath,
  TemplateProps,
  TemplateRenderProps,
  GetHeadConfig,
  HeadConfig,
  TagType,
  TransformProps,
} from "@yext/pages";
import { Render, resolveAllData } from "@puckeditor/core";
import {
  applyTheme,
  VisualEditorProvider,
  getPageMetadata,
  applyAnalytics,
  applyHeaderScript,
  migrate,
  migrationRegistry,
  defaultThemeConfig,
  getSchema,
  injectTranslations,
  getCanonicalUrl,
  resolveUrlTemplate,
  ${configName},
} from "@yext/visual-editor";
import { AnalyticsProvider, SchemaWrapper } from "@yext/pages-components";

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (
  data: TemplateRenderProps
): HeadConfig => {
  const { document, relativePrefixToRoot } = data;
  const { title, description } = getPageMetadata(document);
  const schema = getSchema(data);
  const faviconUrl = document?._favicon ?? document?._site?.favicon?.url;

  return {
    title,
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    tags: [
      {
        type: "link" as TagType,
        attributes: {
          rel: "icon",
          type: "image/x-icon",
        },
      },
      ...(data.document.siteDomain
        ? [
            {
              type: "link" as TagType,
              attributes: {
                rel: "canonical",
                href: getCanonicalUrl(data),
              },
            },
          ]
        : []),
      ...(description
        ? [
            {
              type: "meta" as TagType,
              attributes: {
                name: "description",
                content: description,
              },
            },
          ]
        : []),
      ...(faviconUrl
        ? [
            {
              type: "link" as TagType,
              attributes: {
                rel: "icon",
                type: "image/x-icon",
                href: faviconUrl,
              },
            },
          ]
        : []),
    ],
    other: [
      applyAnalytics(document),
      applyHeaderScript(document),
      applyTheme(document, relativePrefixToRoot, defaultThemeConfig),
      SchemaWrapper(schema),
    ].join("\\n"),
  };
};

export const getPath: GetPath<TemplateProps> = ({
  document,
  relativePrefixToRoot,
}) => {
  return resolveUrlTemplate(document, relativePrefixToRoot);
};

export const transformProps: TransformProps<TemplateProps> = async (props) => {
  const { document } = props;

  const migratedData = migrate(
    JSON.parse(document.__.layout),
    migrationRegistry,
    ${configName},
    document
  );
  const resolvedPuckData = await resolveAllData(migratedData, ${configName}, {
    streamDocument: document,
  });
  document.__.layout = JSON.stringify(resolvedPuckData);
  const translations = await injectTranslations(document);

  return { ...props, document, translations };
};

const ${componentPrefix}Template: Template<TemplateRenderProps> = (props) => {
  const { document } = props;

  const layoutString = document.__.layout;
  let data: any = {};
  try {
    data = JSON.parse(layoutString);
  } catch (error) {
    console.error("Failed to parse layout JSON:", error);
  }

  let requireAnalyticsOptIn = false;
  if (document.__?.visualEditorConfig) {
    try {
      requireAnalyticsOptIn =
        JSON.parse(document.__.visualEditorConfig)?.requireAnalyticsOptIn ??
        false;
    } catch (error) {
      console.error("Failed to parse visualEditorConfig JSON:", error);
    }
  }

  return (
    <AnalyticsProvider
      apiKey={document?._env?.YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY}
      templateData={props}
      currency="USD"
      requireOptIn={requireAnalyticsOptIn}
    >
      <VisualEditorProvider templateProps={props}>
        <Render
          config={${configName}}
          data={data}
          metadata={{ streamDocument: document }}
        />
      </VisualEditorProvider>
    </AnalyticsProvider>
  );
};

export default ${componentPrefix}Template;
`;
};

cleanupGeneratedFiles(componentsDir, /^SyntheticTemplate\d+Components\.tsx$/);
cleanupGeneratedFiles(configsDir, /^loadTestTemplate\d+Config\.tsx$/);
cleanupGeneratedFiles(templatesDir, /^loadTestTemplate\d+\.tsx$/);

for (const number of templateNumbers) {
  const templateNumber = String(number).padStart(2, "0");
  const componentPrefix = `SyntheticTemplate${templateNumber}`;

  fs.writeFileSync(
    path.join(componentsDir, `${componentPrefix}Components.tsx`),
    createComponentFile(number)
  );
  fs.writeFileSync(
    path.join(configsDir, `${toTemplateId(number)}Config.tsx`),
    createConfigFile(number)
  );
  fs.writeFileSync(
    path.join(templatesDir, `${toTemplateId(number)}.tsx`),
    createTemplateFile(number)
  );
}

fs.writeFileSync(configsIndexPath, createConfigsIndexFile());
fs.writeFileSync(pluginPath, createPluginFile());
