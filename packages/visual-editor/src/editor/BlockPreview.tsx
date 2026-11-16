import React from "react";
import { createPortal } from "react-dom";
import { createUsePuck, type Config } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";
import { PUCK_PREVIEW_IFRAME_ID } from "../utils/applyTheme.ts";
import { pt } from "../utils/i18n/platform.ts";
import {
  resolveBlockPreview,
  type BlockPreviewData,
} from "./blockPreviewData.tsx";
import { BlockPreviewFrame } from "./BlockPreviewFrame.tsx";

const usePuck = createUsePuck();
const emptyProps = {};
// Weak keys keep previews scoped to the actual config and entity, never another editor's data.
const cache = new WeakMap<
  Config,
  WeakMap<StreamDocument, Map<string, Promise<BlockPreviewData>>>
>();
function cachedPreview(
  config: Config,
  componentId: string,
  document: StreamDocument,
  rootProps: Record<string, unknown>,
  locale: string
) {
  let documents = cache.get(config);
  if (!documents) {
    documents = new WeakMap();
    cache.set(config, documents);
  }
  let entries = documents.get(document);
  if (!entries) {
    entries = new Map();
    documents.set(document, entries);
  }
  const key = JSON.stringify([componentId, locale, rootProps]);
  let value = entries.get(key);
  if (!value) {
    value = new Promise<BlockPreviewData>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Preview resolution timed out")),
        5000
      );
      void resolveBlockPreview(config, componentId, document, rootProps).then(
        (preview) => {
          clearTimeout(timer);
          resolve(preview);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
    entries.set(key, value);
    const ownedEntries = entries;
    void value.catch(() => ownedEntries.delete(key));
    if (entries.size > 32) entries.delete(entries.keys().next().value!);
  }
  return value;
}

export type BlockPreviewTarget = {
  componentId: string;
  label: string;
  anchor: HTMLElement;
};
export function BlockPreview({
  target,
  active,
  onVisibleChange,
  tooltipId,
  onClose,
}: {
  target: BlockPreviewTarget;
  active: boolean;
  onVisibleChange: (visible: boolean) => void;
  tooltipId: string;
  onClose: () => void;
}) {
  const config = usePuck((state) => state.config);
  const rootProps = usePuck(
    (state) => state.appState.data.root.props ?? emptyProps
  );
  const viewport = usePuck(
    (state) => state.appState.ui.viewports.current.width
  );
  const templateProps = React.useContext(TemplatePropsContext);
  const { i18n } = useTranslation();
  const fallbackDocument = React.useMemo(
    () => ({ locale: i18n.language }),
    [i18n.language]
  );
  const streamDocument: StreamDocument =
    templateProps?.document ?? fallbackDocument;
  const request = React.useMemo(
    () => ({
      config,
      componentId: target.componentId,
      streamDocument,
      rootProps,
      locale: i18n.language,
    }),
    [config, target.componentId, streamDocument, rootProps, i18n.language]
  );
  const [resolved, setResolved] = React.useState<{
    request?: typeof request;
    value?: BlockPreviewData;
    error?: boolean;
  }>({});
  const result = resolved.request === request ? resolved : {};
  const [readyValue, setReadyValue] = React.useState<BlockPreviewData>();
  const [hoveredTarget, setHoveredTarget] =
    React.useState<BlockPreviewTarget>();
  // Render immediately, but reveal only a complete preview after deliberate hover.
  const visible =
    active &&
    hoveredTarget === target &&
    (!!result.error || (!!result.value && readyValue === result.value));
  React.useEffect(() => {
    if (!active) {
      setHoveredTarget(undefined);
      return;
    }
    const timer = setTimeout(() => setHoveredTarget(target), 250);
    return () => clearTimeout(timer);
  }, [active, target]);
  React.useLayoutEffect(() => {
    onVisibleChange(visible);
  }, [visible, onVisibleChange]);
  const markReady = React.useCallback(
    () => setReadyValue(result.value),
    [result.value]
  );
  const [position, setPosition] = React.useState({ left: 0, top: 0 });
  const popup = React.useRef<HTMLDivElement>(null);
  const ownerDocument = target.anchor.ownerDocument;
  const mainFrame = ownerDocument.getElementById(
    PUCK_PREVIEW_IFRAME_ID
  ) as HTMLIFrameElement | null;
  const sourceDocument = mainFrame?.contentDocument ?? ownerDocument;
  const sourceWidth =
    typeof viewport === "number"
      ? viewport
      : (mainFrame?.contentWindow?.innerWidth ?? 1200);
  const width = result.value?.wideLayout
    ? Math.max(320, Math.min(sourceWidth, 1920))
    : Math.min(560, Math.max(320, sourceWidth));

  React.useEffect(() => {
    let current = true;
    void cachedPreview(
      request.config,
      request.componentId,
      request.streamDocument,
      request.rootProps,
      request.locale
    ).then(
      (value) => {
        if (current) setResolved({ request, value });
      },
      () => {
        if (current) setResolved({ request, error: true });
      }
    );
    return () => {
      current = false;
    };
  }, [request]);

  React.useLayoutEffect(() => {
    const view = ownerDocument.defaultView;
    if (!view || !popup.current) return;
    const update = () => {
      const anchor = target.anchor.getBoundingClientRect();
      const { height, width } = popup.current!.getBoundingClientRect();
      const left =
        anchor.right + 12 + width <= view.innerWidth - 12
          ? anchor.right + 12
          : Math.max(
              12,
              Math.min(anchor.left - width - 12, view.innerWidth - width - 12)
            );
      setPosition({
        left,
        top: Math.max(12, Math.min(anchor.top, view.innerHeight - height - 12)),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(popup.current);
    view.addEventListener("resize", update);
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    if (active) {
      ownerDocument.addEventListener("scroll", onClose, true);
      ownerDocument.addEventListener("keydown", keyDown, true);
    }
    return () => {
      observer.disconnect();
      view.removeEventListener("resize", update);
      ownerDocument.removeEventListener("scroll", onClose, true);
      ownerDocument.removeEventListener("keydown", keyDown, true);
    };
  }, [ownerDocument, target, active, onClose]);

  return createPortal(
    <div
      ref={popup}
      id={tooltipId}
      role={visible ? "tooltip" : undefined}
      aria-hidden={!visible}
      className="ve-block-preview"
      style={{ ...position, visibility: visible ? "visible" : "hidden" }}
    >
      <div className="ve-block-preview-heading">
        <strong>{target.label}</strong>
        <span>
          {result.value?.sampleLayout
            ? pt("blockPreview.sample", "Sample layout")
            : pt("blockPreview.title", "Preview")}
        </span>
      </div>
      {result.error ? (
        <p className="ve-block-preview-message" role="status">
          {pt(
            "blockPreview.unavailable",
            "Preview unavailable for this block."
          )}
        </p>
      ) : result.value ? (
        <BlockPreviewFrame
          key={target.componentId}
          value={result.value}
          sourceDocument={sourceDocument}
          streamDocument={streamDocument}
          templateProps={templateProps}
          width={width}
          label={target.label}
          onReady={markReady}
        />
      ) : (
        <p className="ve-block-preview-message" role="status">
          {pt("blockPreview.loading", "Loading preview…")}
        </p>
      )}
    </div>,
    ownerDocument.body
  );
}
