import { LayoutMigration } from "../../utils/migrate.ts";

export const addShowAverageReviewMigration: LayoutMigration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          showAverageReview: props.data?.showAverageReview ?? false,
        },
      };
    },
  },
};
