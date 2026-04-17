import { LayoutMigration } from "../../utils/migrateLayout.ts";

// Keep only leading header content and trailing footer content at the root.
//
// This migration looks for:
// - a leading prefix made of CustomCodeSection followed by Header or
//   ExpandedHeader components
// - a trailing suffix made of Footer or ExpandedFooter components followed by
//   CustomCodeSection
//
// Those edge components stay at the root. Everything between them is wrapped
// into MainContent, and the wrapper is inserted just before the trailing
// footer suffix. Header/Footer components that appear in the middle of the
// page are therefore wrapped into MainContent instead of being pulled to the
// edges, which preserves the existing top-level order.
export const mainContentWrapperMigration: LayoutMigration = {
  content: {
    transformation: (content) => {
      const isHeader = (componentType: string) =>
        componentType === "ExpandedHeader" || componentType === "Header";
      const isFooter = (componentType: string) =>
        componentType === "ExpandedFooter" || componentType === "Footer";
      const isCustomCode = (componentType: string) =>
        componentType === "CustomCodeSection";
      let leadingRootIndex = 0;
      while (
        leadingRootIndex < content.length &&
        isCustomCode(content[leadingRootIndex].type)
      ) {
        leadingRootIndex++;
      }

      const firstHeaderIndex = leadingRootIndex;
      while (
        leadingRootIndex < content.length &&
        isHeader(content[leadingRootIndex].type)
      ) {
        leadingRootIndex++;
      }

      const hasLeadingHeader = leadingRootIndex > firstHeaderIndex;
      if (!hasLeadingHeader) {
        leadingRootIndex = 0;
      }

      let trailingRootIndex = content.length;
      while (
        trailingRootIndex > leadingRootIndex &&
        isCustomCode(content[trailingRootIndex - 1].type)
      ) {
        trailingRootIndex--;
      }

      const firstFooterAfterTrailingCustomCode = trailingRootIndex;
      while (
        trailingRootIndex > leadingRootIndex &&
        isFooter(content[trailingRootIndex - 1].type)
      ) {
        trailingRootIndex--;
      }

      const hasTrailingFooter =
        trailingRootIndex < firstFooterAfterTrailingCustomCode;
      if (!hasTrailingFooter) {
        trailingRootIndex = content.length;
      }

      const preservedOutsideMain = new Set<number>();

      for (let index = 0; index < leadingRootIndex; index++) {
        preservedOutsideMain.add(index);
      }

      for (let index = trailingRootIndex; index < content.length; index++) {
        preservedOutsideMain.add(index);
      }

      // Only edge page structure stays at root so existing top-level order is preserved.
      const mainContent = content.filter(
        (_, index) => !preservedOutsideMain.has(index)
      );

      const wrappedContent = {
        type: "MainContent",
        props: {
          id: "MainContent-default",
          content: mainContent,
        },
      };

      const insertionIndex = trailingRootIndex;

      const transformedContent = [];
      let insertedMainContent = false;

      content.forEach((component, index) => {
        if (!insertedMainContent && index === insertionIndex) {
          transformedContent.push(wrappedContent);
          insertedMainContent = true;
        }

        if (preservedOutsideMain.has(index)) {
          transformedContent.push(component);
        }
      });

      if (!insertedMainContent) {
        transformedContent.push(wrappedContent);
      }

      return transformedContent;
    },
  },
};
