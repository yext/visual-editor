import * as React from "react";

const EMPTY_STATE_MARKER_SELECTOR = '[data-empty-state="true"]';

export const useMappedEntitySectionEmptyState = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const [isMappedContentEmpty, setIsMappedContentEmpty] = React.useState(false);
  const setWrapperRef = React.useCallback((element: HTMLDivElement | null) => {
    wrapperRef.current = element;
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      setIsMappedContentEmpty(false);
      return;
    }

    const element = wrapperRef.current;
    if (!element) {
      return;
    }

    const updateEmptyState = () => {
      setIsMappedContentEmpty(
        element.querySelector(EMPTY_STATE_MARKER_SELECTOR) !== null
      );
    };

    const observer = new MutationObserver(updateEmptyState);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    updateEmptyState();

    return () => {
      observer.disconnect();
    };
  }, [enabled]);

  return { setWrapperRef, isMappedContentEmpty };
};
