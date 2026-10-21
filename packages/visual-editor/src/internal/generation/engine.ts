import { z } from "zod";
import type { PuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { isBlankGenerationPage } from "./isBlankGenerationPage.ts";
import { buildGenerationPrompt } from "./generationValidation.ts";
import {
  editPlanningPrompt,
  sectionEditPrompt,
  getModelInstructions,
} from "./prompts.ts";
import {
  GENERATION_ATTEMPT_DEADLINE_MS,
  FRESH_PAGE_OUTPUT_TOKEN_BUDGET,
  GENERATION_PREPARATION_OUTPUT_TOKEN_BUDGET,
  EDIT_PLANNING_OUTPUT_TOKEN_BUDGET,
  SECTION_EDIT_OUTPUT_TOKEN_BUDGET,
} from "./generationLimits.ts";
import type { Content } from "./authored.ts";
import {
  sectionEditTaskSchema,
  generationPreparationSchema,
} from "./editProtocolSchema.ts";
import { compileGenerationPreparation } from "./generationPreparation.ts";
import { compileEditPlanningSchema } from "./editPlanning.ts";
import { compileSectionEditSchema } from "./sectionEditSchema.ts";
import {
  GenerationGatewayError,
  requestGenerationOutput,
} from "./generationGateway.ts";
import type { LayoutGenerationRequest } from "./editProtocol.ts";
import type {
  GenerationEnvironment,
  GenerationTokenUsage,
} from "./environment.ts";
import {
  ChatGenerationError,
  parseGenerationResult,
  type GenerationResult,
} from "./chat/chatGenerationRequest.ts";

const utf8Bytes = (text: string, _encoding?: string) =>
  new TextEncoder().encode(text).byteLength;

const GENERATION_MODES = {
  prepare: {
    maxOutputTokens: GENERATION_PREPARATION_OUTPUT_TOKEN_BUDGET,
    schemaName: "puck_generation_preparation",
    protocol: "section-edits-v1",
    eventType: "prepared",
    responseLabel: "Preparation",
    resultLabel: "preparation",
  },
  create: {
    maxOutputTokens: FRESH_PAGE_OUTPUT_TOKEN_BUDGET,
    schemaName: "puck_generation",
    protocol: "strict-puck-overrides-v2",
    eventType: "accepted",
    responseLabel: "Creation",
    resultLabel: "layout",
  },
  plan: {
    maxOutputTokens: EDIT_PLANNING_OUTPUT_TOKEN_BUDGET,
    schemaName: "puck_edit_plan",
    protocol: "section-edits-v1",
    eventType: "planned",
    responseLabel: "Planning",
    resultLabel: "edit",
  },
  section: {
    maxOutputTokens: SECTION_EDIT_OUTPUT_TOKEN_BUDGET,
    schemaName: "puck_section_edit",
    protocol: "section-edits-v1",
    eventType: "section-result",
    responseLabel: "Section",
    resultLabel: "edit",
  },
};

const jsonBytes = (value: unknown): number =>
  utf8Bytes(JSON.stringify(value), "utf8");

const summarizeSchema = (schema: Record<string, any>) => {
  const summary = {
    bytes: jsonBytes(schema),
    definitions: Object.keys(schema.$defs ?? {}).length,
    references: 0,
    properties: 0,
    unionBranches: 0,
    maximumDepth: 0,
    keywords: {} as Record<string, number>,
  };
  const visit = (value: unknown, depth: number) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return;
    }
    summary.maximumDepth = Math.max(summary.maximumDepth, depth);
    for (const [key, child] of Object.entries(value)) {
      summary.keywords[key] = (summary.keywords[key] ?? 0) + 1;
      if (key === "$ref") {
        summary.references++;
      }
      if (key === "properties" && child && typeof child === "object") {
        summary.properties += Object.keys(child).length;
      }
      if (["anyOf", "oneOf", "allOf"].includes(key) && Array.isArray(child)) {
        summary.unionBranches += child.length;
      }
      if (Array.isArray(child)) {
        child.forEach((item) => visit(item, depth + 1));
      } else {
        visit(child, depth + 1);
      }
    }
  };
  visit(schema, 0);
  return summary;
};

const componentDiagnostics = (catalog: PuckGenerationCatalog) =>
  Object.entries(catalog.data.components)
    .filter(([, component]) => component.generation)
    .map(([name, component]) => {
      let authoredSchemaBytes: number | undefined;
      try {
        authoredSchemaBytes = jsonBytes(
          z.toJSONSchema(component.props, { io: "input" })
        );
      } catch {
        // The compiled strict schema diagnostics below still capture total size.
      }
      return {
        name,
        nestedOnly: component.nestedOnly ?? false,
        authoredSchemaBytes,
        descriptionBytes: utf8Bytes(component.description ?? ""),
        defaultPropsBytes: jsonBytes(component.defaultProps ?? {}),
        authoredPropCount: Object.keys(component.props.shape ?? {}).length,
      };
    });

export const executeGeneration = async (
  payload: LayoutGenerationRequest,
  { model, catalog, locales, transport, diagnostics }: GenerationEnvironment,
  signal: AbortSignal,
  correlationId: string,
  onUsage: (usage: GenerationTokenUsage) => void,
  onCreationContent?: (content: Content) => Promise<void>
): Promise<GenerationResult> => {
  if (!model?.trim())
    throw new ChatGenerationError(
      "AI page generation requires a configured model."
    );
  signal.throwIfAborted();
  const log = diagnostics.log;
  const bodyBytes = jsonBytes(payload);
  const requestDetails = { correlationId };
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
    throw new ChatGenerationError(message, false, false, message, status);
  };
  const messages =
    payload && typeof payload === "object" && "messages" in payload
      ? payload.messages
      : undefined;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.some(
      (message) =>
        !message ||
        typeof message !== "object" ||
        (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string" ||
        !message.content.trim()
    ) ||
    messages.at(-1)!.role !== "user"
  ) {
    return rejectRequest(
      "A conversation with user/assistant messages ending in a non-empty user message is required.",
      400,
      { bodyBytes }
    );
  }

  const layoutId =
    payload && typeof payload === "object" && "layoutId" in payload
      ? payload.layoutId
      : undefined;
  if (typeof layoutId !== "string" || !layoutId.trim()) {
    return rejectRequest("A layoutId is required.", 400);
  }

  const currentData =
    payload && typeof payload === "object" && "currentData" in payload
      ? payload.currentData
      : undefined;
  if (
    currentData !== undefined &&
    (!currentData ||
      typeof currentData !== "object" ||
      !("content" in currentData) ||
      !Array.isArray(currentData.content))
  ) {
    return rejectRequest("currentData must contain native Puck content.", 400);
  }
  const modeRequest = z
    .object({
      mode: z.enum(["prepare", "create", "plan", "section"]).optional(),
      preparation: generationPreparationSchema.optional(),
      selectedComponentId: z.string().min(1).nullable().optional(),
      task: sectionEditTaskSchema.optional(),
      sharedIntent: z.string().optional(),
      validationFeedback: z.string().max(4_000).optional(),
    })
    .passthrough()
    .safeParse(payload);
  if (!modeRequest.success) {
    return rejectRequest(
      "Invalid generation mode or edit request context.",
      400
    );
  }
  const mode = modeRequest.data.mode ?? "create";
  const modeConfig = GENERATION_MODES[mode];
  Object.assign(requestDetails, {
    mode,
    taskId: modeRequest.data.task?.taskId,
    sectionId: modeRequest.data.task?.sectionId,
  });
  if ((mode === "plan" || mode === "section") && currentData === undefined) {
    return rejectRequest(
      "Follow-up requests require the latest currentData.",
      400
    );
  }
  if (mode === "section" && !modeRequest.data.task) {
    return rejectRequest("A section task is required.", 400);
  }
  if (
    (mode === "create" || mode === "prepare") &&
    !isBlankGenerationPage(
      (currentData as Content | undefined) ?? { content: [] }
    )
  ) {
    return rejectRequest(
      "Generation requires a blank page. Clear the layout before generating a new page.",
      409
    );
  }
  const conversationHistory = messages.slice(0, -1);
  log("[layout generation] Request payload measured", {
    ...requestDetails,
    mode,
    taskId: modeRequest.data.task?.taskId,
    layoutId,
    bodyBytes,
    messageCount: messages.length,
    historyMessageCount: conversationHistory.length,
    historyContentBytes: conversationHistory.reduce(
      (total, message) => total + utf8Bytes(message.content, "utf8"),
      0
    ),
    latestPromptBytes: utf8Bytes(messages.at(-1)!.content, "utf8"),
    currentDataBytes: currentData === undefined ? 0 : jsonBytes(currentData),
    locales,
  });

  if (mode === "plan" || mode === "section") {
    log("[layout generation] Submitted layout", {
      correlationId,
      mode,
      taskId: modeRequest.data.task?.taskId,
      sectionId: modeRequest.data.task?.sectionId,
      currentData,
    });
  }

  let compiled: {
    jsonSchema: Record<string, any>;
    context: unknown;
    availableComponentNames: string[];
    isBlankPage: boolean;
    instructions?: string;
    localResult?: object;
    parseResponse: (text: string) => object;
    stream?: (onContent: (content: Content) => Promise<void>) => {
      write: (delta: string) => Promise<void>;
      finish: () => void;
    };
  };
  const compileStartedAt = Date.now();
  try {
    if (mode === "prepare") {
      compiled = compileGenerationPreparation(catalog, locales);
    } else if (mode === "plan") {
      const planner = compileEditPlanningSchema(
        catalog,
        locales,
        currentData as Content,
        modeRequest.data.selectedComponentId
      );
      compiled = {
        ...planner,
        isBlankPage: false,
        instructions: editPlanningPrompt,
        parseResponse: (text) => ({ plan: planner.parseResponse(text) }),
      };
    } else if (mode === "section") {
      const section = compileSectionEditSchema(
        catalog,
        locales,
        currentData as Content,
        modeRequest.data.task!,
        modeRequest.data.sharedIntent
      );
      compiled = {
        ...section,
        isBlankPage: false,
        instructions: sectionEditPrompt,
        localResult: section.localResult
          ? { result: section.localResult }
          : undefined,
        parseResponse: (text) => ({ result: section.parseResponse(text) }),
      };
    } else {
      compiled = compileGenerationSchema(
        catalog,
        locales,
        currentData as Content | undefined,
        modeRequest.data.preparation
      );
    }
    log("[layout generation] Schema compiled", {
      correlationId,
      mode,
      taskId: modeRequest.data.task?.taskId,
      layoutId,
      compilationDurationMs: Date.now() - compileStartedAt,
      isBlankPage: compiled.isBlankPage,
      availableComponentCount: compiled.availableComponentNames.length,
      availableComponentNames: compiled.availableComponentNames,
      schema: summarizeSchema(compiled.jsonSchema),
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
  if (signal.aborted) abort();
  const deadline = setTimeout(
    () =>
      controller.abort(
        new Error(
          "Generation exceeded the five-minute deadline. Try a smaller request."
        )
      ),
    GENERATION_ATTEMPT_DEADLINE_MS
  );
  const writeUsage: Parameters<typeof requestGenerationOutput>[0]["onUsage"] = (
    usage
  ) => {
    if (!usage || controller.signal.aborted) return;
    log("[layout generation] Usage", { correlationId, usage });
    const cachedInput = usage.input_tokens_details?.cached_tokens ?? 0;
    onUsage({
      cachedInput,
      uncachedInput: Math.max(0, (usage.input_tokens ?? 0) - cachedInput),
      output: usage.output_tokens ?? 0,
    });
  };
  let phase = "prepare";
  let outputBytes = 0;
  let creationFailure = false;
  try {
    if (compiled.localResult) {
      return parseGenerationResult(
        { type: modeConfig.eventType, ...compiled.localResult },
        mode
      );
    }
    phase = "build-prompt";
    const instructions = getModelInstructions({
      model,
      instructions:
        compiled.instructions ??
        buildGenerationPrompt(
          catalog,
          compiled.availableComponentNames,
          locales
        ),
    });
    const componentStats =
      mode === "prepare" ? [] : componentDiagnostics(catalog);
    const schemaStats = summarizeSchema(compiled.jsonSchema);
    phase = "build-request";
    const latestUserContent = JSON.stringify({
      request: messages.at(-1)!.content,
      context: compiled.context,
      ...(mode === "create" && modeRequest.data.preparation
        ? { preparation: modeRequest.data.preparation }
        : {}),
      ...(modeRequest.data.validationFeedback
        ? { validationFeedback: modeRequest.data.validationFeedback }
        : {}),
    });
    const input = [
      ...conversationHistory,
      { role: "user" as const, content: latestUserContent },
    ];
    const requestBody = {
      model,
      stream: true,
      max_output_tokens: modeConfig.maxOutputTokens,
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
        taskId: modeRequest.data.task?.taskId,
        sectionId: modeRequest.data.task?.sectionId,
        instructions,
        userPrompt: messages.at(-1)!.content,
        task: modeRequest.data.task,
        sharedIntent: modeRequest.data.sharedIntent,
        validationFeedback: modeRequest.data.validationFeedback,
      });
    }
    const serializedRequestBody = JSON.stringify(requestBody);
    const historyBytes = jsonBytes(conversationHistory);
    log("[layout generation] Gateway request", {
      correlationId,
      mode,
      taskId: modeRequest.data.task?.taskId,
      model,
      requestBodyBytes: utf8Bytes(serializedRequestBody, "utf8"),
      requestBodyCharacters: serializedRequestBody.length,
      instructionsBytes: utf8Bytes(instructions, "utf8"),
      historyMessageCount: conversationHistory.length,
      historyBytes,
      latestUserContentBytes: utf8Bytes(latestUserContent, "utf8"),
      currentLayoutBytes: jsonBytes(compiled.context),
      inputBytes: jsonBytes(input),
      schema: schemaStats,
      componentCount: componentStats.length,
      components: componentStats,
      maxOutputTokens: requestBody.max_output_tokens,
      isBlankPage: compiled.isBlankPage,
    });
    phase = "gateway-fetch";
    const creationStream = onCreationContent
      ? compiled.stream?.(onCreationContent)
      : undefined;
    let streamed = false;
    const outputText = await requestGenerationOutput({
      serializedRequestBody,
      transport,
      model,
      maxOutputTokens: modeConfig.maxOutputTokens,
      signal: controller.signal,
      correlationId,
      log: (message, details) =>
        log(message, {
          correlationId,
          mode,
          taskId: modeRequest.data.task?.taskId,
          sectionId: modeRequest.data.task?.sectionId,
          ...details,
        }),
      onUsage: writeUsage,
      onDelta: creationStream
        ? async (delta) => {
            streamed = true;
            phase = "parse-and-validate";
            try {
              await creationStream.write(delta);
            } catch (cause) {
              creationFailure = true;
              throw cause;
            }
          }
        : undefined,
    });
    outputBytes = utf8Bytes(outputText, "utf8");
    log(`[layout generation] ${modeConfig.responseLabel} response`, {
      correlationId,
      mode,
      taskId: modeRequest.data.task?.taskId,
      sectionId: modeRequest.data.task?.sectionId,
      outputText,
    });
    // Revealed sections do not imply full-page acceptance. Check the entire response.
    try {
      phase = "parse-and-validate";
      if (streamed) creationStream?.finish();
      const accepted = compiled.parseResponse(outputText);
      log("[layout generation] Validation outcome", {
        correlationId,
        mode,
        taskId: modeRequest.data.task?.taskId,
        sectionId: modeRequest.data.task?.sectionId,
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
        taskId: modeRequest.data.task?.taskId,
        sectionId: modeRequest.data.task?.sectionId,
        validationOutcome: "rejected",
        error: message,
      });
      throw new Error(
        `Generated ${modeConfig.resultLabel} failed validation: ${message}`
      );
    }
  } catch (error) {
    if (creationFailure) {
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
    throw new ChatGenerationError(
      message,
      phase === "parse-and-validate" && !controller.signal.aborted,
      (error instanceof GenerationGatewayError && error.transport) ||
        controller.signal.aborted,
      message.slice(0, 4000)
    );
  } finally {
    clearTimeout(deadline);
    signal.removeEventListener("abort", abort);
    controller.abort();
  }
};
