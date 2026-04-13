import { Migration } from "../../utils/migrate.ts";

export const mainContentWrapperMigration: Migration = {
  content: {
    transformation: (content) => {
      const firstHeaderIndex = content.findIndex(
        (component) =>
          component.type === "ExpandedHeader" || component.type === "Header"
      );
      const preservedOutsideMain = new Set<number>();

      content.forEach((component, index) => {
        const isHeader =
          component.type === "ExpandedHeader" || component.type === "Header";
        const isFooter =
          component.type === "ExpandedFooter" || component.type === "Footer";
        const isPreHeaderCustomCode =
          component.type === "CustomCodeSection" &&
          firstHeaderIndex !== -1 &&
          index < firstHeaderIndex;

        if (isHeader || isFooter || isPreHeaderCustomCode) {
          preservedOutsideMain.add(index);
        }
      });

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

      let insertionIndex = content.findIndex(
        (_, index) => !preservedOutsideMain.has(index)
      );

      if (insertionIndex === -1) {
        insertionIndex = content.findIndex(
          (component) =>
            component.type === "ExpandedFooter" || component.type === "Footer"
        );
      }

      if (insertionIndex === -1) {
        insertionIndex = content.length;
      }

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
