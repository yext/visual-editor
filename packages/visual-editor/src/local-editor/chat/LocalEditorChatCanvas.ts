import { isDeepEqual } from "../../utils/deepEqual.ts";
import type { Data } from "@puckeditor/core";
import type { GeneratedContent } from "../types.ts";
import { clonePuckResolveData } from "../../internal/utils/clonePuckResolveData.ts";
import { rejectZones } from "../../internal/generation/authored.ts";

export type ChatCanvasAdapter = {
  read: () => Data;
  resolve: (data: Data) => Promise<Data>;
  validate: (data: Data, candidate: Data) => void;
  commit: (data: Data, baseline: Data) => void;
};

/** An isolated candidate produces exactly one history entry after resolution. */
export class LocalEditorChatCanvas {
  private adapter?: ChatCanvasAdapter;
  private baseline?: Data;
  private revision = 0;
  private subscribers = new Set<() => void>();
  onError: (error: unknown) => void = () => {};
  subscribe = (listener: () => void) => {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  };
  getReady = () => this.ready;
  get ready() {
    return !!this.adapter;
  }
  attach(adapter: ChatCanvasAdapter) {
    this.finish();
    this.adapter = adapter;
    this.notify();
    return () => {
      if (this.adapter !== adapter) return;
      const active = !!this.baseline;
      this.finish();
      this.adapter = undefined;
      this.notify();
      if (active)
        this.onError(new Error("Editor context changed during generation."));
    };
  }
  begin() {
    if (!this.adapter) throw new Error("The editor is not ready.");
    const data = this.adapter.read();
    rejectZones(data as any);
    this.baseline = clonePuckResolveData(data);
    this.revision++;
    return serializeChatLayout(this.baseline);
  }
  async commit(data: GeneratedContent | null) {
    const revision = this.revision;
    const adapter = this.adapter;
    const baseline = this.baseline;
    const assertCurrent = () => {
      if (
        !baseline ||
        this.baseline !== baseline ||
        revision !== this.revision ||
        adapter !== this.adapter
      )
        throw new Error("Generation cancelled or editor context changed.");
      if (!isDeepEqual(adapter!.read(), baseline))
        throw new Error(
          "Layout changed during generation. Try the request again."
        );
    };
    assertCurrent();
    if (!data) {
      this.finish();
      return;
    }
    const candidate = clonePuckResolveData({
      ...baseline!,
      content: data.content,
    });
    adapter!.validate(candidate, candidate);
    const resolved = await adapter!.resolve(clonePuckResolveData(candidate));
    assertCurrent();
    adapter!.validate(resolved, candidate);
    adapter!.commit(
      { ...resolved, root: baseline!.root, zones: baseline!.zones },
      baseline!
    );
    this.finish();
  }
  finish() {
    this.revision++;
    this.baseline = undefined;
  }
  private notify() {
    this.subscribers.forEach((listener) => listener());
  }
}

/** Preserve serializable configuration, including unexposed authored properties. */
export const serializeChatLayout = (data: Data): GeneratedContent => {
  rejectZones(data as any);
  return JSON.parse(JSON.stringify({ content: data.content }));
};
