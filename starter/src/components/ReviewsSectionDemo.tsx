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
const TEMP_ENTITY_ID = 25897322; // Hardcoded for demo purposes, replace with actual entity ID logic
const REVIEWS_PER_PAGE = 5;
const REVIEWS_ENDPOINT_ID = "visualEditorReviews";

export type ReviewsSectionDemoProps = {
  backgroundColor: BackgroundStyle;
};

const reviewsFields: Fields<ReviewsSectionDemoProps> = {
  backgroundColor: YextField(
    msg("fields.backgroundColor", "Background Color"),
    {
      type: "select",
      options: "BACKGROUND_COLOR",
    },
  ),
};

const ReviewsSectionInternal: React.FC<ReviewsSectionDemoProps> = (
  props: ReviewsSectionDemoProps,
) => {
  const document: any = useDocument();
  const entityId = TEMP_ENTITY_ID; // TODO: change to document.uid when using in production
  const endpointBaseUrl = TEMP_ENDPOINT; // TODO: use getReviewsContentEndpoint and check existence
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [reviewDocs, setReviewDocs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1); // Note: this is one-indexed
  const [pageTokens, setPageTokens] = React.useState<Record<number, string>>(
    {},
  );
  const [nextPageToken, setNextPageToken] = React.useState<
    string | undefined
  >();

  const fetchData = async (newPageNumber: number) => {
    try {
      const reviews = await fetchReviewsFromApi(
        entityId,
        endpointBaseUrl,
        pageTokens[newPageNumber],
      );
      if (!reviews || !reviews.meta) {
        throw new Error("Invalid response structure from API");
      }
      if (reviews?.meta?.errors && reviews.meta.errors.length > 0) {
        throw new Error(
          "API returned errors: " +
            JSON.stringify(reviews.response.meta.errors),
        );
      }
      setCurrentPageNumber(newPageNumber || 1);
      const reviewsForEntity = reviews.response.docs || [];
      setReviewDocs(reviewsForEntity);
      if (reviews.response.nextPageToken) {
        setNextPageToken(reviews.response.nextPageToken);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const aggregateRating = getAggregateRating(document);
    setTotalReviews(aggregateRating?.reviewCount || 0);
    setAverageRating(
      aggregateRating?.ratingValue ? Number(aggregateRating.ratingValue) : 0,
    );
    fetchData(1);
  }, []);

  React.useEffect(() => {
    if (nextPageToken) {
      setPageTokens((prev) => ({
        ...prev,
        [currentPageNumber + 1]: nextPageToken,
      }));
    }
  }, [nextPageToken]);

  if (!isLoading && totalReviews === 0) {
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
    fetchData,
    hasDarkBackground,
  };

  return (
    <PageSection
      className="flex flex-col gap-12"
      background={props.backgroundColor}
    >
      <ReviewsHeader {...headerProps} />
      <ReviewsList reviews={reviewDocs} hasDarkBackground={hasDarkBackground} />
      <PageScroller {...pageScrollerProps} />
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

  let businessResponseData = undefined;
  if (Array.isArray(review.comments) && review.comments.length > 0) {
    const businessResponseContent = review.comments[0].content;
    const businessResponseDate = review.comments[0].commentDate;
    const businessName = (useDocument() as { name?: string }).name || "";
    businessResponseData = {
      businessName,
      content: businessResponseContent,
      ...(businessResponseDate && { date: new Date(businessResponseDate) }),
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
  date?: Date;
}

const AuthorWithDate: React.FC<AuthorWithDateProps> = ({ author, date }) => {
  return (
    <div className="flex flex-col gap-2">
      <Body variant={"lg"} className="font-bold">
        {author}
      </Body>
      {date && <Body>{formatDate(date)}</Body>}
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
  date?: Date;
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
    ...(date && { date }),
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
        contentRef.current.scrollHeight > contentRef.current.clientHeight,
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
          ),
        )}
    </div>
  );
};

interface PageScrollerProps {
  totalReviews: number;
  currentPageNumber: number;
  fetchData: (newPageNumber: number) => Promise<any>;
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
 * Fetch reviews for the business.
 * @returns A promise that resolves to the reviews data fetched from the endpoint.
 */
async function fetchReviewsFromApi(
  entityId: number,
  endpointBaseUrl: string,
  pageToken?: string,
) {
  const url = new URL(endpointBaseUrl);
  url.searchParams.set("entity.uid", String(entityId));
  url.searchParams.set("limit", String(REVIEWS_PER_PAGE));
  url.searchParams.set("$sortBy__desc", "reviewDate");
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Extracts the aggregate rating from the document's schema.
 * @param document - The document containing the schema.
 * @returns The aggregate rating object if found, otherwise undefined.
 */
function getAggregateRating(document: any) {
  const el = document?._schema?.["@graph"].find((e: any) => e.aggregateRating);
  return el?.aggregateRating;
}

/**
 * Gets the reviews content endpoint URL for the specified document.
 * @param document - The document containing the entity page set config
 * @returns The reviews content endpoint URL or undefined if not found.
 */
function getReviewsContentEndpoint(document: any): string | undefined {
  const cloudRegion = document._env.YEXT_CLOUD_REGION?.toLowerCase();
  const environment = document._env.YEXT_ENVIRONMENT?.toLowerCase();
  const apiKey = document._env.YEXT_VISUAL_EDITOR_REVIEWS_APP_API_KEY;
  if (!cloudRegion || !environment || !apiKey) {
    console.error("Missing required parameters for reviews content endpoint.");
    return undefined;
  }
  return buildReviewsEndpointUrl(cloudRegion, environment, apiKey);
}

type CloudRegion = "us" | "eu";
type Environment = "prod" | "sbx" | "qa" | "dev";

/**
 * Builds the reviews content endpoint URL.
 * @param cloudRegion - The cloud region (e.g., "us", "eu").
 * @param environment - The environment (e.g., "prod", "sbx", "qa", "dev").
 * @param apiKey - The API key for the reviews content endpoint.
 * @returns The constructed URL for the reviews content endpoint.
 */
function buildReviewsEndpointUrl(
  cloudRegion: CloudRegion,
  environment: Environment,
  apiKey: string,
): string {
  switch (cloudRegion) {
    case "us":
      switch (environment) {
        case "prod":
          return `https://cdn.yextapis.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
        case "sbx":
          return `https://sbx-cdn.yextapis.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
        case "qa":
          return `https://streams.qa.yext.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
        case "dev":
          return `https://streams-dev.yext.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
        default:
          console.warn(
            `Unknown environment: ${environment}. Defaulting to prod.`,
          );
          return `https://cdn.yextapis.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
      }
    case "eu":
      switch (environment) {
        case "prod":
          return `https://cdn.eu.yextapis.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
        case "qa":
          return `https://qa-cdn.eu.yextapis.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
        default:
          console.warn(
            `Unknown environment: ${environment}. Defaulting to prod.`,
          );
          return `https://cdn.eu.yextapis.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
      }
    default:
      console.warn(
        `Unknown cloud region: ${cloudRegion}. Defaulting to US prod.`,
      );
      return `https://cdn.yextapis.com/v2/accounts/me/content/${REVIEWS_ENDPOINT_ID}?api_key=${apiKey}`;
  }
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

export const ReviewsSectionDemo: ComponentConfig<ReviewsSectionDemoProps> = {
  fields: reviewsFields,
  label: msg("components.reviewsSectionDemo", "Reviews Section DEMO"),
  render: (props) => <ReviewsSectionInternal {...props} />,
};
