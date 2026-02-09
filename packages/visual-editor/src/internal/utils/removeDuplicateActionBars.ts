import { pt } from "../../utils/i18n/platform.ts";

const findTargetDiv = (
  iframe: HTMLIFrameElement,
  translatedTarget: string
): HTMLDivElement | null => {
  // Get all action bar divs
  const targets = iframe?.contentDocument?.querySelectorAll(
    'div[class^="_ActionBar"]'
  );

  if (!targets) {
    return null;
  }

  // For each div, check the great-grandparent and grandchild for specific criteria
  for (const targetDiv of targets) {
    const greatGrandparent =
      targetDiv.parentElement?.parentElement?.parentElement;

    // The great-grandparent of the duplicate bar will have a height of 0px
    if (
      greatGrandparent &&
      greatGrandparent.tagName === "DIV" &&
      greatGrandparent.style.height === "0px"
    ) {
      const grandchild = targetDiv.querySelector(
        "div[class^='_ActionBar-label']"
      );

      // The grandchild of the duplicate bar will have the translation of "Image"
      if (grandchild && grandchild.textContent.includes(translatedTarget)) {
        return targetDiv as HTMLDivElement;
      }
    }
  }

  return null;
};

/**
 * Uses querySelector to hide duplicate action bars
 * that are created by Puck when we render
 * the same slot in multiple places in order to create
 * different layouts for different viewports.
 */
export const removeDuplicateActionBars = (): void => {
  const iframe = document.getElementById(
    "preview-frame"
  ) as HTMLIFrameElement | null;

  if (!iframe) {
    return;
  }

  const targets = [
    pt("image", "Image"),
    pt("video", "Video"),
    pt("components.footerSocialLinksSlot", "Social Links"),
    pt("callToAction", "Call To Action"),
    pt("components.secondaryHeader", "Secondary Header"),
    pt("components.headerLinks", "Header Links"),
  ];

  targets.forEach((target) => {
    const targetDiv = findTargetDiv(iframe, target);

    // Hide the duplicate action bar if found
    if (targetDiv) {
      targetDiv.style.display = "none";
    }
  });
};
