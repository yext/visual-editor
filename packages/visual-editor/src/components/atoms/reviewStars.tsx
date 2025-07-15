import * as React from "react";
import { FaRegStar, FaStar, FaStarHalf, FaStarHalfAlt } from "react-icons/fa";
import { Body } from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export type AggregateRating = {
  averageRating: number;
  reviewCount: number;
};

export type ReviewStarsProps = {
  averageRating: number;
  hasDarkBackground: boolean;
  reviewCount?: number;
};

export const ReviewStars = (props: ReviewStarsProps) => {
  const { averageRating, hasDarkBackground, reviewCount } = props;
  const roundedAverageRating = Math.round(averageRating * 10) / 10;
  const HalfStar = hasDarkBackground ? FaStarHalf : FaStarHalfAlt;
  const starColor = hasDarkBackground
    ? "text-white"
    : "text-palette-primary-dark";
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <Body className="font-bold">{roundedAverageRating}</Body>
      <div className={`flex items-center gap-0.5 ${starColor}`}>
        {Array.from({ length: 5 })
          .fill(null)
          .map((_, i) =>
            averageRating - i >= 0.75 ? (
              <FaStar key={i} />
            ) : averageRating - i >= 0.25 ? (
              <HalfStar key={i} />
            ) : (
              <FaRegStar
                key={i}
                style={hasDarkBackground ? { display: "none" } : undefined}
              />
            )
          )}
      </div>
      {reviewCount && (
        <Body className="ml-1">
          {/* TODO: update script to handle plurals */}(
          {t("totalReviews", `${reviewCount} reviews`, {
            count: reviewCount,
          })}
          )
        </Body>
      )}
    </div>
  );
};

/**
 * Extracts the aggregate rating from the document's schema.
 * @param document - The document containing the schema.
 * @returns The aggregate rating object if found, otherwise undefined.
 */
export function getAggregateRating(document: any): AggregateRating {
  const reviews = document?.ref_reviewsAgg;
  if (!Array.isArray(reviews))
    return {
      averageRating: 0,
      reviewCount: 0,
    };

  const firstPartyReview = reviews.find(
    (r) =>
      r.publisher === "FIRSTPARTY" &&
      typeof r.averageRating === "number" &&
      typeof r.reviewCount === "number"
  );

  if (!firstPartyReview)
    return {
      averageRating: 0,
      reviewCount: 0,
    };

  return {
    averageRating: firstPartyReview.averageRating,
    reviewCount: firstPartyReview.reviewCount,
  };
}
