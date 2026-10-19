import type { Content, EditCollectionRef } from "./authored.ts";

/** Internal transport contracts only; these are never stored in a layout. */
type ConversationMessage = {
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

export type GenerationPreparation = {
  question: string | null;
  translationMode: "defaultOnly" | "translate" | null;
  cardCounts: {
    componentType: string;
    /**
     * Zero-based occurrence of this type in depth-first page order, including
     * linked instances; null means every manual instance.
     */
    instanceIndex: number | null;
    count: number;
  }[];
};

/** Relative anchors always refer to an existing sibling in the same collection. */
export type EditAnchor =
  | {
      /** Place the component at a collection boundary. */
      position: "start" | "end";
    }
  | {
      /** Place the component relative to an existing sibling. */
      position: "before" | "after";
      /** The sibling used as the anchor. */
      componentId: string;
    };

/**
 * No move operation exists: cards may only reorder within their own collection.
 * Insertion keys correlate generated props with planned insertions, never saved Ids.
 */
export type PlannedStructureEdit =
  | {
      /** Insert a new component. */
      kind: "insert";
      /** A temporary key linking this insertion to generated content. */
      insertionKey: string;
      /** The registered type of the new component. */
      componentType: string;
      /** The collection receiving the new component. */
      collection: EditCollectionRef;
      /** Where to place the new component in its collection. */
      anchor: EditAnchor;
    }
  | {
      /** Remove an existing component. */
      kind: "remove";
      /** The component to remove. */
      componentId: string;
    }
  | {
      /** Reposition an existing component within its collection. */
      kind: "reorder";
      /** The component to reposition. */
      componentId: string;
      /** Where to place the component in its current collection. */
      anchor: EditAnchor;
    };

export type SectionEditTask = {
  /** A stable Id for tracking and deduplicating this task. */
  taskId: string;
  /** Existing section Id, or an application-reserved Id for a new section. */
  sectionId: string;
  /** Existing component Ids this task may edit. */
  targetComponentIds: string[];
  /** The requested changes within this section. */
  instructions: string;
  /** A short, plain-language description shown in chat. */
  description?: string;
  /** Locale overrides may be authored only after translations were requested or approved. */
  translationMode?: "defaultOnly" | "translate";
  /** Planned insertions, removals, and reorders. */
  structuralOperations: PlannedStructureEdit[];
  /** Task Ids that must commit successfully before this task runs. */
  dependsOn: string[];
  /** Whether this task needs generated copy or new component values. */
  generateContent?: boolean;
};

export type SectionEditPlan = {
  /** The request category used to validate whether edits are appropriate. */
  intent:
    "content" | "globalStyle" | "mixed" | "conversation" | "clarification";
  /** The planner's conversational response. */
  text: string;
  /** A question to resolve before applying any edits, or null. */
  clarification: string | null;
  /** Guidance for changes requiring the global style editor, or null. */
  globalStyleGuidance: string | null;
  /** Unsupported parts of a batch, kept alongside actual section outcomes. */
  limitations: string | null;
  /** Shared guidance for coordinating changes across sections. */
  sharedIntent: string;
  /** Section tasks to execute after plan validation. */
  tasks: SectionEditTask[];
};

/** Paths are JSON pointers relative to authored props, never root/editor storage. */
export type AuthoredValueEdit =
  | {
      /** Assign an explicit authored value. */
      kind: "set";
      /** A JSON pointer relative to the component's authored props. */
      path: string;
      /** The replacement value, including null when permitted. */
      value: unknown;
    }
  | {
      /** Remove an optional authored value. */
      kind: "unset";
      /** A JSON pointer relative to the component's authored props. */
      path: string;
    };

/** Generated descendants omit identities. Application code allocates every new Id. */
export type NewEditComponent = {
  /** The registered type of the new component. */
  type: string;
  /** Generated authored props without saved identities or child slots. */
  authoredValues: Record<string, unknown>;
  /** Optional authored paths to remove instead of using library defaults. */
  unsetPaths?: string[];
  /** Child collections to create with this component. */
  slots: {
    /** A JSON pointer to the slot relative to the component's props. */
    slotPath: string;
    /** New children in slot order. */
    components: NewEditComponent[];
  }[];
};

export type SectionEditOperation =
  | {
      /** Change authored values on an existing component. */
      kind: "update";
      /** The component to update. */
      componentId: string;
      /** Explicit value assignments and removals. */
      changes: AuthoredValueEdit[];
    }
  | {
      /** Insert a generated component. */
      kind: "insert";
      /** The temporary key from the planned insertion. */
      insertionKey: string;
      /** The collection receiving the generated component. */
      collection: EditCollectionRef;
      /** Where to place the generated component. */
      anchor: EditAnchor;
      /** New authored content whose Ids will be assigned by the application. */
      component: NewEditComponent;
    }
  | Exclude<PlannedStructureEdit, { kind: "insert" }>;

export type SectionEditResult = {
  /** The task that produced these operations. */
  taskId: string;
  /** The section these operations may change. */
  sectionId: string;
  /** The edits to validate and apply to the latest layout. */
  operations: SectionEditOperation[];
};

/**
 * Execution invariants (enforced by plan validation and materialization):
 * - Targets and anchors resolve by Id against the latest layout, within task scope.
 * - MainContent, opaque trees and inactive linked-card storage are protected.
 * - Updates change only explicit authored paths; unset is distinct from null.
 * - Arrays replace explicit authored values, never merge by index or type.
 * - Existing Ids, unmentioned props, bindings, translations, metadata, root and
 *   zones survive. An ancestor operation cannot erase a protected descendant.
 * - New Ids are application-owned. No operation changes global settings.
 * - Dependencies must be acyclic; a dependency succeeds only after local commit.
 * - A task commits at most once per turn, after resolution and preservation checks.
 */
export type SectionTaskOutcome = {
  /** The task that finished. */
  taskId: string;
  /** The section associated with the task. */
  sectionId: string;
  /** The task's final execution state. */
  status: "applied" | "failed" | "skipped" | "cancelled";
  /** A short explanation of the outcome. */
  message: string;
};
