import { z } from "zod";
import { GENERATION_REPAIR_FEEDBACK_MAX_CHARACTERS } from "../limits.ts";
import {
  buildGenerationPrompt,
  recommendedGenerationSectionIds,
} from "../prompts.ts";
import type { Content } from "../shared/authoredValues.ts";
import type {
  GenerationEnvironment,
  GenerationResult,
  LayoutGenerationRequest,
} from "../shared/contracts.ts";
import type { FullPageUpdateStep } from "../workflows/fullPageUpdate/contracts.ts";
import { GenerationError } from "../shared/generationErrors.ts";
import { componentDiagnostics, summarizeSchema } from "./diagnostics.ts";
import { GenerationGatewayError, requestGenerationOutput } from "./gateway.ts";
import {
  compileGenerationRequest,
  parseGenerationResult,
  type CompiledGenerationRequest,
} from "./modes.ts";
import { validateGenerationRequest } from "./requestValidation.ts";

const utf8Bytes = (text: string): number =>
  new TextEncoder().encode(text).byteLength;

const jsonBytes = (value: unknown): number => utf8Bytes(JSON.stringify(value));

const GENERATION_MODES = {
  fullPageUpdate: {
    schemaName: "puck_full_page_update",
    eventType: "fullPageUpdated",
    responseLabel: "Full-page update",
    resultLabel: "page update",
  },
  prepare: {
    schemaName: "puck_generation_preparation",
    eventType: "prepared",
    responseLabel: "Preparation",
    resultLabel: "preparation",
  },
  create: {
    schemaName: "puck_generation",
    eventType: "accepted",
    responseLabel: "Creation",
    resultLabel: "layout",
  },
  plan: {
    schemaName: "puck_edit_plan",
    eventType: "planned",
    responseLabel: "Planning",
    resultLabel: "edit",
  },
  section: {
    schemaName: "puck_section_edit",
    eventType: "section-result",
    responseLabel: "Section",
    resultLabel: "edit",
  },
};

export const executeGeneration = async (
  payload: LayoutGenerationRequest,
  {
    model,
    catalog,
    locales,
    prompts,
    generationSettings,
    transport,
    diagnostics,
  }: GenerationEnvironment,
  signal: AbortSignal,
  correlationId: string,
  onCreationContent?: (content: Content) => Promise<void>,
  onFullPageUpdateStep?: (
    step: FullPageUpdateStep,
    index: number
  ) => Promise<void>,
  onFullPageUpdateSection?: (sectionId: string) => Promise<void>
): Promise<GenerationResult> => {
  if (!model?.trim()) {
    throw new GenerationError(
      "AI page generation requires a configured model."
    );
  }
  if (!prompts) {
    throw new GenerationError(
      "AI page generation requires a compatible prompt bundle."
    );
  }
  if (!generationSettings) {
    throw new GenerationError(
      "AI page generation requires configured generation settings."
    );
  }
  signal.throwIfAborted();
  const log = diagnostics.log;
  const bodyBytes = jsonBytes(payload);
  const requestDetails = {
    correlationId,
    promptContractVersion: prompts.contractVersion,
  };
  const rejectRequest = (
    message: string,
    status: number,
    details = {}
  ): never => {
    log("[layout generation] Request rejected", {
      correlationId,
      status,
      message,
      ...details,
    });
    throw new GenerationError(message, false, false, message, status);
  };
  const validated = validateGenerationRequest(
    payload,
    bodyBytes,
    rejectRequest
  );
  const { messages, layoutId, currentData, mode, context } = validated;
  const modeConfig = GENERATION_MODES[mode];
  const maxOutputTokens =
    generationSettings.maxOutputTokens[
      mode === "create" || mode === "fullPageUpdate" ? "page" : mode
    ];
  Object.assign(requestDetails, {
    mode,
    taskId: context.task?.taskId,
    sectionId: context.task?.sectionId,
  });
  const conversationHistory = messages.slice(0, -1);
  log("[layout generation] Request payload measured", {
    ...requestDetails,
    mode,
    taskId: context.task?.taskId,
    layoutId,
    bodyBytes,
    messageCount: messages.length,
    historyMessageCount: conversationHistory.length,
    historyContentBytes: conversationHistory.reduce(
      (total, message) => total + utf8Bytes(message.content),
      0
    ),
    latestPromptBytes: utf8Bytes(messages.at(-1)!.content),
    currentDataBytes: currentData === undefined ? 0 : jsonBytes(currentData),
    locales,
  });

  if (mode === "plan" || mode === "section") {
    log("[layout generation] Submitted layout", {
      correlationId,
      mode,
      taskId: context.task?.taskId,
      sectionId: context.task?.sectionId,
      currentData,
    });
  }

  let compiled: CompiledGenerationRequest;
  const compileStartedAt = Date.now();
  try {
    compiled = compileGenerationRequest(validated, catalog, locales);
    log("[layout generation] Schema compiled", {
      correlationId,
      mode,
      taskId: context.task?.taskId,
      layoutId,
      compilationDurationMs: Date.now() - compileStartedAt,
      isBlankPage: compiled.isBlankPage,
      availableComponentCount: compiled.availableComponentNames.length,
      availableComponentNames: compiled.availableComponentNames,
      schema: summarizeSchema(compiled.jsonSchema, jsonBytes),
    });
  } catch (error) {
    return rejectRequest(
      error instanceof Error ? error.message : String(error),
      422,
      {
        schemaCompilationDurationMs: Date.now() - compileStartedAt,
        componentCount: Object.keys(catalog.data.components).length,
        locales,
      }
    );
  }
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) {
    abort();
  }
  const deadline = setTimeout(
    () =>
      controller.abort(
        new Error(
          "Generation exceeded its configured deadline. Try a smaller request."
        )
      ),
    generationSettings.attemptTimeoutMs
  );
  let phase = "prepare";
  let outputBytes = 0;
  let streamFailure = false;
  try {
    if (compiled.localResult) {
      return parseGenerationResult(
        { type: modeConfig.eventType, ...compiled.localResult },
        mode
      );
    }
    phase = "build-prompt";
    const instructions =
      mode === "prepare"
        ? prompts.prompts.prepare
        : mode === "plan"
          ? prompts.prompts.plan
          : mode === "section"
            ? prompts.prompts.section
            : buildGenerationPrompt(
                prompts,
                catalog,
                compiled.availableComponentNames,
                locales,
                mode === "fullPageUpdate" ? "fullPageUpdate" : "create"
              );
    const componentStats =
      mode === "prepare"
        ? []
        : componentDiagnostics(catalog, { jsonBytes, utf8Bytes });
    const schemaStats = summarizeSchema(compiled.jsonSchema, jsonBytes);
    phase = "build-request";
    const recommendedSectionIds =
      mode === "create" || mode === "fullPageUpdate"
        ? recommendedGenerationSectionIds(
            catalog,
            compiled.availableComponentNames
          )
        : [];
    const latestUserContent = JSON.stringify({
      request: messages.at(-1)!.content,
      context: recommendedSectionIds.length
        ? { ...(compiled.context as object), recommendedSectionIds }
        : compiled.context,
      ...(mode === "create" && context.preparation
        ? { preparation: context.preparation }
        : {}),
      ...(context.validationFeedback
        ? { validationFeedback: context.validationFeedback }
        : {}),
    });
    const input = [
      ...conversationHistory,
      { role: "user" as const, content: latestUserContent },
    ];
    const requestBody = {
      model,
      stream: true,
      max_output_tokens: maxOutputTokens,
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name: modeConfig.schemaName,
          strict: true,
          schema: compiled.jsonSchema,
        },
      },
    };
    if (mode === "section") {
      log("[layout generation] Section prompt", {
        correlationId,
        mode,
        taskId: context.task?.taskId,
        sectionId: context.task?.sectionId,
        instructions,
        userPrompt: messages.at(-1)!.content,
        task: context.task,
        sharedIntent: context.sharedIntent,
        validationFeedback: context.validationFeedback,
      });
    }
    const serializedRequestBody = JSON.stringify(requestBody);
    const historyBytes = jsonBytes(conversationHistory);
    log("[layout generation] Gateway request", {
      correlationId,
      mode,
      ...(mode === "create" ? { preparation: context.preparation } : {}),
      taskId: context.task?.taskId,
      model,
      promptContractVersion: prompts.contractVersion,
      requestBodyBytes: utf8Bytes(serializedRequestBody),
      requestBodyCharacters: serializedRequestBody.length,
      instructionsBytes: utf8Bytes(instructions),
      historyMessageCount: conversationHistory.length,
      historyBytes,
      latestUserContentBytes: utf8Bytes(latestUserContent),
      currentLayoutBytes: jsonBytes(compiled.context),
      inputBytes: jsonBytes(input),
      schema: schemaStats,
      componentCount: componentStats.length,
      components: componentStats,
      maxOutputTokens: requestBody.max_output_tokens,
      isBlankPage: compiled.isBlankPage,
    });
    phase = "gateway-fetch";
    const outputStream = onFullPageUpdateStep
      ? compiled.streamFullPageUpdate?.(
          onFullPageUpdateStep,
          onFullPageUpdateSection
        )
      : onCreationContent
        ? compiled.stream?.(onCreationContent)
        : undefined;
    let streamed = false;
    const outputText = await requestGenerationOutput({
      utf8Bytes,
      serializedRequestBody,
      transport,
      model,
      maxOutputTokens,
      signal: controller.signal,
      correlationId,
      log: (message, details) =>
        log(message, {
          correlationId,
          mode,
          taskId: context.task?.taskId,
          sectionId: context.task?.sectionId,
          ...details,
        }),
      onDelta: outputStream
        ? async (delta) => {
            streamed = true;
            phase = "parse-and-validate";
            try {
              await outputStream.write(delta);
            } catch (cause) {
              streamFailure = true;
              throw cause;
            }
          }
        : undefined,
    });
    outputBytes = utf8Bytes(outputText);
    log(`[layout generation] ${modeConfig.responseLabel} response`, {
      correlationId,
      mode,
      taskId: context.task?.taskId,
      sectionId: context.task?.sectionId,
      outputText,
    });
    // Revealed sections do not imply full-page acceptance. Check the entire response.
    try {
      phase = "parse-and-validate";
      if (streamed) {
        outputStream?.finish();
      }
      const accepted = compiled.parseResponse(outputText);
      log("[layout generation] Validation outcome", {
        correlationId,
        mode,
        taskId: context.task?.taskId,
        sectionId: context.task?.sectionId,
        validationOutcome: "accepted",
        outputCharacters: outputText.length,
      });
      controller.signal.throwIfAborted();
      return parseGenerationResult(
        { type: modeConfig.eventType, ...accepted },
        mode
      );
    } catch (error) {
      const message =
        mode !== "create" && error instanceof z.ZodError
          ? error.issues
              .slice(0, 12)
              .map((issue) => `${issue.code} at ${issue.path.join("/")}`)
              .join("; ")
          : error instanceof Error
            ? error.message
            : String(error);
      log("[layout generation] Validation outcome", {
        correlationId,
        mode,
        taskId: context.task?.taskId,
        sectionId: context.task?.sectionId,
        validationOutcome: "rejected",
        error: message,
      });
      throw new Error(
        `Generated ${modeConfig.resultLabel} failed validation: ${message}`
      );
    }
  } catch (error) {
    if (streamFailure) {
      phase = "parse-and-validate";
    } else if (error instanceof GenerationGatewayError) {
      phase = error.phase;
      outputBytes = error.outputBytes;
    }
    const failure = controller.signal.aborted
      ? controller.signal.reason
      : error;
    const message =
      failure instanceof Error ? failure.message : String(failure);
    log("[layout generation] Generation failed", {
      correlationId,
      model,
      phase,
      isBlankPage: compiled.isBlankPage,
      outputBytes,
      aborted: controller.signal.aborted,
      error: message,
      stack: failure instanceof Error ? failure.stack : undefined,
    });
    throw new GenerationError(
      message,
      phase === "parse-and-validate" && !controller.signal.aborted,
      (error instanceof GenerationGatewayError && error.transport) ||
        controller.signal.aborted,
      message.slice(0, GENERATION_REPAIR_FEEDBACK_MAX_CHARACTERS)
    );
  } finally {
    clearTimeout(deadline);
    signal.removeEventListener("abort", abort);
    controller.abort();
  }
};
