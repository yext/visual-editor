import type { Data } from "@puckeditor/core";
import type { GeneratedContent } from "../types.ts";

export type ChatCanvasAdapter = {
  read: () => Data;
  resolve: (data: Data) => Promise<Data>;
  replace: (data: Data) => void;
  commit: (data: Data, baseline: Data) => void;
};

/** One provisional transaction, independent of the editor's entity/locale lifecycle. */
export class LocalEditorChatCanvas {
  private adapter?: ChatCanvasAdapter;
  private baseline?: Data;
  private active = false;
  private revision = 0;
  private turn = 0;
  private subscribers = new Set<() => void>();
  subscribe = (listener: () => void) => {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  };
  getReady = () => this.ready;
  private previewData: GeneratedContent | null = null;
  private listeners = new Set<() => void>();
  onError: (error: unknown) => void = () => {};

  get ready() {
    return !!this.adapter;
  }

  attach(adapter: ChatCanvasAdapter) {
    this.adapter = adapter;
    this.baseline = this.active ? adapter.read() : undefined;
    this.revision++;
    this.notify();
    if (this.active && this.previewData)
      void this.preview(this.previewData).catch(this.onError);
    return () => {
      if (this.adapter !== adapter) return;
      if (this.active && this.baseline) adapter.replace(this.baseline);
      this.adapter = undefined;
      this.baseline = undefined;
      this.revision++;
      this.notify();
    };
  }

  begin() {
    if (!this.adapter) throw new Error("The editor is not ready.");
    this.active = true;
    this.turn++;
    this.baseline = this.adapter.read();
    this.previewData = null;
    this.revision++;
    return serializeChatLayout(this.baseline);
  }

  async preview(data: GeneratedContent) {
    if (!this.active) return;
    this.previewData = data;
    const revision = ++this.revision;
    const adapter = this.adapter;
    if (!adapter) return;
    try {
      const resolved = await adapter.resolve({
        root: this.baseline!.root,
        content: data.content,
        zones: {},
      });
      if (this.active && revision === this.revision && adapter === this.adapter)
        adapter.replace({ ...resolved, root: this.baseline!.root, zones: {} });
    } catch (error) {
      if (this.active && revision === this.revision && adapter === this.adapter)
        throw error;
    }
  }

  reset() {
    this.revision++;
    this.previewData = null;
    if (this.active && this.baseline) this.adapter?.replace(this.baseline);
  }

  async commit(data: GeneratedContent | null) {
    const turn = this.turn;
    this.reset();
    if (!data) return;
    while (this.active && turn === this.turn) {
      const adapter = this.adapter;
      if (!adapter) {
        await new Promise<void>((resolve) => this.listeners.add(resolve));
        continue;
      }
      const revision = this.revision;
      try {
        const resolved = await adapter.resolve({
          root: this.baseline!.root,
          content: data.content,
          zones: {},
        });
        if (!this.active || turn !== this.turn)
          throw new Error("Generation cancelled.");
        if (adapter !== this.adapter || revision !== this.revision) continue;
        adapter.commit(
          { ...resolved, root: this.baseline!.root, zones: {} },
          this.baseline!
        );
        this.active = false;
        this.baseline = undefined;
        return;
      } catch (error) {
        if (adapter !== this.adapter || revision !== this.revision) continue;
        throw error;
      }
    }
    throw new Error("Generation cancelled.");
  }

  finish() {
    this.reset();
    this.active = false;
    this.turn++;
    this.baseline = undefined;
    this.notify();
  }

  private notify() {
    this.subscribers.forEach((listener) => listener());
    this.listeners.forEach((listener) => listener());
    this.listeners.clear();
  }
}

/** Runtime context and callbacks belong to Puck, not the model's saved layout. */
export const serializeChatLayout = (data: Data): GeneratedContent =>
  JSON.parse(
    JSON.stringify({ content: data.content }, (key, value) =>
      key === "puck" || key === "parentData" || typeof value === "function"
        ? undefined
        : value
    )
  );
