import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../../utils/cn.ts";
import { useGetPuck } from "@measured/puck";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipArrow = TooltipPrimitive.Arrow;

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  zoomWithViewport?: boolean;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, zoomWithViewport, ...props }, ref) => {
  const [scaleFactor, setScaleFactor] = React.useState<number>(1);
  const [iframeWidth, setIFrameWidth] = React.useState<number | undefined>();
  const getPuck = useGetPuck();

  // Safe fallback if tooltip renders outside of puck context
  let viewportWidth: number | undefined;
  try {
    const puck = getPuck();
    viewportWidth = puck.appState.ui.viewports.current.width;
  } catch {
    // viewportWidth undefined
  }

  React.useEffect(() => {
    if (!zoomWithViewport) {
      return;
    }

    const viewportElement = document.getElementById(
      "puck-canvas-root"
    ) as HTMLDivElement;
    const iFrameElement = document.getElementById(
      "preview-frame"
    ) as HTMLIFrameElement;

    if (!viewportElement || !iFrameElement) {
      return;
    }

    // Set initial width
    setIFrameWidth(iFrameElement.getBoundingClientRect().width);

    // Update the width when the puck viewport changes
    // Puck updates the canvas's scale rather than the iframe's width
    // Puck also has a transition animation so we have to introduce a small delay
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        setIFrameWidth(iFrameElement.getBoundingClientRect().width);
      }, 150);
    });
    observer.observe(viewportElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, [zoomWithViewport]);

  React.useEffect(() => {
    // Scale the tooltip using on Puck's zoom factor
    // Based on https://github.com/puckeditor/puck/blob/af1dc89139e0311b1dc014e328f431b1ebab0067/packages/core/components/DraggableComponent/index.tsx#L608
    // and https://github.com/puckeditor/puck/blob/af1dc89139e0311b1dc014e328f431b1ebab0067/packages/core/lib/get-zoom-config.ts#L6
    if (iframeWidth && viewportWidth && zoomWithViewport) {
      setScaleFactor(1 / (iframeWidth / viewportWidth));
    }
  }, [viewportWidth, iframeWidth, zoomWithViewport]);

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      style={{ transform: `scale(${scaleFactor})` }}
      className={cn(
        "ve-z-50 ve-overflow-hidden ve-rounded-md ve-bg-popover ve-px-3 ve-py-1.5 ve-text-xs " +
          "ve-text-popover-foreground ve-transform",
        className
      )}
      {...props}
    />
  );
});

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  TooltipProvider,
};
