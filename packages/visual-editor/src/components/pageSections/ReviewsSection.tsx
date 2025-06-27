import { useTranslation } from "react-i18next";
import { FaStarHalfAlt, FaStarHalf, FaStar, FaRegStar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { ComponentConfig, Fields } from "@measured/puck";
import * as React from "react";
import {
  type BackgroundStyle,
  Body,
  Button,
  Heading,
  msg,
  PageSection,
  useDocument,
  YextField,
} from "@yext/visual-editor";

const TEMP_ENDPOINT = "";

export type ReviewsSectionProps = {
  backgroundColor?: BackgroundStyle;
};

const reviewsFields: Fields<ReviewsSectionProps> = {
  backgroundColor: YextField(
    msg("fields.backgroundColor", "Background Color"),
    {
      type: "select",
      options: "BACKGROUND_COLOR",
    }
  ),
};

const ReviewsSectionInternal: React.FC<ReviewsSectionProps> = (
  props: ReviewsSectionProps
) => {
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [reviewDocs, setReviewDocs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const fetchData = async () => {
    try {
      const reviews = await fetchReviews();
      if (!reviews || !reviews.meta) {
        throw new Error("Invalid response structure from API");
      }
      if (reviews?.meta?.errors && reviews.meta.errors.length > 0) {
        throw new Error(
          "API returned errors: " + JSON.stringify(reviews.response.meta.errors)
        );
      }
      const reviewsForEntity = filterReviewsToEntity(
        reviews.response.docs || []
      );
      // TODO: this total/avg logic will change once the data is on the JSON+LD
      setTotalReviews(reviewsForEntity.length);
      setAverageRating(Number(calculateAverageRating(reviewsForEntity)));
      setReviewDocs(reviewsForEntity);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
  const hasDarkBackground = props.backgroundColor?.textColor === "text-white";
  const headerProps: ReviewsHeaderProps = {
    totalReviews,
    averageRating,
    isLoading,
    hasDarkBackground,
  };
  if (!isLoading && totalReviews === 0) {
    return <></>;
  }
  return (
    <PageSection
      className="flex flex-col gap-12"
      background={props.backgroundColor}
    >
      <ReviewsHeader {...headerProps} />
      <ReviewsList reviews={reviewDocs} hasDarkBackground={hasDarkBackground} />
    </PageSection>
  );
};

interface ReviewsHeaderProps {
  totalReviews: number;
  averageRating: number;
  isLoading?: boolean;
  hasDarkBackground: boolean;
}

const ReviewsHeader: React.FC<ReviewsHeaderProps> = (props) => {
  const { totalReviews, averageRating, isLoading, hasDarkBackground } = props;
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <Heading level={3} className="text-center">
        {t("recentReviews", "Recent Reviews")}
      </Heading>
      <div className="flex flex-row gap-3 items-center justify-center">
        {isLoading ? (
          <Body className="text-body-md-fontSize">
            {t("loadingReviews", "Loading reviews...")}
          </Body>
        ) : (
          <>
            <ReviewStarsWithRating
              rating={averageRating}
              hasDarkBackground={hasDarkBackground}
            />
            <Body className="text-body-md-fontSize">
              {/* TODO(sumo): update script to handle plurals */}(
              {t("totalReviews", `${totalReviews} reviews`, {
                count: totalReviews,
              })}
              )
            </Body>
          </>
        )}
      </div>
    </div>
  );
};

const ReviewsList: React.FC<{ reviews: any[]; hasDarkBackground: boolean }> = ({
  reviews,
  hasDarkBackground,
}) => {
  if (reviews.length === 0) {
    return <></>; // No reviews to display while loading
  }
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review, index) => (
        <Review
          key={`review-${index}`}
          review={review}
          hasDarkBackground={hasDarkBackground}
        />
      ))}
    </div>
  );
};

const Review: React.FC<{ review: any; hasDarkBackground: boolean }> = ({
  review,
  hasDarkBackground,
}) => {
  const authorData: AuthorWithDateProps = {
    author: review.authorName,
    date: new Date(review.reviewDate),
  };
  const reviewContentData: ReviewContentProps = {
    rating: review.rating,
    ...(review.content && { content: review.content }),
    hasDarkBackground,
  };
  const businessResponse =
    Array.isArray(review.comments) && review.comments.length > 0
      ? review.comments[0].content
      : undefined;
  const businessName = (useDocument() as { name?: string }).name || "";
  const businessResponseData: BusinessResponseProps = {
    businessName,
    content: businessResponse,
    date: new Date(review.businessResponse?.date || Date.now()),
  };
  return (
    <>
      <div className="border-t border-gray-400 flex flex-col md:flex-row gap-2 p-4">
        <div className="w-full md:w-1/3">
          <AuthorWithDate {...authorData} />
        </div>
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          <ReviewContent {...reviewContentData} />
          {businessResponse && <BusinessResponse {...businessResponseData} />}
        </div>
      </div>
    </>
  );
};

interface AuthorWithDateProps {
  author: string;
  date: Date;
}

const AuthorWithDate: React.FC<AuthorWithDateProps> = ({ author, date }) => {
  return (
    <div className="flex flex-col gap-2">
      <Body className="font-bold font-body-fontFamily text-body-lg-fontSize">
        {author}
      </Body>
      <Body className="font-body-fontFamily text-body-md-fontSize">
        {formatDate(date)}
      </Body>
    </div>
  );
};

interface ReviewContentProps {
  rating: number;
  content?: string;
  hasDarkBackground: boolean;
}

const ReviewContent: React.FC<ReviewContentProps> = ({
  rating,
  content,
  hasDarkBackground,
}) => {
  const reviewStars = (
    <ReviewStars rating={rating} hasDarkBackground={hasDarkBackground} />
  );
  if (!content) {
    return <div className="flex flex-col gap-2">{reviewStars}</div>;
  }
  const expandableContentData = {
    content: content,
    preContentElement: reviewStars,
  };
  return <ExpandableContent {...expandableContentData} />;
};

interface BusinessResponseProps {
  businessName: string;
  content: string;
  date: Date;
}

const BusinessResponse: React.FC<BusinessResponseProps> = ({
  businessName,
  content,
  date,
}) => {
  const { t } = useTranslation();
  const authorData: AuthorWithDateProps = {
    author: t("responseFrom", `Response from ${businessName}`, {
      businessName,
    }),
    date: date,
  };
  const authorWithDate = <AuthorWithDate {...authorData} />;

  const expandableContentData = {
    content: content,
    preContentElement: authorWithDate,
  };
  return <ExpandableContent {...expandableContentData} />;
};

interface ExpandableContentProps {
  content: string;
  preContentElement?: React.ReactNode;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({
  content,
  preContentElement,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [isTruncated, setIsTruncated] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current && !expanded) {
      // Check if the content is truncated
      setIsTruncated(
        contentRef.current.scrollHeight > contentRef.current.clientHeight
      );
    } else {
      setIsTruncated(false);
    }
  }, [content, expanded]);

  return (
    <div className="flex flex-col gap-2">
      {preContentElement}
      <Body
        ref={contentRef}
        className={`text-body-md-fontSize font-body-fontFamily transition-all duration-200 ${!expanded ? "line-clamp-3" : ""}`}
        style={{ overflowWrap: "anywhere" }}
      >
        {content}
      </Body>
      {(isTruncated || expanded) && (
        <ShowMoreButton expanded={expanded} setExpanded={setExpanded} />
      )}
    </div>
  );
};

interface ReviewStarsProps {
  rating: number;
  hasDarkBackground: boolean;
}

const ReviewStarsWithRating: React.FC<ReviewStarsProps> = ({
  rating,
  hasDarkBackground,
}) => {
  return (
    <>
      <Body className="font-bold font-body-md-fontWeight text-body-md-fontSize">
        {rating}
      </Body>
      <ReviewStars rating={rating} hasDarkBackground={hasDarkBackground} />
    </>
  );
};

const ReviewStars: React.FC<ReviewStarsProps> = (props) => {
  const { rating, hasDarkBackground } = props;
  const HalfStar = hasDarkBackground ? FaStarHalf : FaStarHalfAlt;
  const starColor = hasDarkBackground
    ? "text-white"
    : "text-palette-primary-dark";
  return (
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
  );
};

const ShowMoreButton: React.FC<{
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}> = ({ expanded, setExpanded }) => {
  const { t } = useTranslation();
  return (
    <Button
      className="font-body-fontFamily text-body-md-fontSize underline cursor-pointer inline-flex items-center"
      onClick={() => setExpanded(!expanded)}
      variant={"link"}
    >
      {expanded ? t("showLess", "Show less") : t("showMore", "Show more")}
      <IoIosArrowDown
        className={`ml-1 transition-transform ${expanded ? "rotate-180" : ""}`}
        style={{ textDecoration: "underline" }}
      />
    </Button>
  );
};

/**
 * Fetch reviews for the business.
 * @returns A promise that resolves to the reviews data fetched from the endpoint.
 */
async function fetchReviews() {
  const response = await fetch(TEMP_ENDPOINT);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Filters the reviews to only include those that belong to the current entity.
 * @param docs - An array of review documents.
 * @returns An array of review documents that belong to the current entity.
 */
function filterReviewsToEntity(docs: any[]) {
  // const uid = (useDocument() as { entity?: { uid?: string } }).entity?.uid;
  const uid = 25897322;
  return docs.filter((doc) => {
    return doc.entity?.uid === uid;
  });
}

/**
 * Calculates the average rating from an array of review documents, rounding to the nearest tenth place.
 * @param docs - An array of review documents, each containing a rating field.
 */
function calculateAverageRating(docs: any[]) {
  let totalRating = 0;
  let count = 0;
  docs.forEach((doc) => {
    if (doc.rating) {
      totalRating += doc.rating;
      count++;
    }
  });
  return count > 0 ? (totalRating / count).toFixed(1) : 0;
}

/**
 * Returns a formatted date string in the format "Month Day, Year".
 * @param date - A Date object to format.
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const ReviewsSection: ComponentConfig<ReviewsSectionProps> = {
  fields: reviewsFields,
  label: msg("components.reviewsSection", "Reviews Section"),
  render: (props) => <ReviewsSectionInternal {...props} />,
};
