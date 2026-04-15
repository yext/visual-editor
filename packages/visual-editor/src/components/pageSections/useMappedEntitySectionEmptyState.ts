import * as React from "react";

const EMPTY_STATE_MARKER_SELECTOR = '[data-empty-state="true"]';

export const useMappedEntitySectionEmptyState = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const [isMappedContentEmpty, setIsMappedContentEmpty] = React.useState(false);
  const setWrapperRef = React.useCallback((element: HTMLDivElement | null) => {
    setElement(element);
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      setIsMappedContentEmpty(false);
      return;
    }

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
  }, [element, enabled]);

  return { setWrapperRef, isMappedContentEmpty };
};
