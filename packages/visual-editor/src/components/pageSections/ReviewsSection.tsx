import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown,
  FaStarHalfAlt,
  FaStarHalf,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { ComponentConfig, Fields } from "@measured/puck";
import * as React from "react";
import {
  type BackgroundStyle,
  Body,
  Button,
  fetchReviewsForEntity,
  Heading,
  msg,
  PageSection,
  Timestamp,
  TimestampOption,
  useDocument,
  YextField,
} from "@yext/visual-editor";

const TEMP_ENTITY_ID = 25897322; // Hardcoded for demo purposes, replace with actual entity ID logic
const REVIEWS_PER_PAGE = 5;
const DATE_FORMAT: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

export type ReviewsSectionProps = {
  backgroundColor: BackgroundStyle;
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
  const document: any = useDocument();
  const apiKey = ""; // TODO: document?._env?.YEXT_VISUAL_EDITOR_REVIEWS_APP_API_KEY;
  if (!apiKey) {
    console.warn(
      "Missing YEXT_VISUAL_EDITOR_REVIEWS_APP_API_KEY, unable to access reviews content endpoint."
    );
    return <></>;
  }
  const businessId: number = Number(document?.businessId);
  const contentDeliveryAPIDomain = "ignored"; // TODO: document?._yext?.contentDeliveryAPIDomain;
  const entityId = TEMP_ENTITY_ID; // TODO: document?.uid
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1); // Note: this is one-indexed
  const [pageTokens, setPageTokens] = React.useState<Record<number, string>>(
    {}
  );

  const {
    data: reviews,
    status: reviewsStatus,
    isLoading,
  } = useQuery({
    queryKey: [
      "reviews",
      entityId,
      currentPageNumber,
      pageTokens[currentPageNumber],
    ],
    queryFn: async () =>
      fetchReviewsForEntity({
        businessId,
        apiKey,
        contentDeliveryAPIDomain,
        entityId,
        limit: REVIEWS_PER_PAGE,
        pageToken: pageTokens[currentPageNumber],
      }),
    enabled:
      !!businessId && !!apiKey && !!contentDeliveryAPIDomain && !!entityId,
  });

  React.useEffect(() => {
    if (reviews?.response?.nextPageToken) {
      setPageTokens((prev) => ({
        ...prev,
        [currentPageNumber + 1]: reviews.response.nextPageToken,
      }));
    }
  }, [reviews, currentPageNumber]);

  const aggregateRating = getAggregateRating(document);
  const totalReviews = aggregateRating?.reviewCount || 0;
  const averageRating = Number(aggregateRating?.ratingValue) || 0;

  if (reviewsStatus !== "success" || (!isLoading && totalReviews === 0)) {
    return <></>;
  }

  const hasDarkBackground = props.backgroundColor?.textColor === "text-white";

  const headerProps: ReviewsHeaderProps = {
    totalReviews,
    averageRating,
    isLoading,
    hasDarkBackground,
  };

  const pageScrollerProps: PageScrollerProps = {
    totalReviews,
    currentPageNumber,
    fetchData: setCurrentPageNumber,
    hasDarkBackground,
  };

  return (
    <PageSection
      className="flex flex-col gap-12"
      background={props.backgroundColor}
    >
      <ReviewsHeader {...headerProps} />
      {reviews && (
        <>
          <ReviewsList
            reviews={reviews?.response?.docs}
            hasDarkBackground={hasDarkBackground}
          />
          <PageScroller {...pageScrollerProps} />
        </>
      )}
    </PageSection>
  );
};

interface ReviewsHeaderProps {
  totalReviews: number;
  averageRating: number;
  isLoading: boolean;
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
          <Body>{t("loadingReviews", "Loading reviews...")}</Body>
        ) : (
          <>
            <ReviewStarsWithRating
              rating={averageRating}
              hasDarkBackground={hasDarkBackground}
            />
            <Body>
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
  if (!reviews) {
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
    date: review.reviewDate,
  };
  const reviewContentData: ReviewContentProps = {
    rating: review.rating,
    ...(review.content && { content: review.content }),
    hasDarkBackground,
  };

  let businessResponseData: BusinessResponseProps | undefined = undefined;
  if (Array.isArray(review.comments) && review.comments.length > 0) {
    const businessResponseContent = review.comments[0].content;
    const businessResponseDate = review.comments[0].commentDate;
    const businessName = (useDocument() as { name?: string }).name || "";
    businessResponseData = {
      businessName,
      content: businessResponseContent,
      date: businessResponseDate,
    };
  }

  return (
    <>
      <div className="border-t border-gray-400 flex flex-col md:flex-row gap-2 p-4">
        <div className="w-full md:w-1/3">
          <AuthorWithDate {...authorData} />
        </div>
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          <ReviewContent {...reviewContentData} />
          {businessResponseData && (
            <BusinessResponse {...businessResponseData} />
          )}
        </div>
      </div>
    </>
  );
};

interface AuthorWithDateProps {
  author: string;
  date: string;
}

const AuthorWithDate: React.FC<AuthorWithDateProps> = ({ author, date }) => {
  const document: any = useDocument();
  return (
    <div className="flex flex-col gap-2">
      <Body variant={"lg"} className="font-bold">
        {author}
      </Body>
      <Timestamp
        date={date}
        option={TimestampOption.DATE}
        hideTimeZone={true}
        timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        locale={document?.locale}
        dateFormatOverride={DATE_FORMAT}
      />
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
  date: string;
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
    date,
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
        className={`transition-all duration-200 ${!expanded ? "line-clamp-3" : ""}`}
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
      <Body className="font-bold">{rating}</Body>
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

interface PageScrollerProps {
  totalReviews: number;
  currentPageNumber: number;
  fetchData: (newPageNumber: number) => void;
  hasDarkBackground: boolean;
}

const PageScroller: React.FC<PageScrollerProps> = ({
  totalReviews,
  currentPageNumber,
  fetchData,
  hasDarkBackground,
}) => {
  const numPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
  if (numPages <= 1) {
    return <></>;
  }
  const selectableButtonClasses = `cursor-pointer ${hasDarkBackground ? "text-white" : "text-palette-primary-dark"}`;
  const disabledButtonClasses = "opacity-50 cursor-default";
  return (
    <Body className="flex flex-row justify-center items-center gap-5">
      <FaArrowLeft
        className={`${currentPageNumber === 1 ? disabledButtonClasses : selectableButtonClasses}`}
        onClick={() => {
          if (currentPageNumber > 1) {
            fetchData(currentPageNumber - 1);
          }
        }}
      />
      <FaArrowRight
        className={`${currentPageNumber === numPages ? disabledButtonClasses : selectableButtonClasses}`}
        onClick={() => {
          if (currentPageNumber < numPages) {
            fetchData(currentPageNumber + 1);
          }
        }}
      />
    </Body>
  );
};

const ShowMoreButton: React.FC<{
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}> = ({ expanded, setExpanded }) => {
  const { t } = useTranslation();
  return (
    <Button
      className="font-body-fontFamily text-body-fontSize underline cursor-pointer inline-flex items-center gap-2"
      onClick={() => setExpanded(!expanded)}
      variant={"link"}
    >
      {expanded ? t("showLess", "Show less") : t("showMore", "Show more")}
      <FaChevronDown
        className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        style={{ textDecoration: "underline" }}
      />
    </Button>
  );
};

/**
 * Extracts the aggregate rating from the document's schema.
 * @param document - The document containing the schema.
 * @returns The aggregate rating object if found, otherwise undefined.
 */
function getAggregateRating(document: any) {
  return document?._schema?.["@graph"].find((e: any) => e.aggregateRating)
    ?.aggregateRating;
}

export const ReviewsSection: ComponentConfig<ReviewsSectionProps> = {
  fields: reviewsFields,
  label: msg("components.reviewsSection", "Reviews Section"),
  render: (props) => <ReviewsSectionInternal {...props} />,
};
