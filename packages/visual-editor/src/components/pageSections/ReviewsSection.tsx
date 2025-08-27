import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight, FaChevronDown } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { ComponentConfig, Fields } from "@measured/puck";
import * as React from "react";
import {
  backgroundColors,
  type BackgroundStyle,
  Body,
  Button,
  fetchReviewsForEntity,
  getAggregateRating,
  getAnalyticsScopeHash,
  Heading,
  msg,
  PageSection,
  ReviewStars,
  Timestamp,
  TimestampOption,
  useBackground,
  useDocument,
  YextField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";

const REVIEWS_PER_PAGE = 5;
const DATE_FORMAT: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

export type ReviewsSectionProps = {
  backgroundColor: BackgroundStyle;
  analytics: {
    scope?: string;
  };
};

const reviewsFields: Fields<ReviewsSectionProps> = {
  backgroundColor: YextField(
    msg("fields.backgroundColor", "Background Color"),
    {
      type: "select",
      options: "BACKGROUND_COLOR",
    }
  ),
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
};

const ReviewsSectionInternal: React.FC<ReviewsSectionProps> = (
  props: ReviewsSectionProps
) => {
  const streamDocument = useDocument();
  const apiKey = streamDocument?._env?.YEXT_VISUAL_EDITOR_REVIEWS_APP_API_KEY;
  if (!apiKey) {
    console.warn(
      "Missing YEXT_VISUAL_EDITOR_REVIEWS_APP_API_KEY, unable to access reviews content endpoint."
    );
    return <></>;
  }
  const businessId: number = Number(streamDocument?.businessId);
  const contentDeliveryAPIDomain =
    streamDocument?._yext?.contentDeliveryAPIDomain;
  const entityId = streamDocument?.uid;
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

  const { averageRating, reviewCount } = getAggregateRating(streamDocument);

  if (reviewsStatus !== "success" || (!isLoading && reviewCount === 0)) {
    return <></>;
  }

  const headerProps: ReviewsHeaderProps = {
    averageRating,
    reviewCount,
    isLoading,
  };

  const pageScrollerProps: PageScrollerProps = {
    reviewCount,
    currentPageNumber,
    fetchData: setCurrentPageNumber,
  };

  return (
    <PageSection
      className="flex flex-col gap-12"
      background={props.backgroundColor}
    >
      <ReviewsHeader {...headerProps} />
      {reviews && (
        <>
          <ReviewsList reviews={reviews?.response?.docs} />
          <PageScroller {...pageScrollerProps} />
        </>
      )}
    </PageSection>
  );
};

interface ReviewsHeaderProps {
  averageRating: number;
  reviewCount: number;
  isLoading: boolean;
}

const ReviewsHeader: React.FC<ReviewsHeaderProps> = (props) => {
  const { averageRating, reviewCount, isLoading } = props;
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
          <ReviewStars
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
        )}
      </div>
    </div>
  );
};

const ReviewsList: React.FC<{ reviews: any[] }> = ({ reviews }) => {
  if (!reviews) {
    return <></>; // No reviews to display while loading
  }
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review, index) => (
        <Review key={`review-${index}`} index={index} review={review} />
      ))}
    </div>
  );
};

const Review: React.FC<{
  review: any;
  index: number;
}> = ({ review, index }) => {
  const authorData: AuthorWithDateProps = {
    author: review.authorName,
    date: review.reviewDate,
  };
  const reviewContentData: ReviewContentProps = {
    rating: review.rating,
    ...(review.content && { content: review.content }),
    index,
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
      index,
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
  const streamDocument = useDocument();
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
        locale={streamDocument?.locale}
        dateFormatOverride={DATE_FORMAT}
      />
    </div>
  );
};

interface ReviewContentProps {
  rating: number;
  content?: string;
  index: number;
}

const ReviewContent: React.FC<ReviewContentProps> = ({
  rating,
  content,
  index,
}) => {
  const reviewStars = <ReviewStars averageRating={rating} />;
  if (!content) {
    return <div className="flex flex-col gap-2">{reviewStars}</div>;
  }
  const expandableContentData = {
    content: content,
    preContentElement: reviewStars,
    analyticsName: `review${index}`,
  };
  return <ExpandableContent {...expandableContentData} />;
};

interface BusinessResponseProps {
  businessName: string;
  content: string;
  date: string;
  index: number;
}

const BusinessResponse: React.FC<BusinessResponseProps> = ({
  businessName,
  content,
  date,
  index,
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
    analyticsName: `businessResponse${index}`,
  };
  return <ExpandableContent {...expandableContentData} />;
};

interface ExpandableContentProps {
  content: string;
  preContentElement?: React.ReactNode;
  analyticsName: string;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({
  content,
  preContentElement,
  analyticsName,
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
        <ShowMoreButton
          expanded={expanded}
          setExpanded={setExpanded}
          analyticsName={analyticsName}
        />
      )}
    </div>
  );
};

interface PageScrollerProps {
  reviewCount: number;
  currentPageNumber: number;
  fetchData: (newPageNumber: number) => void;
}

const PageScroller: React.FC<PageScrollerProps> = ({
  reviewCount,
  currentPageNumber,
  fetchData,
}) => {
  const analytics = useAnalytics();
  const background = useBackground();
  const numPages = Math.ceil(reviewCount / REVIEWS_PER_PAGE);

  if (numPages <= 1) {
    return <></>;
  }

  const selectableButtonClasses = `cursor-pointer ${background?.isDarkBackground ? "text-white" : "text-palette-primary-dark"}`;
  const disabledButtonClasses = "opacity-50 cursor-default";
  return (
    <Body className="flex flex-row justify-center items-center gap-5">
      <FaArrowLeft
        className={`${currentPageNumber === 1 ? disabledButtonClasses : selectableButtonClasses}`}
        data-ya-action={analytics?.getDebugEnabled() ? "PAGINATE" : undefined}
        data-ya-eventname={
          analytics?.getDebugEnabled() ? "previousPage" : undefined
        }
        onClick={() => {
          if (currentPageNumber > 1) {
            fetchData(currentPageNumber - 1);
            analytics?.track({ eventName: "previousPage", action: "PAGINATE" });
          }
        }}
      />
      <FaArrowRight
        className={`${currentPageNumber === numPages ? disabledButtonClasses : selectableButtonClasses}`}
        data-ya-action={analytics?.getDebugEnabled() ? "PAGINATE" : undefined}
        data-ya-eventname={
          analytics?.getDebugEnabled() ? "nextPage" : undefined
        }
        onClick={() => {
          if (currentPageNumber < numPages) {
            fetchData(currentPageNumber + 1);
            analytics?.track({ eventName: "nextPage", action: "PAGINATE" });
          }
        }}
      />
    </Body>
  );
};

const ShowMoreButton: React.FC<{
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  analyticsName: string;
}> = ({ expanded, setExpanded, analyticsName }) => {
  const { t } = useTranslation();
  const analytics = useAnalytics();
  return (
    <Button
      className="font-body-fontFamily text-body-fontSize underline cursor-pointer inline-flex items-center gap-2"
      onClick={() => {
        expanded // the existing state before toggling
          ? analytics?.track({
              action: "COLLAPSE",
              eventName: `${analyticsName}-showLess`,
            })
          : analytics?.track({
              action: "EXPAND",
              eventName: `${analyticsName}-showMore`,
            });
        setExpanded(!expanded);
      }}
      variant={"link"}
      data-ya-action={
        analytics?.getDebugEnabled()
          ? expanded
            ? "COLLAPSE"
            : "EXPAND"
          : undefined
      }
      data-ya-eventname={
        analytics?.getDebugEnabled()
          ? `${analyticsName}-${expanded ? "showLess" : "showMore"}`
          : undefined
      }
    >
      {expanded ? t("showLess", "Show less") : t("showMore", "Show more")}
      <FaChevronDown
        className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        style={{ textDecoration: "underline" }}
      />
    </Button>
  );
};

export const ReviewsSection: ComponentConfig<{ props: ReviewsSectionProps }> = {
  fields: reviewsFields,
  label: msg("components.reviewsSection", "Reviews Section"),
  defaultProps: {
    backgroundColor: backgroundColors.background1.value,
    analytics: {
      scope: "reviewsSection",
    },
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "reviewsSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <ReviewsSectionInternal {...props} />
    </AnalyticsScopeProvider>
  ),
};
