import React from "react";
import { createPortal } from "react-dom";
import { Render } from "@puckeditor/core";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { createYextFieldTransforms } from "../fields/fieldTransforms/index.ts";
import { PreviewWindowContext } from "../hooks/usePreviewWindow.ts";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";
import { EntityTooltipsContext } from "./EntityField.tsx";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";
import { pt } from "../utils/i18n/platform.ts";
import type { BlockPreviewData } from "./blockPreviewData.tsx";

const initialDocument =
  "<!doctype html><html><head></head><body></body></html>";
type FrameState = {
  measured: boolean;
  height: number;
  summary: string;
  empty: boolean;
  error: boolean;
};

/** Clone styles, not scripts or editor markup. Theme updates remain visible while open. */
function copyStyles(
  source: Document,
  destination: Document
): Promise<unknown[]> {
  destination.head
    .querySelectorAll("[data-block-preview-style]")
    .forEach((node) => node.remove());
  const base = destination.createElement("base");
  base.href = source.baseURI;
  base.dataset.blockPreviewStyle = "true";
  destination.head.append(base);
  destination.documentElement.lang = source.documentElement.lang;
  destination.documentElement.dir = source.documentElement.dir;
  destination.documentElement.className = source.documentElement.className;
  destination.documentElement.style.cssText =
    source.documentElement.style.cssText;
  destination.body.className = source.body.className;
  const fontsAndStyles: Promise<unknown>[] = [];
  source.head
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.dataset.blockPreviewStyle = "true";
      if (clone.tagName === "LINK") {
        fontsAndStyles.push(
          new Promise((resolve) => {
            clone.addEventListener("load", resolve, { once: true });
            clone.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 1500);
          })
        );
      }
      destination.head.append(clone);
    });
  const style = destination.createElement("style");
  style.dataset.blockPreviewStyle = "true";
  style.textContent = `html,body{margin:0!important;padding:0!important;overflow:hidden!important}#block-preview-root{display:flow-root;width:100%}.ve-block-preview-stage{display:flow-root;width:100%}.ve-block-preview-stage>.sl-atom:empty{outline:1px dashed #94a3b8}*{caret-color:transparent!important}`;
  destination.head.append(style);
  return Promise.allSettled(fontsAndStyles);
}

export function BlockPreviewFrame({
  value,
  sourceDocument,
  streamDocument,
  templateProps,
  width,
  label,
  onReady,
}: {
  value: BlockPreviewData;
  sourceDocument: Document;
  streamDocument: StreamDocument;
  templateProps: Record<string, any> | undefined;
  width: number;
  label: string;
  onReady: () => void;
}) {
  const { i18n } = useTranslation();
  const [frameDocument, setFrameDocument] = React.useState<Document | null>(
    null
  );
  const [mount, setMount] = React.useState<HTMLElement | null>(null);
  const [stylesReady, setStylesReady] = React.useState(false);
  const [state, setState] = React.useState<FrameState>({
    measured: false,
    height: 0,
    summary: "",
    empty: false,
    error: false,
  });
  const frame = React.useRef<HTMLIFrameElement>(null);
  const viewport = React.useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = React.useState(534);
  React.useLayoutEffect(() => {
    if (!viewport.current) return;
    const measure = () => {
      const size = viewport.current?.getBoundingClientRect().width;
      if (size) setAvailableWidth(size);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);

  const transforms = React.useMemo(
    () => createYextFieldTransforms(streamDocument, i18n.language),
    [streamDocument, i18n.language]
  );
  const scale = availableWidth / width;

  React.useLayoutEffect(() => {
    if (!frameDocument) return;
    let cancelled = false;
    let scheduled = 0;
    const sync = () => {
      void copyStyles(sourceDocument, frameDocument).then(() => {
        if (!cancelled) setStylesReady(true);
      });
    };
    const root = frameDocument.createElement("div");
    root.id = "block-preview-root";
    root.setAttribute("inert", "");
    frameDocument.body.replaceChildren(root);
    setMount(root);
    sync();
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(sync);
    });
    observer.observe(sourceDocument.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    observer.observe(sourceDocument.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "dir", "lang"],
    });
    const prevent = (event: Event) => event.preventDefault();
    frameDocument.addEventListener("click", prevent, true);
    frameDocument.addEventListener("submit", prevent, true);
    return () => {
      cancelled = true;
      cancelAnimationFrame(scheduled);
      observer.disconnect();
      frameDocument.removeEventListener("click", prevent, true);
      frameDocument.removeEventListener("submit", prevent, true);
    };
  }, [frameDocument, sourceDocument]);

  React.useLayoutEffect(() => {
    if (!mount) return;
    const measure = () => {
      const height = mount.getBoundingClientRect().height;
      const next = {
        measured: true,
        height,
        summary: (mount.textContent ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 240),
        empty: height < 2,
        error: !!mount.querySelector("[data-preview-error]"),
      };
      setState((before) =>
        Object.keys(next).every(
          (key) =>
            next[key as keyof FrameState] === before[key as keyof FrameState]
        )
          ? before
          : next
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(mount);
    const mutations = new MutationObserver(measure);
    mutations.observe(mount, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    measure();
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [mount, value, stylesReady]);

  React.useEffect(() => {
    if (stylesReady && state.measured) onReady();
  }, [stylesReady, state.measured, onReady]);

  const message = state.error
    ? pt("blockPreview.unavailable", "Preview unavailable for this block.")
    : !stylesReady || !state.measured
      ? pt("blockPreview.loading", "Loading preview…")
      : state.empty
        ? pt("blockPreview.empty", "No content to preview for this entity.")
        : undefined;
  return (
    <>
      {message && (
        <p className="ve-block-preview-message" role="status">
          {message}
        </p>
      )}
      <div
        ref={viewport}
        className="ve-block-preview-viewport"
        style={{
          height:
            stylesReady && !state.empty && !state.error
              ? Math.max(40, Math.min(560, state.height * scale))
              : 0,
        }}
      >
        <iframe
          ref={frame}
          title={`${label}: ${pt("blockPreview.title", "Preview")}`}
          srcDoc={initialDocument}
          sandbox="allow-same-origin"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={() =>
            setFrameDocument(frame.current?.contentDocument ?? null)
          }
          style={{
            width,
            height: Math.max(900, Math.min(2000, state.height)),
            transform: `scale(${scale})`,
            visibility: stylesReady ? "inherit" : "hidden",
          }}
        />
      </div>
      {state.summary && (
        <p className="ve-block-preview-summary">{state.summary}</p>
      )}
      {mount &&
        frameDocument?.defaultView &&
        createPortal(
          <TemplatePropsContext.Provider
            value={templateProps ?? { document: streamDocument }}
          >
            <PreviewWindowContext.Provider value={frameDocument.defaultView}>
              <ErrorProvider>
                <EntityTooltipsContext.Provider value={undefined}>
                  <ErrorBoundary
                    resetKeys={[value]}
                    fallback={<div data-preview-error="true" />}
                  >
                    <Render
                      config={value.config}
                      data={value.data}
                      metadata={{ streamDocument }}
                      fieldTransforms={transforms}
                    />
                  </ErrorBoundary>
                </EntityTooltipsContext.Provider>
              </ErrorProvider>
            </PreviewWindowContext.Provider>
          </TemplatePropsContext.Provider>,
          mount
        )}
    </>
  );
}
