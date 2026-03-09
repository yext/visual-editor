import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";

type CaptureArgs = {
  clientName: string;
  url: string;
  headed: boolean;
  manualOnBlock: boolean;
};

type SkippedStylesheetRecord = {
  sourceUrl: string;
  reason: string;
};

type CaptureManifest = {
  clientName: string;
  requestedUrl: string;
  finalUrl: string;
  title: string;
  capturedAtIso: string;
  captureMode: "headless" | "headed";
  botChallengeDetected: boolean;
  manualInterventionUsed: boolean;
  viewport: {
    width: number;
    height: number;
  };
  files: {
    html: string;
    screenshot: string;
    cssCombined: string;
  };
  skippedStylesheets: SkippedStylesheetRecord[];
};

const BOT_REJECTION_PATTERN =
  /captcha|verify(?:ing)?(?:\s+that)?\s+(?:you(?:'re| are)?\s+)?human|are you human|checking (?:your )?browser|access denied|unusual traffic|security check|attention required|press (?:and|&) hold|cf[-_ ]challenge|enable javascript and cookies/i;

const usage = `Usage:
  pnpm run capture-page-artifacts [--headed] [--manual-on-block] <clientName> <url>

Example:
  pnpm run capture-page-artifacts galaxy-grill https://www.galaxygrill.com
  pnpm run capture-page-artifacts --manual-on-block galaxy-grill https://www.galaxygrill.com`;

function parseArgs(argv: string[]): CaptureArgs {
  const args = argv.slice(2);
  const normalizedArgs = args[0] === "--" ? args.slice(1) : args;
  const positionalArgs: string[] = [];
  let headed = false;
  let manualOnBlock = false;

  for (const arg of normalizedArgs) {
    if (arg === "--headed") {
      headed = true;
      continue;
    }

    if (arg === "--manual-on-block") {
      manualOnBlock = true;
      headed = true;
      continue;
    }

    positionalArgs.push(arg);
  }

  const [clientName, url] = positionalArgs;

  if (!clientName || !url || positionalArgs.length !== 2) {
    throw new Error(usage);
  }

  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  return { clientName, url, headed, manualOnBlock };
}

function sanitizeClientName(clientName: string): string {
  return clientName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}

function isLikelyCss(
  contentType: string | undefined,
  resourceType: string,
): boolean {
  if (resourceType === "stylesheet") {
    return true;
  }

  if (!contentType) {
    return false;
  }

  return contentType.toLowerCase().includes("text/css");
}

async function settlePageLoad(page: Page, networkIdleTimeoutMs = 10_000) {
  try {
    await page.waitForLoadState("domcontentloaded", { timeout: 5_000 });
  } catch {
    // The page may already be past DOMContentLoaded or still transitioning.
  }

  try {
    await page.waitForLoadState("networkidle", {
      timeout: networkIdleTimeoutMs,
    });
  } catch {
    // Some pages never reach network idle due to background polling.
  }
}

type ChallengeInspection = {
  blocked: boolean;
  reasons: string[];
  previewText: string;
};

async function inspectForBotChallenge(
  page: Page,
  mainResponseStatus?: number,
): Promise<ChallengeInspection> {
  const snapshot = (await page.evaluate(() => ({
    title: document.title ?? "",
    bodyText:
      document.body?.innerText?.replace(/\s+/g, " ").trim().slice(0, 4_000) ??
      "",
    htmlSnippet:
      document.documentElement?.outerHTML
        ?.replace(/\s+/g, " ")
        .slice(0, 4_000) ?? "",
  }))) as {
    title: string;
    bodyText: string;
    htmlSnippet: string;
  };

  const reasons: string[] = [];

  if (mainResponseStatus && [403, 429, 503].includes(mainResponseStatus)) {
    reasons.push(`main-document-status=${mainResponseStatus}`);
  }

  const currentUrl = page.url();
  if (BOT_REJECTION_PATTERN.test(snapshot.title)) {
    reasons.push("title-matched-bot-challenge");
  }
  if (BOT_REJECTION_PATTERN.test(snapshot.bodyText)) {
    reasons.push("body-text-matched-bot-challenge");
  }
  if (BOT_REJECTION_PATTERN.test(snapshot.htmlSnippet)) {
    reasons.push("html-matched-bot-challenge");
  }
  if (
    BOT_REJECTION_PATTERN.test(currentUrl) ||
    currentUrl.includes("__cf_chl")
  ) {
    reasons.push("url-matched-bot-challenge");
  }

  return {
    blocked: reasons.length > 0,
    reasons,
    previewText: snapshot.bodyText.slice(0, 300),
  };
}

async function waitForManualClearance(
  page: Page,
  initialInspection: ChallengeInspection,
) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      `Potential bot rejection detected (${initialInspection.reasons.join(", ")}), but manual recovery requires an interactive terminal.`,
    );
  }

  console.log(
    `Potential bot rejection detected (${initialInspection.reasons.join(", ")}). Complete the challenge or load the destination page in the opened browser window, then press Enter here to retry detection.`,
  );

  if (initialInspection.previewText) {
    console.log(`Challenge page preview: ${initialInspection.previewText}`);
  }

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const answer = (
        await readline.question(
          'Press Enter to retry, type "capture" to continue with the current page anyway, or "abort" to stop: ',
        )
      )
        .trim()
        .toLowerCase();

      if (answer === "abort") {
        throw new Error("Capture aborted after bot rejection.");
      }

      await settlePageLoad(page, 5_000);
      const inspection = await inspectForBotChallenge(page);

      if (answer === "capture" || !inspection.blocked) {
        return inspection;
      }

      console.log(
        `Page still looks blocked (${inspection.reasons.join(", ")}).`,
      );
      if (inspection.previewText) {
        console.log(`Current page preview: ${inspection.previewText}`);
      }
    }
  } finally {
    readline.close();
  }
}

async function main() {
  const { clientName, url, headed, manualOnBlock } = parseArgs(process.argv);
  const sanitizedClientName = sanitizeClientName(clientName);

  if (!sanitizedClientName) {
    throw new Error(`Invalid clientName: ${clientName}`);
  }

  const scriptPath = fileURLToPath(import.meta.url);
  const repoRoot = path.resolve(
    path.dirname(scriptPath),
    "..",
    "..",
    "..",
    "..",
  );

  const baseOutputDir = path.join(
    repoRoot,
    "starter",
    "src",
    "components",
    "custom",
    sanitizedClientName,
    ".captured-artifact",
  );
  await mkdir(baseOutputDir, { recursive: true });
  const tempOutputDir = path.join(
    baseOutputDir,
    `.capture-tmp-${Date.now()}-${process.pid}`,
  );
  await mkdir(tempOutputDir, { recursive: true });

  const linkedStyles = new Map<
    string,
    { body: string; status: number; contentType: string }
  >();
  const skippedStylesheets = new Map<string, string>();

  const browser = await chromium.launch({ headless: !headed });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 2400 },
    });
    const page = await context.newPage();

    page.on("response", async (response) => {
      const responseUrl = response.url();
      const request = response.request();
      const resourceType = request.resourceType();
      const headers = response.headers();
      const contentType = headers["content-type"];

      if (!isLikelyCss(contentType, resourceType)) {
        return;
      }

      if (
        linkedStyles.has(responseUrl) ||
        skippedStylesheets.has(responseUrl)
      ) {
        return;
      }

      if (!response.ok()) {
        skippedStylesheets.set(responseUrl, `HTTP ${response.status()}`);
        return;
      }

      try {
        const body = await response.text();
        linkedStyles.set(responseUrl, {
          body,
          status: response.status(),
          contentType: contentType ?? "",
        });
      } catch (error) {
        skippedStylesheets.set(
          responseUrl,
          `Failed to read stylesheet body: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    const initialResponse = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await settlePageLoad(page);

    let challengeInspection = await inspectForBotChallenge(
      page,
      initialResponse?.status(),
    );
    let manualInterventionUsed = false;

    if (challengeInspection.blocked) {
      if (!manualOnBlock) {
        throw new Error(
          `Potential bot rejection detected (${challengeInspection.reasons.join(", ")}). Re-run with --manual-on-block to open a headed browser and complete the challenge manually.`,
        );
      }

      challengeInspection = await waitForManualClearance(
        page,
        challengeInspection,
      );
      manualInterventionUsed = true;
    }

    const html = await page.content();
    const title = await page.title();
    const finalUrl = page.url();
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    const styleSourcesInDomOrder = (await page.evaluate(String.raw`
      (() => {
        const entries = [];
        let inlineOrdinal = 0;
        const nodes = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"));
        for (const node of nodes) {
          if (node instanceof HTMLLinkElement) {
            const href = node.href?.trim();
            if (href) {
              entries.push({ type: "link", sourceUrl: href });
            }
            continue;
          }

          if (node instanceof HTMLStyleElement) {
            const cssText = (node.textContent ?? "").trim();
            if (cssText.length > 0) {
              entries.push({ type: "inline", cssText, ordinal: inlineOrdinal });
              inlineOrdinal += 1;
            }
          }
        }

        return entries;
      })()
    `)) as Array<
      | { type: "link"; sourceUrl: string }
      | { type: "inline"; cssText: string; ordinal: number }
    >;

    const combinedCssSections: string[] = [];
    const emittedLinkedUrls = new Set<string>();

    for (const source of styleSourcesInDomOrder) {
      if (source.type === "link") {
        const record = linkedStyles.get(source.sourceUrl);
        if (!record) {
          continue;
        }

        combinedCssSections.push(
          `/* Source: ${source.sourceUrl} */\n${record.body.trim()}\n`,
        );
        emittedLinkedUrls.add(source.sourceUrl);
        continue;
      }

      combinedCssSections.push(
        `/* Inline style block ${source.ordinal + 1} */\n${source.cssText}\n`,
      );
    }

    // Preserve previously captured linked styles that were not present in the final DOM snapshot order.
    for (const [sourceUrl, record] of linkedStyles.entries()) {
      if (emittedLinkedUrls.has(sourceUrl)) {
        continue;
      }
      combinedCssSections.push(
        `/* Source: ${sourceUrl} */\n${record.body.trim()}\n`,
      );
    }

    const combinedCss = combinedCssSections.join("\n");
    const combinedCssFilename = "combined.css";

    const pageFilename = "page.html";
    const screenshotFilename = "screenshot.png";

    await writeFile(
      path.join(tempOutputDir, pageFilename),
      `${html}\n`,
      "utf8",
    );
    await writeFile(
      path.join(tempOutputDir, combinedCssFilename),
      `${combinedCss}\n`,
      "utf8",
    );
    await writeFile(
      path.join(tempOutputDir, screenshotFilename),
      screenshotBuffer,
    );

    const manifest: CaptureManifest = {
      clientName: sanitizedClientName,
      requestedUrl: url,
      finalUrl,
      title,
      capturedAtIso: new Date().toISOString(),
      captureMode: headed ? "headed" : "headless",
      botChallengeDetected:
        challengeInspection.blocked || manualInterventionUsed,
      manualInterventionUsed,
      viewport: {
        width: 1440,
        height: 2400,
      },
      files: {
        html: pageFilename,
        screenshot: screenshotFilename,
        cssCombined: combinedCssFilename,
      },
      skippedStylesheets: Array.from(skippedStylesheets.entries()).map(
        ([sourceUrl, reason]) => ({
          sourceUrl,
          reason,
        }),
      ),
    };

    await writeFile(
      path.join(tempOutputDir, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );

    for (const filename of [
      pageFilename,
      screenshotFilename,
      combinedCssFilename,
      "manifest.json",
    ]) {
      await rename(
        path.join(tempOutputDir, filename),
        path.join(baseOutputDir, filename),
      );
    }

    console.log(
      `Captured artifacts to ${path.relative(repoRoot, baseOutputDir)} (linked css: ${linkedStyles.size}, inline css blocks: ${styleSourcesInDomOrder.filter((source) => source.type === "inline").length}, combined css bytes: ${Buffer.byteLength(combinedCss, "utf8")}).`,
    );

    await context.close();
  } finally {
    await rm(tempOutputDir, { recursive: true, force: true });
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
