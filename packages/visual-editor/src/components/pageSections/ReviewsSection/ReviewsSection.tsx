import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight, FaChevronDown } from "react-icons/fa";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import * as React from "react";
import {
  backgroundColors,
  type BackgroundStyle,
  Body,
  Button,
  getAggregateRating,
  getAnalyticsScopeHash,
  msg,
  PageSection,
  ReviewStars,
  TimestampAtom,
  TimestampOption,
  useBackground,
  useDocument,
  YextField,
  VisibilityWrapper,
  HeadingTextProps,
  pt,
  StreamDocument,
} from "@yext/visual-editor";
import { StarOff } from "lucide-react";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import { useTemplateMetadata } from "../../../internal/hooks/useMessageReceivers";
import { ComponentErrorBoundary } from "../../ComponentErrorBoundary";

type Review = {
  authorName: string;
  content?: string;
  rating: number;
  reviewDate: string;
  comments?: { content: string; commentDate: string }[];
};

type StreamDocumentWithReviews = StreamDocument & {
  ref_reviewsAgg?: {
    publisher: string;
    reviewCount?: number;
    averageRating?: number;
    topReviews?: Review[];
  }[];
};

const REVIEWS_PER_PAGE = 5;
const DATE_FORMAT: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

export interface ReviewsSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 1
     */
    backgroundColor?: BackgroundStyle;
  };

  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

/** @internal */
const ReviewsEmptyState: React.FC<{ backgroundColor: BackgroundStyle }> = ({
  backgroundColor,
}) => {
  const templateMetadata = useTemplateMetadata();
  const entityTypeDisplayName = templateMetadata?.entityTypeDisplayName;

  return (
    <PageSection background={backgroundColor}>
      <div className="relative h-[300px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5">
        <StarOff className="w-12 h-12 text-gray-400" />
        <div className="flex flex-col items-center gap-0">
          <Body variant="base" className="text-gray-500 font-medium">
            {pt(
              "reviewsEmptyStateSectionHidden",
              "Section hidden for this {{entityType}}",
              {
                entityType: entityTypeDisplayName
                  ? entityTypeDisplayName.toLowerCase()
                  : "page",
              }
            )}
          </Body>
          <Body variant="base" className="text-gray-500 font-normal">
            {pt(
              "reviewsEmptyStateNoReviews",
              "{{entityType}} has no first party reviews",
              {
                entityType: entityTypeDisplayName
                  ? entityTypeDisplayName.charAt(0).toUpperCase() +
                    entityTypeDisplayName.slice(1)
                  : "Entity",
              }
            )}
          </Body>
        </div>
      </div>
    </PageSection>
  );
};

const reviewsFields: Fields<ReviewsSectionProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      SectionHeadingSlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const ReviewsSectionInternal: PuckComponent<ReviewsSectionProps> = (props) => {
  const { styles, slots, puck } = props;
  const [currentPageNumber, setCurrentPageNumber] = React.useState(0);
  const streamDocument = useDocument<StreamDocumentWithReviews>();

  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const reviews = streamDocument.ref_reviewsAgg?.find(
    (agg) => agg.publisher === "FIRSTPARTY"
  )?.topReviews;

  if (!reviews?.length) {
    if (puck?.isEditing) {
      return (
        <ReviewsEmptyState
          backgroundColor={
            styles?.backgroundColor ?? backgroundColors.background1.value
          }
        />
      );
    }
    return <></>;
  }

  const reviewsPage = reviews.slice(
    currentPageNumber * REVIEWS_PER_PAGE,
    (currentPageNumber + 1) * REVIEWS_PER_PAGE
  );

  return (
    <PageSection
      className="flex flex-col gap-12"
      background={styles?.backgroundColor}
    >
      <div className="flex flex-col gap-3">
        <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
        <ReviewsHeader
          averageRating={averageRating}
          reviewCount={reviewCount}
        />
      </div>
      <ReviewsList reviews={reviewsPage} streamDocument={streamDocument} />
      <PageScroller
        numberOfReviews={reviews?.length ?? 0}
        currentPageNumber={currentPageNumber}
        setPageNumber={setCurrentPageNumber}
      />
    </PageSection>
  );
};

interface ReviewsHeaderProps {
  averageRating: number;
  reviewCount: number;
}

const ReviewsHeader: React.FC<ReviewsHeaderProps> = (props) => {
  const { averageRating, reviewCount } = props;
  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <ReviewStars averageRating={averageRating} reviewCount={reviewCount} />
    </div>
  );
};

const ReviewsList: React.FC<{
  reviews: Review[];
  streamDocument: StreamDocument;
}> = ({ reviews, streamDocument }) => {
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review, index) => (
        <Review
          key={`review-${index}`}
          index={index}
          review={review}
          streamDocument={streamDocument}
        />
      ))}
    </div>
  );
};

const Review: React.FC<{
  review: Review;
  index: number;
  streamDocument: StreamDocument;
}> = ({ review, index, streamDocument }) => {
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
    const businessName = streamDocument.name || "";
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
  const streamDocument = useDocument<StreamDocumentWithReviews>();
  return (
    <div className="flex flex-col gap-2">
      <Body variant={"lg"} className="font-bold">
        {author}
      </Body>
      <TimestampAtom
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
  numberOfReviews: number;
  currentPageNumber: number;
  setPageNumber: (newPageNumber: number) => void;
}

const PageScroller: React.FC<PageScrollerProps> = ({
  numberOfReviews,
  currentPageNumber,
  setPageNumber,
}) => {
  const analytics = useAnalytics();
  const background = useBackground();
  const numPages = Math.ceil(numberOfReviews / REVIEWS_PER_PAGE);

  if (numPages <= 1) {
    return <></>;
  }

  const selectableButtonClasses = `cursor-pointer ${background?.isDarkBackground ? "text-white" : "text-palette-primary-dark"}`;
  const disabledButtonClasses = "opacity-50 cursor-default";
  return (
    <Body className="flex flex-row justify-center items-center gap-5">
      <FaArrowLeft
        className={`${currentPageNumber === 0 ? disabledButtonClasses : selectableButtonClasses}`}
        data-ya-action={analytics?.getDebugEnabled() ? "PAGINATE" : undefined}
        data-ya-eventname={
          analytics?.getDebugEnabled() ? "previousPage" : undefined
        }
        onClick={() => {
          if (currentPageNumber > 0) {
            setPageNumber(currentPageNumber - 1);
            analytics?.track({ eventName: "previousPage", action: "PAGINATE" });
          }
        }}
      />
      <FaArrowRight
        className={`${currentPageNumber === numPages - 1 ? disabledButtonClasses : selectableButtonClasses}`}
        data-ya-action={analytics?.getDebugEnabled() ? "PAGINATE" : undefined}
        data-ya-eventname={
          analytics?.getDebugEnabled() ? "nextPage" : undefined
        }
        onClick={() => {
          if (currentPageNumber < numPages - 1) {
            setPageNumber(currentPageNumber + 1);
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

/**
 * The Reviews Section displays customer reviews fetched dynamically from the Yext Reviews API. It features a customizable section heading and shows review details including ratings, content, and timestamps.
 * Available on Location templates.
 */
export const ReviewsSection: ComponentConfig<{ props: ReviewsSectionProps }> = {
  fields: reviewsFields,
  label: msg("components.reviewsSection", "Reviews Section"),
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  cs: "Nedávné recenze",
                  da: "Nylige anmeldelser",
                  de: "Neuere Bewertungen",
                  en: "Recent Reviews",
                  "en-GB": "Recent Reviews",
                  es: "Revisiones recientes",
                  et: "Viimased ülevaated",
                  fi: "Viimeaikaiset arvostelut",
                  fr: "Revues récentes",
                  hr: "Nedavne recenzije",
                  hu: "Legutóbbi vélemények",
                  it: "Recensioni recenti",
                  ja: "最近のレビュー",
                  lt: "Naujausios apžvalgos",
                  lv: "Nesenie pārskati",
                  nb: "Nyere anmeldelser",
                  nl: "Recente beoordelingen",
                  pl: "Ostatnie recenzje",
                  pt: "Revisões recentes",
                  ro: "Recenzii recente",
                  sk: "Posledné recenzie",
                  sv: "Senaste recensioner",
                  tr: "Son İncelemeler",
                  zh: "最近的评论",
                  "zh-TW": "最近的評論",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 3, align: "center" },
          } satisfies HeadingTextProps,
        },
      ],
    },
    analytics: {
      scope: "reviewsSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "reviewsSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <ReviewsSectionInternal {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
