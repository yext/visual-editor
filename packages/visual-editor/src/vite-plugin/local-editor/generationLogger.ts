import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

/** One JSONL file per server session, named for its first log entry. */
export const createGenerationLogger = (directory: string) => {
  let filename: string | undefined;
  return (message: string, details: object) => {
    const timestamp = new Date().toISOString();
    if (!filename) {
      mkdirSync(directory, { recursive: true });
      filename = path.join(directory, timestamp.replaceAll(":", "-") + ".log");
    }
    appendFileSync(
      filename,
      JSON.stringify({ timestamp, message, ...details }) + "\n",
      "utf8"
    );
  };
};
