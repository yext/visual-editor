import { LayoutMigration } from "../../utils/migrateLayout.ts";

export const updateFooterForAssetImages: LayoutMigration = {
  ExpandedFooter: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          primaryFooter: {
            ...props.data.primaryFooter,
            logo: {
              url: props.data.primaryFooter.logo,
            },
            utilityImages: props.data.primaryFooter.utilityImages?.map(
              (ui: any) => ({
                linkTarget: ui.linkTarget,
                image: {
                  url: ui.url,
                },
              })
            ),
          },
        },
      };
    },
  },
};
