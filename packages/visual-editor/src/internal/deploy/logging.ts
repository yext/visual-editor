import ora from "ora";
import { YextApiResponse } from "./api.ts";

export function logApiCall(
  text: string,
  method: string,
  url: URL,
  verbose: boolean = false
): (res?: YextApiResponse) => void {
  const spinner = text.length > 0 ? ora(text).start() : undefined;
  const finishVerboseLog = verbose ? verboseLogApiCall(method, url) : undefined;

  return (res?: YextApiResponse) => {
    if (spinner) {
      if (res?.ok) {
        spinner.succeed(`${text} ${color("done", true)}`);
      } else {
        spinner.fail(`${text} ${color("error", false)}`);
      }
    }
    finishVerboseLog?.(res);
  };
}

export function verboseLogApiCall(
  method: string,
  url: URL
): (res?: YextApiResponse) => void {
  const displayUrl = new URL(url);
  displayUrl.search = "";

  const spinner = ora({
    text: `[debug] ${method} ${displayUrl}`,
    spinner: "dots",
  }).start();

  return (res?: YextApiResponse) => {
    const success = !!(res?.ok && res?.status < 400);
    const coloredStatus = color(
      res?.status ? String(res?.status) : "error",
      success
    );

    const message = `${spinner.text} ${coloredStatus}`;
    if (success) {
      spinner.succeed(message);
    } else {
      spinner.fail(message);
    }

    if (res?.response) {
      console.error(`[debug] Response Data: ${JSON.stringify(res?.response)}`);
    }
    if (res?.errors && res.errors.length > 0) {
      console.error(`[debug] API Errors: ${JSON.stringify(res?.errors)}`);
    }
  };
}

function color(text: string, success: boolean): string {
  if (!process.stdout.isTTY) {
    return text;
  }
  return `\x1b[${success ? "32" : "31"}m${text}\x1b[0m`;
}
