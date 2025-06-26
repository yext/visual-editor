import { useTranslation } from "react-i18next";
import { FaStarHalfAlt, FaStar, FaRegStar } from "react-icons/fa";
import { ComponentConfig, Fields } from "@measured/puck";
import * as React from "react";
import { BasicSelector, Heading, msg, PageSection } from "@yext/visual-editor";

const TEMP_ENDPOINT = "<STREAMS API ENDPOINT GOES HERE>";

export type ReviewsSectionDemoProps = {
  placeHolder?: string;
};

const reviewsFields: Fields<ReviewsSectionDemoProps> = {
  placeHolder: BasicSelector({
    label: "Placeholder",
    options: [
      { label: "Some label", value: "some-label" },
      { label: "Another label", value: "another-label" },
    ],
  }),
};

const ReviewsSectionInternal: React.FC<ReviewsSectionDemoProps> = (
  props: ReviewsSectionDemoProps,
) => {
  const { t } = useTranslation();
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  React.useEffect(() => {
    fetchReviews()
      .then((reviews) => {
        if (!reviews || !reviews.meta) {
          throw new Error("Invalid response structure from API");
        }
        if (reviews?.meta?.errors && reviews.meta.errors.length > 0) {
          throw new Error(
            "API returned errors: " +
              JSON.stringify(reviews.response.meta.errors),
          );
        }
        setTotalReviews(reviews.response.count || 0);
        setAverageRating(
          Number(calculateAverageRating(reviews.response.docs || [])),
        );
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
      });
  }, []);
  const headerProps: ReviewsHeaderProps = {
    totalReviews,
    averageRating,
  };
  return (
    <PageSection>
      <div>
        <ReviewsHeader {...headerProps} />
      </div>
    </PageSection>
  );
};

interface ReviewsHeaderProps {
  totalReviews: number;
  averageRating: number;
}

const ReviewsHeader: React.FC<ReviewsHeaderProps> = (props) => {
  const { totalReviews, averageRating } = props;
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <Heading level={3} className="text-center">
        {t("recentReviews", "Recent Reviews")}
      </Heading>
      <div className="flex flex-row gap-3 items-center justify-center">
        {totalReviews === 0 ? (
          <div className="text-body-md-fontSize">
            {t("noReviewsFound", "No reviews available")}
          </div>
        ) : (
          <>
            <div className="font-bold font-body-md-fontWeight text-body-md-fontSize">
              {averageRating}
            </div>
            <ReviewStars rating={averageRating} />
            <div className="text-body-md-fontSize">
              {/* TODO(sumo): update script to handle plurals */}(
              {t("totalReviews", `${totalReviews} reviews`, {
                count: totalReviews,
              })}
              )
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ReviewStars = (props: { rating: number }) => {
  const { rating } = props;
  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {new Array(5)
        .fill(null)
        .map((_, i) =>
          rating - i >= 0.75 ? (
            <FaStar key={i} />
          ) : rating - i >= 0.25 ? (
            <FaStarHalfAlt key={i} />
          ) : (
            <FaRegStar key={i} />
          ),
        )}
    </div>
  );
};

// function to fetch reviews from the temporary endpoint
const fetchReviews = async () => {
  const response = await fetch(TEMP_ENDPOINT);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

/**
 * Calculates the average rating from an array of review documents, rounding to the nearest tenth place.
 * @param docs - An array of review documents, each containing a rating field.
 */
const calculateAverageRating = (docs: any[]) => {
  let totalRating = 0;
  let count = 0;
  docs.forEach((doc) => {
    if (doc.rating) {
      totalRating += doc.rating;
      count++;
    }
  });
  return count > 0 ? (totalRating / count).toFixed(1) : 0;
};

export const ReviewsSectionDemo: ComponentConfig<ReviewsSectionDemoProps> = {
  fields: reviewsFields,
  label: msg("components.reviewsSectionDemo", "Reviews Section DEMO"),
  render: (props) => <ReviewsSectionInternal {...props} />,
};
