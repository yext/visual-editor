import { Migration } from "../../utils/migrate.ts";

export const addShowAverageReviewMigration: Migration = {
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
