import type { Data } from "@puckeditor/core";
import { isDeepEqual } from "../../../../utils/deepEqual.ts";
import { clonePuckResolveData } from "../../../utils/clonePuckResolveData.ts";
import type { GenerationCanvasAdapter } from "../../shared/contracts.ts";

/** One creation owns its accepted prefix, preview updates, and final undo entry. */
export class CreationSession {
  private active = true;
  private accepted?: Data;
  private candidate?: Data;
  sectionCount = 0;

  constructor(
    private adapter: GenerationCanvasAdapter,
    private baseline: Data
  ) {}

  async reveal(content: Pick<Data, "content">, signal: AbortSignal) {
    const assertActive = () => {
      signal.throwIfAborted();
      if (!this.active) {
        throw new Error("Creation session ended.");
      }
    };
    assertActive();
    const candidate = clonePuckResolveData({
      ...this.baseline,
      content: content.content,
    });
    // A later chunk may append sections, but cannot rewrite already shown copy,
    // identities, bindings, or scaffold properties.
    if (this.accepted) {
      const prefix = clonePuckResolveData(candidate);
      prefix.content = prefix.content.slice(0, this.candidate!.content.length);
      this.candidate!.content.forEach((previous, index) => {
        const next = prefix.content[index];
        if (previous.type === "MainContent" && next?.type === "MainContent") {
          next.props.content = next.props.content.slice(
            0,
            previous.props.content.length
          );
        }
      });
      if (!isDeepEqual(prefix.content, this.candidate!.content)) {
        throw new Error("Generation changed an already applied section.");
      }
      if (isDeepEqual(candidate.content, this.candidate!.content)) {
        return;
      }
    }
    const count = candidate.content.reduce(
      (total, component) =>
        total +
        (component.type === "MainContent" ? component.props.content.length : 1),
      0
    );
    if (!count) {
      return;
    }
    this.adapter.validate(candidate, candidate);
    const before = this.adapter.read();
    const resolved = await this.adapter.resolve(
      clonePuckResolveData(candidate)
    );
    assertActive();
    if (!isDeepEqual(before, this.adapter.read())) {
      throw new Error(
        "Layout changed during generation. Try the request again."
      );
    }
    this.adapter.validate(resolved, candidate);
    const data = {
      ...resolved,
      root: this.baseline.root,
      zones: this.baseline.zones,
    };
    this.adapter.preview?.(data);
    this.candidate = candidate;
    this.accepted = data;
    this.sectionCount = count;
  }

  finish() {
    if (!this.active) {
      return;
    }
    this.active = false;
    if (this.accepted) {
      this.adapter.commit(this.accepted, this.baseline);
    }
  }

  discard() {
    if (!this.active) {
      return;
    }
    this.active = false;
    // Restore an unsaved preview only while this adapter still displays it.
    // A newly selected layout must never receive the previous session's baseline.
    if (this.accepted && isDeepEqual(this.adapter.read(), this.accepted)) {
      this.adapter.preview?.(this.baseline);
    }
  }
}
