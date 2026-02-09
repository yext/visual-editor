import { createAiPlugin } from "@puckeditor/plugin-ai";
import { enabledAiComponents } from "./enabledComponents.ts";
import { puckAiSystemContext } from "./systemPrompt.ts";

type PrepareRequestFn = Exclude<
  Parameters<typeof createAiPlugin>[0],
  undefined
>["prepareRequest"];

/** Transform the Chat request before sending it to the backend */
export const preparePuckAiRequest: PrepareRequestFn = (opts) => {
  let updatedOpts = { ...opts };

  if (!updatedOpts.body) {
    updatedOpts.body = {};
  }

  updatedOpts.body.systemPrompt = puckAiSystemContext;

  if (!updatedOpts.body?.config?.components) {
    return updatedOpts;
  }

  updatedOpts.body.config.components = Object.fromEntries(
    Object.entries(updatedOpts.body.config.components).filter(([component]) =>
      (enabledAiComponents as string[]).includes(component)
    )
  );

  return updatedOpts;
};
