/** Incremental JSON decoding. Containers are visible to the consumer while open,
 * but only completed values trigger callbacks. No synthetic closing JSON is used. */
type Path = (string | number)[];
type Frame = {
  value: any;
  path: Path;
  state: "keyOrEnd" | "key" | "colon" | "valueOrEnd" | "value" | "commaOrEnd";
  key?: string;
};

export class CreationStream {
  private frames: Frame[] = [];
  private token = "";
  private string = false;
  private escaped = false;
  private key = false;
  private started = false;
  private ended = false;
  value: any;

  constructor(private completed: (path: Path, value: any) => Promise<void>) {}

  private path(): Path {
    const frame = this.frames.at(-1);
    return frame
      ? [
          ...frame.path,
          Array.isArray(frame.value) ? frame.value.length : frame.key!,
        ]
      : [];
  }

  private assign(value: any) {
    const frame = this.frames.at(-1);
    if (!frame) {
      if (this.started) throw new Error("Multiple creation JSON values.");
      this.started = true;
      this.value = value;
    } else if (Array.isArray(frame.value)) {
      frame.value.push(value);
    } else {
      Object.defineProperty(frame.value, frame.key!, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }

  private async finishValue(path: Path, value: any) {
    const parent = this.frames.at(-1);
    if (parent) parent.state = "commaOrEnd";
    else this.ended = true;
    await this.completed(path, value);
  }

  async write(delta: string) {
    for (let index = 0; index < delta.length; index++) {
      const char = delta[index];
      if (this.token) {
        if (this.string) {
          this.token += char;
          if (this.escaped) this.escaped = false;
          else if (char === "\\") this.escaped = true;
          else if (char === '"') {
            const value = JSON.parse(this.token);
            this.token = "";
            this.string = false;
            if (this.key) {
              const frame = this.frames.at(-1)!;
              if (Object.hasOwn(frame.value, value))
                throw new Error("Duplicate creation JSON key.");
              frame.key = value;
              frame.state = "colon";
              this.key = false;
            } else {
              const path = this.path();
              this.assign(value);
              await this.finishValue(path, value);
            }
          }
          continue;
        }
        if (!/[\s,\]}]/.test(char)) {
          this.token += char;
          continue;
        }
        const value = JSON.parse(this.token);
        this.token = "";
        const path = this.path();
        this.assign(value);
        await this.finishValue(path, value);
        index--;
        continue;
      }
      if (/\s/.test(char)) continue;
      if (this.ended) throw new Error("Content after creation JSON.");
      const frame = this.frames.at(-1);
      if (frame?.state === "colon") {
        if (char !== ":") throw new Error("Expected creation JSON colon.");
        frame.state = "value";
        continue;
      }
      if (frame?.state === "commaOrEnd" && char === ",") {
        frame.state = Array.isArray(frame.value) ? "value" : "key";
        continue;
      }
      const closing =
        frame && char === (Array.isArray(frame.value) ? "]" : "}");
      if (
        closing &&
        ["commaOrEnd", "keyOrEnd", "valueOrEnd"].includes(frame.state)
      ) {
        this.frames.pop();
        await this.finishValue(frame.path, frame.value);
        continue;
      }
      if (frame?.state === "key" || frame?.state === "keyOrEnd") {
        if (char !== '"') throw new Error("Expected creation JSON key.");
        this.key = true;
      } else if (frame && !["value", "valueOrEnd"].includes(frame.state)) {
        throw new Error("Invalid creation JSON separator.");
      }
      if (char === '"') {
        this.token = char;
        this.string = true;
      } else if (char === "{" || char === "[") {
        const path = this.path();
        const value = char === "[" ? [] : {};
        this.assign(value);
        this.frames.push({
          value,
          path,
          state: char === "[" ? "valueOrEnd" : "keyOrEnd",
        });
      } else if (!this.key && /[\d\-tfn]/.test(char)) {
        this.token = char;
      } else {
        throw new Error("Invalid creation JSON value.");
      }
    }
  }

  finish() {
    if (!this.ended || this.frames.length || this.token) {
      throw new Error("Incomplete creation JSON.");
    }
  }
}
