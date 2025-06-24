import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import * as React from "react";
import { BasicSelector, msg } from "@yext/visual-editor";

export type ReviewsProps = {
  placeHolder?: string;
};

const reviewsFields: Fields<ReviewsProps> = {
  placeHolder: BasicSelector({
    label: "Placeholder",
    options: [
      { label: "Some label", value: "some-label" },
      { label: "Another label", value: "another-label" },
    ],
  }),
};

export const Reviews: ComponentConfig<ReviewsProps> = {
  fields: reviewsFields,
  label: msg("components.reviews", "Reviews"),
  render: (props) => <ReviewsInternal {...props} />,
};

const ReviewsInternal: React.FC<ReviewsProps> = (props: ReviewsProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t("recentReviews", "Recent Reviews")}</h2>
      <p>{t("noReviewsFound", "No reviews available")}</p>
    </div>
  );
};
