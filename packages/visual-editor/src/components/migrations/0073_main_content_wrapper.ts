import { Migration } from "../../utils/migrate.ts";

const MAIN_CONTENT_TYPE = "MainContent";
const EXPANDED_HEADER_TYPE = "ExpandedHeader";
const EXPANDED_FOOTER_TYPE = "ExpandedFooter";

export const mainContentWrapperMigration: Migration = {
  content: {
    transformation: (content) => {
      const headerIndex = content.findIndex(
        (component) => component.type === EXPANDED_HEADER_TYPE
      );
      let footerIndex = -1;
      for (let index = content.length - 1; index >= 0; index -= 1) {
        if (content[index].type === EXPANDED_FOOTER_TYPE) {
          footerIndex = index;
          break;
        }
      }

      const hasHeader = headerIndex !== -1;
      const hasFooter = footerIndex !== -1;

      const mainContent = content.filter((_, index) => {
        if (hasHeader && index === headerIndex) {
          return false;
        }

        if (hasFooter && index === footerIndex) {
          return false;
        }

        return true;
      });

      const wrappedContent = {
        type: MAIN_CONTENT_TYPE,
        props: {
          id: "MainContent-default",
          content: mainContent,
        },
      };

      if (!hasHeader && !hasFooter) {
        return [wrappedContent];
      }

      const transformedContent = [];

      if (hasHeader) {
        transformedContent.push(content[headerIndex]);
      }

      transformedContent.push(wrappedContent);

      if (hasFooter) {
        transformedContent.push(content[footerIndex]);
      }

      return transformedContent;
    },
  },
};
