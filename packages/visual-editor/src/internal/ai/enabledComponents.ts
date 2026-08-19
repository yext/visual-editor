/** The config passed to Puck AI will be filtered to the components listed here. */
export const enabledAiComponents = ["MiniHero"] as const;

export const enabledAiComponentSet = new Set<string>(enabledAiComponents);
