import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";

type CaptureArgs = {
  templateName: string;
  url: string;
  headed: boolean;
  manualOnBlock: boolean;
};

type SkippedStylesheetRecord = {
  sourceUrl: string;
  reason: string;
};

type CaptureManifest = {
  templateName: string;
  requestedUrl: string;
  finalUrl: string;
  title: string;
  capturedAtIso: string;
  captureMode: "headless" | "headed";
  botChallengeDetected: boolean;
  popupObstructionDetected: boolean;
  popupObstructionReasons: string[];
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
const POPUP_DIALOG_SELECTOR =
  'dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"]';
const POPUP_MAX_ALLOWED_VIEWPORT_COVERAGE = 0.25;
const POPUP_MIN_Z_INDEX = 1000;
const CAPTURE_VIEWPORT = { width: 1440, height: 2400 } as const;

const usage = `Usage:
  pnpm run capture-page-artifacts [--headed] [--manual-on-block] <templateName> <url>

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
      continue;
    }

    positionalArgs.push(arg);
  }

  const [templateName, url] = positionalArgs;

  if (!templateName || !url || positionalArgs.length !== 2) {
    throw new Error(usage);
  }

  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  return { templateName, url, headed, manualOnBlock };
}

function sanitizeTemplateName(templateName: string): string {
  return templateName
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

type PageBlockInspection = {
  blocked: boolean;
  reasons: string[];
  previewText: string;
};

type CaptureMode = "headless" | "headed";

type CaptureAttemptResult =
  | {
      kind: "captured";
      captureMode: CaptureMode;
      linkedStyleCount: number;
      inlineStyleBlockCount: number;
      combinedCssBytes: number;
    }
  | {
      kind: "retry-headed-for-manual-clearance";
      blockKind: "bot rejection" | "popup obstruction";
      reasons: string[];
    };

async function inspectForBotChallenge(
  page: Page,
  mainResponseStatus?: number,
): Promise<PageBlockInspection> {
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
  blockKind: string,
  initialInspection: PageBlockInspection,
  inspectPage: (page: Page) => Promise<PageBlockInspection>,
) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      `Potential ${blockKind} detected (${initialInspection.reasons.join(", ")}), but manual recovery requires an interactive terminal.`,
    );
  }

  console.log(
    `Potential ${blockKind} detected (${initialInspection.reasons.join(", ")}). Clear it in the opened browser window, then press Enter here to retry detection.`,
  );

  if (initialInspection.previewText) {
    console.log(`Blocked page preview: ${initialInspection.previewText}`);
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
        throw new Error(`Capture aborted after ${blockKind}.`);
      }

      await settlePageLoad(page, 5_000);
      const inspection = await inspectPage(page);

      if (answer === "capture" || !inspection.blocked) {
        return inspection;
      }

      console.log(
        `Page still looks blocked by ${blockKind} (${inspection.reasons.join(", ")}).`,
      );
      if (inspection.previewText) {
        console.log(`Current page preview: ${inspection.previewText}`);
      }
    }
  } finally {
    readline.close();
  }
}

async function inspectForObscuringPopup(
  page: Page,
): Promise<PageBlockInspection> {
  return (await page.evaluate(String.raw`
    (() => {
      const popupDialogSelector = ${JSON.stringify(POPUP_DIALOG_SELECTOR)};
      const popupMaxAllowedViewportCoverage = ${POPUP_MAX_ALLOWED_VIEWPORT_COVERAGE};
      const popupMinZIndex = ${POPUP_MIN_Z_INDEX};
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const viewportArea = viewportWidth * viewportHeight;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      const candidates = Array.from(document.querySelectorAll("body *"));
      const reasons = [];
      let previewText = "";

      const clampedIntersectionArea = (rect) => {
        const visibleWidth = Math.max(
          0,
          Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0),
        );
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
        );

        return visibleWidth * visibleHeight;
      };

      for (const candidate of candidates) {
        if (!(candidate instanceof HTMLElement)) {
          continue;
        }

        const style = window.getComputedStyle(candidate);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.pointerEvents === "none"
        ) {
          continue;
        }

        const rect = candidate.getBoundingClientRect();
        if (rect.width < 200 || rect.height < 120) {
          continue;
        }

        const isDialogLike = candidate.matches(popupDialogSelector);
        const zIndex = Number.parseInt(style.zIndex || "0", 10);
        const isOverlayLike =
          (style.position === "fixed" || style.position === "sticky") &&
          Number.isFinite(zIndex) &&
          zIndex >= popupMinZIndex;

        if (!isDialogLike && !isOverlayLike) {
          continue;
        }

        const visibleArea = clampedIntersectionArea(rect);
        if (visibleArea === 0) {
          continue;
        }

        const coverage = visibleArea / viewportArea;
        const intersectsCenter =
          rect.left <= centerX &&
          rect.right >= centerX &&
          rect.top <= centerY &&
          rect.bottom >= centerY;
        const attachedToTop = rect.top <= 0;
        const attachedToBottom = rect.bottom >= viewportHeight;
        const spansAlmostFullWidth = rect.width >= viewportWidth * 0.9;
        const looksLikeBanner =
          spansAlmostFullWidth &&
          rect.height <= 140 &&
          (attachedToTop || attachedToBottom);

        if (looksLikeBanner && coverage < popupMaxAllowedViewportCoverage) {
          continue;
        }

        if (coverage <= popupMaxAllowedViewportCoverage && !intersectsCenter) {
          continue;
        }

        const label =
          candidate.getAttribute("aria-label") ||
          candidate.getAttribute("id") ||
          candidate.className ||
          candidate.tagName.toLowerCase();
        reasons.push(
          String(label).replace(/\\s+/g, " ").trim().slice(0, 80) +
            " coverage=" +
            coverage.toFixed(2) +
            " position=" +
            style.position +
            " z=" +
            (style.zIndex || "auto"),
        );

        if (!previewText) {
          previewText = (candidate.innerText || "")
            .replace(/\\s+/g, " ")
            .trim()
            .slice(0, 300);
        }
      }

      return {
        blocked: reasons.length > 0,
        reasons,
        previewText,
      };
    })()
  `)) as PageBlockInspection;
}

async function runCaptureAttempt({
  captureMode,
  manualOnBlock,
  url,
  sanitizedTemplateName,
  tempOutputDir,
  baseOutputDir,
  repoRoot,
}: {
  captureMode: CaptureMode;
  manualOnBlock: boolean;
  url: string;
  sanitizedTemplateName: string;
  tempOutputDir: string;
  baseOutputDir: string;
  repoRoot: string;
}): Promise<CaptureAttemptResult> {
  const linkedStyles = new Map<string, { body: string }>();
  const skippedStylesheets = new Map<string, string>();
  const browser = await chromium.launch({
    headless: captureMode === "headless",
  });

  try {
    const context = await browser.newContext({
      viewport: CAPTURE_VIEWPORT,
    });

    try {
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

      const challengeInspection = await inspectForBotChallenge(
        page,
        initialResponse?.status(),
      );
      const botChallengeDetected = challengeInspection.blocked;
      let manualInterventionUsed = false;

      if (challengeInspection.blocked) {
        if (!manualOnBlock) {
          throw new Error(
            `Potential bot rejection detected (${challengeInspection.reasons.join(", ")}). Re-run with --manual-on-block to open a headed browser and complete the challenge manually.`,
          );
        }

        if (captureMode === "headless") {
          console.log(
            `Potential bot rejection detected (${challengeInspection.reasons.join(", ")}). Relaunching in headed mode for manual clearance.`,
          );

          return {
            kind: "retry-headed-for-manual-clearance",
            blockKind: "bot rejection",
            reasons: challengeInspection.reasons,
          };
        }

        await waitForManualClearance(
          page,
          "bot rejection",
          challengeInspection,
          (currentPage) => inspectForBotChallenge(currentPage),
        );
        manualInterventionUsed = true;
      }

      const popupInspection = await inspectForObscuringPopup(page);
      const popupObstructionDetected = popupInspection.blocked;
      const popupObstructionReasons = [...popupInspection.reasons];

      if (popupInspection.blocked) {
        if (!manualOnBlock) {
          throw new Error(
            `Large popup obscuring content detected (${popupInspection.reasons.join(", ")}). Re-run with --manual-on-block to open a headed browser and clear it manually.`,
          );
        }

        if (captureMode === "headless") {
          console.log(
            `Large popup obscuring content detected (${popupInspection.reasons.join(", ")}). Relaunching in headed mode for manual clearance.`,
          );

          return {
            kind: "retry-headed-for-manual-clearance",
            blockKind: "popup obstruction",
            reasons: popupInspection.reasons,
          };
        }

        await waitForManualClearance(
          page,
          "popup obstruction",
          popupInspection,
          inspectForObscuringPopup,
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
                entries.push({ type: "inline", cssText });
              }
            }
          }

          return entries;
        })()
      `)) as Array<
        | { type: "link"; sourceUrl: string }
        | { type: "inline"; cssText: string }
      >;

      const combinedCssSections: string[] = [];
      const emittedLinkedUrls = new Set<string>();
      let inlineStyleBlockCount = 0;

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

        inlineStyleBlockCount += 1;
        combinedCssSections.push(
          `/* Inline style block ${inlineStyleBlockCount} */\n${source.cssText}\n`,
        );
      }

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
        templateName: sanitizedTemplateName,
        requestedUrl: url,
        finalUrl,
        title,
        capturedAtIso: new Date().toISOString(),
        captureMode,
        botChallengeDetected,
        popupObstructionDetected,
        popupObstructionReasons,
        manualInterventionUsed,
        viewport: {
          ...CAPTURE_VIEWPORT,
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
        `Captured artifacts to ${path.relative(repoRoot, baseOutputDir)} (linked css: ${linkedStyles.size}, inline css blocks: ${inlineStyleBlockCount}, combined css bytes: ${Buffer.byteLength(combinedCss, "utf8")}).`,
      );

      return {
        kind: "captured",
        captureMode,
        linkedStyleCount: linkedStyles.size,
        inlineStyleBlockCount,
        combinedCssBytes: Buffer.byteLength(combinedCss, "utf8"),
      };
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const { templateName, url, headed, manualOnBlock } = parseArgs(process.argv);
  const sanitizedTemplateName = sanitizeTemplateName(templateName);

  if (!sanitizedTemplateName) {
    throw new Error(`Invalid templateName: ${templateName}`);
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
    "registry",
    sanitizedTemplateName,
    ".captured-artifact",
  );
  await mkdir(baseOutputDir, { recursive: true });
  const tempOutputDir = path.join(
    baseOutputDir,
    `.capture-tmp-${Date.now()}-${process.pid}`,
  );
  await mkdir(tempOutputDir, { recursive: true });

  try {
    let captureMode: CaptureMode = headed ? "headed" : "headless";

    while (true) {
      const result = await runCaptureAttempt({
        captureMode,
        manualOnBlock,
        url,
        sanitizedTemplateName,
        tempOutputDir,
        baseOutputDir,
        repoRoot,
      });

      if (result.kind === "captured") {
        break;
      }

      console.log(
        `Retrying in headed mode after ${result.blockKind} (${result.reasons.join(", ")}).`,
      );
      captureMode = "headed";
    }
  } finally {
    await rm(tempOutputDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
