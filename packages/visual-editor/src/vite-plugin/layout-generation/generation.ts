import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { isBlankGenerationPage } from "../../internal/generation/isBlankGenerationPage.ts";
import { buildGenerationPrompt } from "./generationValidation.ts";
import {
  GENERATION_ATTEMPT_DEADLINE_MS,
  FRESH_PAGE_OUTPUT_TOKEN_BUDGET,
  GENERATION_PREPARATION_OUTPUT_TOKEN_BUDGET,
  EDIT_PLANNING_OUTPUT_TOKEN_BUDGET,
  SECTION_EDIT_OUTPUT_TOKEN_BUDGET,
} from "./generationLimits.ts";
import {
  readJsonRequestBody,
  sendJsonResponse,
} from "../local-editor/server.ts";
import type { Content } from "../../internal/generation/authored.ts";
import {
  sectionEditTaskSchema,
  generationPreparationSchema,
} from "../../internal/generation/editProtocolSchema.ts";
import { compileGenerationPreparation } from "./generationPreparation.ts";
import {
  compileEditPlanningSchema,
  buildEditPlanningPrompt,
} from "./editPlanning.ts";
import {
  compileSectionEditSchema,
  buildSectionEditPrompt,
} from "./sectionEditSchema.ts";
import {
  GENERATION_GATEWAY_URL,
  GenerationGatewayError,
  requestGenerationOutput,
} from "./generationGateway.ts";

type GenerationOptions = {
  model: string;
  loadContext: (layoutId: string) => Promise<
    | {
        catalog: PuckGenerationCatalog;
        locales: string[];
      }
    | undefined
  >;
  log: (message: string, details: object) => void;
};

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
  Buffer.byteLength(JSON.stringify(value), "utf8");

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
        descriptionBytes: Buffer.byteLength(component.description ?? ""),
        defaultPropsBytes: jsonBytes(component.defaultProps ?? {}),
        authoredPropCount: Object.keys(component.props.shape ?? {}).length,
      };
    });

/** Streams the company gateway output as validated native Puck data. */
export const handleLocalEditorGenerationRequest = async (
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
  { model, loadContext, log }: GenerationOptions
): Promise<void> => {
  const clientCorrelationId =
    request.headers?.["x-visual-editor-correlation-id"];
  const correlationId =
    typeof clientCorrelationId === "string" &&
    /^[0-9a-f-]{36}$/i.test(clientCorrelationId)
      ? clientCorrelationId
      : randomUUID();
  const requestDetails = {
    correlationId,
    method: request.method,
    url: request.url,
    contentType: request.headers?.["content-type"],
    contentLength: request.headers?.["content-length"],
    bodySource: request.body === undefined ? "stream" : "middleware",
  };
  log("[local-editor generation] Request received", requestDetails);
  const rejectRequest = (error: string, status: number, details = {}) => {
    log("[local-editor generation] Request rejected", {
      ...requestDetails,
      status,
      error,
      ...details,
    });
    sendJsonResponse(response, { error }, status);
  };
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    rejectRequest("Use POST to generate a spec.", 405);
    return;
  }

  const body = await readJsonRequestBody(request, 1024 * 1024);
  if (!body.ok) {
    rejectRequest(
      body.status === 413
        ? "Conversation request is too large."
        : "Request must contain valid JSON.",
      body.status,
      { bodyBytes: body.bodyBytes, parseError: body.parseError }
    );
    return;
  }
  const { payload, bodyBytes } = body;
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
    messages.at(-1).role !== "user"
  ) {
    rejectRequest(
      "A conversation with user/assistant messages ending in a non-empty user message is required.",
      400,
      { bodyBytes }
    );
    return;
  }

  const layoutId =
    payload && typeof payload === "object" && "layoutId" in payload
      ? payload.layoutId
      : undefined;
  if (typeof layoutId !== "string" || !layoutId.trim()) {
    rejectRequest("A layoutId is required.", 400);
    return;
  }
  const context = await loadContext(layoutId);
  if (!context) {
    rejectRequest("Unknown generation layoutId.", 400);
    return;
  }
  const { catalog, locales } = context;

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
    rejectRequest("currentData must contain native Puck content.", 400);
    return;
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
    rejectRequest("Invalid generation mode or edit request context.", 400);
    return;
  }
  const mode = modeRequest.data.mode ?? "create";
  const modeConfig = GENERATION_MODES[mode];
  Object.assign(requestDetails, {
    mode,
    taskId: modeRequest.data.task?.taskId,
    sectionId: modeRequest.data.task?.sectionId,
  });
  if ((mode === "plan" || mode === "section") && currentData === undefined) {
    rejectRequest("Follow-up requests require the latest currentData.", 400);
    return;
  }
  if (mode === "section" && !modeRequest.data.task) {
    rejectRequest("A section task is required.", 400);
    return;
  }
  if (
    (mode === "create" || mode === "prepare") &&
    !isBlankGenerationPage(
      (currentData as Content | undefined) ?? { content: [] }
    )
  ) {
    rejectRequest(
      "Generation requires a blank page. Clear the layout before generating a new page.",
      409
    );
    return;
  }
  const conversationHistory = messages.slice(0, -1);
  log("[local-editor generation] Request payload measured", {
    ...requestDetails,
    mode,
    taskId: modeRequest.data.task?.taskId,
    layoutId,
    bodyBytes,
    messageCount: messages.length,
    historyMessageCount: conversationHistory.length,
    historyContentBytes: conversationHistory.reduce(
      (total, message) => total + Buffer.byteLength(message.content, "utf8"),
      0
    ),
    latestPromptBytes: Buffer.byteLength(messages.at(-1).content, "utf8"),
    currentDataBytes: currentData === undefined ? 0 : jsonBytes(currentData),
    locales,
  });

  if (mode === "plan" || mode === "section") {
    log("[local-editor generation] Submitted layout", {
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
        instructions: buildEditPlanningPrompt(),
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
        instructions: buildSectionEditPrompt(),
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
    log("[local-editor generation] Schema compiled", {
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
    rejectRequest(error instanceof Error ? error.message : String(error), 422, {
      schemaCompilationDurationMs: Date.now() - compileStartedAt,
      componentCount: Object.keys(catalog.data.components).length,
      locales,
    });
    return;
  }
  const controller = new AbortController();
  const abort = () => controller.abort(new Error("Generation cancelled."));
  response.once("close", abort);
  const deadline = setTimeout(
    () =>
      controller.abort(
        new Error(
          "Generation exceeded the five-minute deadline. Try a smaller request."
        )
      ),
    GENERATION_ATTEMPT_DEADLINE_MS
  );
  let started = false;
  const startStream = () => {
    if (controller.signal.aborted) {
      throw controller.signal.reason;
    }
    if (started) {
      return;
    }
    started = true;
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    response.setHeader("X-Visual-Editor-Generation", modeConfig.protocol);
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("X-Accel-Buffering", "no");
    response.flushHeaders();
  };
  const writeEvent = (event: object) => {
    startStream();
    response.write(JSON.stringify(event) + "\n");
  };
  const writeUsage: Parameters<typeof requestGenerationOutput>[0]["onUsage"] = (
    usage
  ) => {
    if (!usage) {
      return;
    }
    log("[local-editor generation] Usage", {
      correlationId,
      usage,
      reasoningTokens: usage.output_tokens_details?.reasoning_tokens ?? 0,
    });
    const cachedInput = usage.input_tokens_details?.cached_tokens ?? 0;
    writeEvent({
      type: "usage",
      usage: {
        cachedInput,
        uncachedInput: Math.max(0, (usage.input_tokens ?? 0) - cachedInput),
        output: usage.output_tokens ?? 0,
      },
    });
  };
  let phase = "prepare";
  let outputBytes = 0;
  try {
    if (compiled.localResult) {
      writeEvent({ type: modeConfig.eventType, ...compiled.localResult });
      response.end();
      return;
    }
    phase = "build-prompt";
    const instructions =
      compiled.instructions ??
      buildGenerationPrompt(catalog, compiled.availableComponentNames, locales);
    const componentStats =
      mode === "prepare" ? [] : componentDiagnostics(catalog);
    const schemaStats = summarizeSchema(compiled.jsonSchema);
    phase = "build-request";
    startStream();
    const latestUserContent = JSON.stringify({
      request: messages.at(-1).content,
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
      log("[local-editor generation] Section prompt", {
        correlationId,
        mode,
        taskId: modeRequest.data.task?.taskId,
        sectionId: modeRequest.data.task?.sectionId,
        instructions,
        userPrompt: messages.at(-1).content,
        task: modeRequest.data.task,
        sharedIntent: modeRequest.data.sharedIntent,
        validationFeedback: modeRequest.data.validationFeedback,
      });
    }
    const serializedRequestBody = JSON.stringify(requestBody);
    const historyBytes = jsonBytes(conversationHistory);
    log("[local-editor generation] Gateway request", {
      correlationId,
      mode,
      taskId: modeRequest.data.task?.taskId,
      model,
      gatewayUrl: GENERATION_GATEWAY_URL,
      requestBodyBytes: Buffer.byteLength(serializedRequestBody, "utf8"),
      requestBodyCharacters: serializedRequestBody.length,
      instructionsBytes: Buffer.byteLength(instructions, "utf8"),
      historyMessageCount: conversationHistory.length,
      historyBytes,
      latestUserContentBytes: Buffer.byteLength(latestUserContent, "utf8"),
      currentLayoutBytes: jsonBytes(compiled.context),
      inputBytes: jsonBytes(input),
      schema: schemaStats,
      componentCount: componentStats.length,
      components: componentStats,
      maxOutputTokens: requestBody.max_output_tokens,
      isBlankPage: compiled.isBlankPage,
    });
    phase = "gateway-fetch";
    const outputText = await requestGenerationOutput({
      serializedRequestBody,
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
    });
    outputBytes = Buffer.byteLength(outputText, "utf8");
    log(`[local-editor generation] ${modeConfig.responseLabel} response`, {
      correlationId,
      mode,
      taskId: modeRequest.data.task?.taskId,
      sectionId: modeRequest.data.task?.sectionId,
      outputText,
    });
    // Only the complete, validated candidate reaches the editor bridge.
    try {
      phase = "parse-and-validate";
      const accepted = compiled.parseResponse(outputText);
      log("[local-editor generation] Validation outcome", {
        correlationId,
        mode,
        taskId: modeRequest.data.task?.taskId,
        sectionId: modeRequest.data.task?.sectionId,
        validationOutcome: "accepted",
        outputCharacters: outputText.length,
      });
      writeEvent({ type: modeConfig.eventType, ...accepted });
      response.end();
      return;
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
      log("[local-editor generation] Validation outcome", {
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
    if (error instanceof GenerationGatewayError) {
      phase = error.phase;
      outputBytes = error.outputBytes;
    }
    const failure = controller.signal.aborted
      ? controller.signal.reason
      : error;
    const message =
      failure instanceof Error ? failure.message : String(failure);
    log("[local-editor generation] Generation failed", {
      correlationId,
      model,
      phase,
      isBlankPage: compiled.isBlankPage,
      outputBytes,
      aborted: controller.signal.aborted,
      error: message,
      stack: failure instanceof Error ? failure.stack : undefined,
    });
    if (!response.destroyed) {
      if (started) {
        response.write(
          JSON.stringify({
            type: "error",
            error: message,
            transport:
              (error instanceof GenerationGatewayError && error.transport) ||
              controller.signal.aborted,
            retryable:
              phase === "parse-and-validate" && !controller.signal.aborted,
            ...(phase === "parse-and-validate"
              ? { validationFeedback: message.slice(0, 4_000) }
              : {}),
          }) + "\n"
        );
        response.end();
      } else {
        sendJsonResponse(
          response,
          { error: message },
          controller.signal.aborted ? 504 : 502
        );
      }
    }
  } finally {
    clearTimeout(deadline);
    response.off("close", abort);
    controller.abort();
  }
};
