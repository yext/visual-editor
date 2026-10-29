import { Check, LoaderCircle } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import type { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { previewDocuments } from "./previewScroll.ts";
import overlayStyles from "./generationSectionOverlay.css?inline";

/** Independent of Puck's hover-only overlays; never changes section markup. */
export const GenerationSectionOverlays = ({
  canvas,
}: {
  canvas: LayoutGenerationChatCanvas;
}) => {
  const statuses = React.useSyncExternalStore(
    canvas.subscribe,
    canvas.getSectionStatuses,
    canvas.getSectionStatuses
  );
  return (
    <>
      {Array.from(statuses, ([sectionId, status]) => (
        <GenerationSectionOverlay
          key={sectionId}
          sectionId={sectionId}
          status={status}
        />
      ))}
    </>
  );
};

const GenerationSectionOverlay = ({
  sectionId,
  status,
}: {
  sectionId: string;
  status: "building" | "ready";
}) => {
  const [visible, setVisible] = React.useState(true);
  const [target, setTarget] = React.useState<HTMLElement>();
  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setVisible(true);
    if (status !== "ready" || !target) return;
    const hide = window.setTimeout(() => setVisible(false), 2000);
    return () => window.clearTimeout(hide);
  }, [status, sectionId, target]);

  React.useEffect(() => {
    if (!visible) return;
    let frame = 0;
    let element: HTMLElement | undefined;
    let previousElement: HTMLElement | undefined;
    const measure = () => {
      if (!element?.isConnected) {
        element = previewDocuments(document)
          .flatMap((doc) =>
            Array.from(
              doc.querySelectorAll<HTMLElement>("[data-puck-component]")
            )
          )
          .find(
            (item) => item.getAttribute("data-puck-component") === sectionId
          );
      }
      if (previousElement !== element) {
        setTarget(element);
        previousElement = element;
      }
      if (element && overlayRef.current) {
        const { top, left, width, height } = element.getBoundingClientRect();
        // Follow scroll frames without re-rendering the editor or the overlay.
        Object.assign(overlayRef.current.style, {
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
          visibility: "visible",
        });
      }
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    return () => window.cancelAnimationFrame(frame);
  }, [visible, sectionId]);

  if (!visible || !target) return null;
  return createPortal(
    <>
      <style>{overlayStyles}</style>
      <div
        className="local-editor-generation-section"
        data-status={status}
        ref={overlayRef}
        style={{ visibility: "hidden" }}
      >
        <span className="local-editor-generation-section-badge" role="status">
          {status === "building" ? (
            <LoaderCircle size={14} aria-hidden="true" />
          ) : (
            <Check size={14} aria-hidden="true" />
          )}
          {status === "building" ? "Building section…" : "Ready"}
        </span>
      </div>
    </>,
    target.ownerDocument.body
  );
};
