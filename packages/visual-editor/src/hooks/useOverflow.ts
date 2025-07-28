import * as React from "react";

/**
 * A hook that detects when a child element overflows its parent container.
 * @param containerRef A React ref attached to the parent container element.
 * @param contentRef A React ref attached to the child/content element to measure.
 * @returns `true` if the child element is overflowing its parent.
 */
export const useOverflow = (
  containerRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>
): boolean => {
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const hasOverflow = content.scrollWidth > container.clientWidth;
      setIsOverflowing(hasOverflow);
    });

    // Observe both the container and the content for size changes
    observer.observe(container);
    observer.observe(content);

    return () => observer.disconnect();
  }, [containerRef, contentRef]);

  return isOverflowing;
};
