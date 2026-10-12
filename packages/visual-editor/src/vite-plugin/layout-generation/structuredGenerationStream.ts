/** Reads completed JSON values without inventing closing braces for partial props. */
export const createStructuredGenerationParser = ({
  onText,
  onValue,
}: {
  onText: (delta: string) => void;
  onValue: (path: string[], value: unknown) => void;
}) => {
  type Frame = {
    path: string[];
    start: number;
    array: boolean;
    key: string;
    index: number;
    phase: "key" | "colon" | "value" | "comma";
  };
  let source = "";
  let offset = 0;
  const frames: Frame[] = [];
  let token:
    | { start: number; path: string[]; key: boolean; string: boolean }
    | undefined;
  let escaped = false;
  let emittedText = "";
  let disabled = false;
  const path = () => {
    const parent = frames.at(-1);
    return parent
      ? [...parent.path, parent.array ? String(parent.index) : parent.key]
      : [];
  };
  const finish = (valuePath: string[], value: unknown) => {
    onValue(valuePath, value);
    const parent = frames.at(-1);
    if (parent) {
      parent.phase = "comma";
      if (parent.array) parent.index++;
    }
  };
  const text = (raw: string) => {
    try {
      const decoded: string = JSON.parse(raw);
      // Do not expose half of a surrogate pair across token boundaries.
      const safe = decoded.replace(/[\uD800-\uDBFF]$/, "");
      if (safe.length > emittedText.length) {
        onText(safe.slice(emittedText.length));
        emittedText = safe;
      }
    } catch {
      // An escape (including \uXXXX) may span several upstream chunks.
    }
  };
  return {
    push(delta: string) {
      if (disabled) return;
      source += delta;
      try {
        for (; offset < source.length; offset++) {
          const char = source[offset];
          if (token) {
            if (token.string) {
              if (escaped) {
                escaped = false;
                continue;
              }
              if (char === "\\") {
                escaped = true;
                continue;
              }
              if (char !== '"') continue;
              const raw = source.slice(token.start, offset + 1);
              const value = JSON.parse(raw);
              if (token.key) {
                const parent = frames.at(-1)!;
                parent.key = value;
                parent.phase = "colon";
              } else {
                if (token.path.length === 1 && token.path[0] === "text")
                  text(raw);
                finish(token.path, value);
              }
              token = undefined;
              continue;
            }
            if (!/[\s,}\]]/.test(char)) continue;
            finish(token.path, JSON.parse(source.slice(token.start, offset)));
            token = undefined;
          }
          if (/\s/.test(char)) continue;
          const parent = frames.at(-1);
          if (char === ":") {
            if (parent) parent.phase = "value";
            continue;
          }
          if (char === ",") {
            if (parent) parent.phase = parent.array ? "value" : "key";
            continue;
          }
          if (char === "{" || char === "[") {
            frames.push({
              path: path(),
              start: offset,
              array: char === "[",
              key: "",
              index: 0,
              phase: char === "[" ? "value" : "key",
            });
            continue;
          }
          if (char === "}" || char === "]") {
            const frame = frames.pop()!;
            finish(
              frame.path,
              JSON.parse(source.slice(frame.start, offset + 1))
            );
            continue;
          }
          token = {
            start: offset,
            path: path(),
            key: parent?.phase === "key",
            string: char === '"',
          };
        }
        if (
          token?.string &&
          !token.key &&
          token.path.length === 1 &&
          token.path[0] === "text"
        ) {
          text(source.slice(token.start) + '"');
        }
      } catch {
        // Final JSON parsing and validation remain authoritative for malformed output.
        disabled = true;
      }
    },
  };
};
