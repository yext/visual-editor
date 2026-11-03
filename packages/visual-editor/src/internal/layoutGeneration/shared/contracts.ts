import type { GenerationSettings } from "../../../types/generationSettings.ts";
import type { GenerationPromptBundle } from "../../../types/generationPrompts.ts";
import type { Data } from "@puckeditor/core";
import type { PuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import type {
  SectionEditPlan,
  SectionEditResult,
  SectionEditTask,
} from "../workflows/edits/types.ts";
import type {
  FullPageUpdateResult,
  FullPageUpdateStep,
} from "../workflows/fullPageUpdate/contracts.ts";
import type { GenerationPreparation } from "../workflows/fullPageGeneration/preparationContracts.ts";
import type { ModelTransport } from "../transport/modelTransport.ts";
import type { Content } from "./authoredValues.ts";

export type GenerationDiagnostics = {
  log: (message: string, details: object) => void;
  report: (kind: "diagnostics" | "error", details: object) => void;
};

export type GenerationEnvironment = {
  prompts: GenerationPromptBundle;
  generationSettings: GenerationSettings;
  model: string;
  catalog: PuckGenerationCatalog;
  locales: string[];
  transport: ModelTransport;
  diagnostics: GenerationDiagnostics;
};

export const consoleGenerationDiagnostics: GenerationDiagnostics = {
  log: (message, details) => console.debug(message, details),
  report: (kind, details) =>
    kind === "error"
      ? console.error("[layout generation] Error", details)
      : console.debug("[layout generation] Diagnostics", details),
};

/** Internal transport contracts only; these are never stored in a layout. */
export type ConversationMessage = {
  /** Who sent this message. */
  role: "user" | "assistant";
  /** The message text. */
  content: string;
};

type RequestContext = {
  /** The layout being generated or edited. */
  layoutId: string;
  /** Conversation history ending with the current user request. */
  messages: ConversationMessage[];
  /** The latest canvas data for this request. */
  currentData: Content;
  /** Bounded validation feedback for one repair attempt. */
  validationFeedback?: string;
};

export type LayoutGenerationRequest = RequestContext &
  (
    | {
        /** Resolve translation choices and card counts without compiling page schemas. */
        mode: "prepare";
      }
    | {
        /** Rework the entire existing page using streamed section decisions. */
        mode: "fullPageUpdate";
      }
    | {
        /** Generate a fresh page. */
        mode: "create";
        preparation?: GenerationPreparation;
      }
    | {
        /** Plan edits to an existing page. */
        mode: "plan";
        /** The component selected before the turn started. */
        selectedComponentId: string | null;
      }
    | {
        /** Generate edits for one planned section task. */
        mode: "section";
        /** The validated task to execute. */
        task: SectionEditTask;
        /** Shared guidance for coordinating changes across sections. */
        sharedIntent: string;
      }
  );

/** Validated mode results; these are never persisted as layout data. */
export type GenerationResult =
  | { type: "fullPageUpdated"; text: string; result: FullPageUpdateResult }
  | { type: "prepared"; preparation: GenerationPreparation }
  | { type: "accepted"; text: string; spec: { content: any[] } | null }
  | { type: "planned"; plan: SectionEditPlan }
  | { type: "section-result"; result: SectionEditResult };

/** A turn supplies execution and cancellation without depending on a transport. */
export type GenerationRequestExecutor = (
  request: LayoutGenerationRequest,
  signal?: AbortSignal,
  onCreationContent?: (content: Content) => Promise<void>,
  onFullPageUpdateStep?: (
    step: FullPageUpdateStep,
    index: number
  ) => Promise<void>,
  onFullPageUpdateSection?: (sectionId: string) => Promise<void>
) => Promise<GenerationResult>;

/** Page workflows return conversation outcomes separately from progress updates. */
export type PageGenerationResult = { text: string; clarification: boolean };

export type GenerationTurn = {
  layoutId: string;
  currentData: Content;
  messages: ConversationMessage[];
  signal: AbortSignal;
  active: () => boolean;
  request: GenerationRequestExecutor;
};

export type GenerationCanvasAdapter = {
  /** Inspect a snapshot without changing editor state. */
  inspect?: (data: Data) => object;
  /** Read the latest editor data. */
  read: () => Data;
  /** Resolve an isolated candidate through Puck. */
  resolve: (data: Data) => Promise<Data>;
  /** Check that fresh generation survived resolution. */
  validate: (data: Data, candidate: Data) => void;
  /** Bring an existing section into view before resolving its replacement. */
  prepareSection?: (sectionId: string, signal: AbortSignal) => Promise<void>;
  /** Display validated data without history or persistence. */
  preview?: (data: Data, options?: { follow: boolean }) => void;
  /** Apply data and record one undo entry from its baseline. */
  commit: (data: Data, baseline: Data) => void;
};
