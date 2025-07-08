import * as React from "react";
import { FaRegStar, FaStar, FaStarHalf, FaStarHalfAlt } from "react-icons/fa";
import { Body } from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export type ReviewStarsProps = {
  rating: number;
  hasDarkBackground: boolean;
  totalReviews?: number;
};

export const ReviewStars = (props: ReviewStarsProps) => {
  const { rating, hasDarkBackground, totalReviews } = props;
  const HalfStar = hasDarkBackground ? FaStarHalf : FaStarHalfAlt;
  const starColor = hasDarkBackground
    ? "text-white"
    : "text-palette-primary-dark";
  const { t } = useTranslation();

  return (
    <>
      <Body className="font-bold">{rating}</Body>
      <div className={`flex items-center gap-0.5 ${starColor}`}>
        {new Array(5)
          .fill(null)
          .map((_, i) =>
            rating - i >= 0.75 ? (
              <FaStar key={i} />
            ) : rating - i >= 0.25 ? (
              <HalfStar key={i} />
            ) : (
              <FaRegStar
                key={i}
                style={hasDarkBackground ? { display: "none" } : undefined}
              />
            )
          )}
      </div>
      {totalReviews && (
        <Body>
          {/* TODO: update script to handle plurals */}(
          {t("totalReviews", `${totalReviews} reviews`, {
            count: totalReviews,
          })}
          )
        </Body>
      )}
    </>
  );
};
