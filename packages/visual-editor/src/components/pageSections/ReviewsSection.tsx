import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import * as React from "react";
import { BasicSelector, msg, PageSection } from "@yext/visual-editor";

export type ReviewsSectionProps = {
  placeHolder?: string;
};

const reviewsFields: Fields<ReviewsSectionProps> = {
  placeHolder: BasicSelector({
    label: "Placeholder",
    options: [
      { label: "Some label", value: "some-label" },
      { label: "Another label", value: "another-label" },
    ],
  }),
};

const ReviewsSectionInternal: React.FC<ReviewsSectionProps> = (
  props: ReviewsSectionProps
) => {
  const { t } = useTranslation();
  return (
    <PageSection>
      <div>
        <h2>{t("recentReviews", "Recent Reviews")}</h2>
        <p>{t("noReviewsFound", "No reviews available")}</p>
      </div>
    </PageSection>
  );
};

export const ReviewsSection: ComponentConfig<ReviewsSectionProps> = {
  fields: reviewsFields,
  label: msg("components.reviewsSection", "Reviews Section"),
  render: (props) => <ReviewsSectionInternal {...props} />,
};
