// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiHeading } from "../atoms/YetiHeading.tsx";
import { YetiParagraph } from "../atoms/YetiParagraph.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

type ImageValue = {
  url?: string;
  width?: number;
  height?: number;
  image?: {
    url?: string;
  };
};

const resolveImageUrl = (value: ImageValue | undefined): string => {
  if (!value) {
    return "";
  }
  if (value.url) {
    return value.url;
  }
  if (value.image?.url) {
    return value.image.url;
  }
  return "";
};

export interface YetiExploreCardsSlotProps {
  data: {
    cards: Array<{
      title: TranslatableString;
      description: TranslatableString;
      actionText: TranslatableString;
      actionHref: string;
      image: YextEntityField<ImageValue>;
    }>;
  };
}

const defaultCard = {
  title: toTranslatableString("Card Title"),
  description: toTranslatableString("Card description."),
  actionText: toTranslatableString("Learn more"),
  actionHref: "#",
  image: {
    field: "",
    constantValue: {
      url: "",
      width: 800,
      height: 600,
    },
    constantValueEnabled: true,
  },
};

const fields: Fields<YetiExploreCardsSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      cards: YextField("Cards", {
        type: "array",
        defaultItemProps: defaultCard,
        arrayFields: {
          title: YextField("Title", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          description: YextField("Description", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          actionText: YextField("Action Text", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          actionHref: YextField("Action Href", {
            type: "text",
          }),
          image: YextField("Image", {
            type: "entityField",
            filter: { types: ["type.image"] },
          }),
        },
      }),
    },
  }),
};

const YetiExploreCardsSlotComponent: PuckComponent<
  YetiExploreCardsSlotProps
> = ({ data }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  return (
    <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {data.cards.map((card, index) => {
        const title = resolveComponentData(
          card?.title,
          i18n.language,
          streamDocument
        );
        const description = resolveComponentData(
          card?.description,
          i18n.language,
          streamDocument
        );
        const actionText = resolveComponentData(
          card?.actionText,
          i18n.language,
          streamDocument
        );
        const imageValue = resolveComponentData(
          card?.image,
          i18n.language,
          streamDocument
        ) as ImageValue | undefined;
        const imageUrl = resolveImageUrl(imageValue);

        return (
          <article
            key={`explore-card-${index}`}
            className="flex min-w-0 flex-col overflow-hidden border border-black/10 bg-white"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={typeof title === "string" ? title : "Explore card"}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-44 w-full bg-neutral-200" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
              {title ? <YetiHeading level={4}>{title}</YetiHeading> : null}
              {description ? (
                <YetiParagraph className="text-sm leading-relaxed">
                  {description}
                </YetiParagraph>
              ) : null}
              {actionText ? (
                <a
                  href={card.actionHref || "#"}
                  className="mt-auto text-sm font-semibold underline underline-offset-4"
                >
                  {actionText}
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export const defaultYetiExploreCardsSlotProps: YetiExploreCardsSlotProps = {
  data: {
    cards: [
      {
        title: toTranslatableString("Gift Wrapping"),
        description: toTranslatableString(
          "Complimentary wrapping paper and a YETI gift tag are available in store."
        ),
        actionText: toTranslatableString(""),
        actionHref: "",
        image: {
          field: "",
          constantValue: {
            url: "https://yeti-webmedia.imgix.net/m/14c68cf7b51b5c21/original/230107_PLP_TV_Lifestyle_GiftWrap_Desktop-2x.jpg?auto=format,compress&h=750",
            width: 1200,
            height: 750,
          },
          constantValueEnabled: true,
        },
      },
      {
        title: toTranslatableString("Visit Our Garage"),
        description: toTranslatableString(
          "Personalize your Tundra cooler only in select stores."
        ),
        actionText: toTranslatableString(""),
        actionHref: "",
        image: {
          field: "",
          constantValue: {
            url: "https://yeti-webmedia.imgix.net/m/f7e93674cdfe9c6/original/230107_HP_TV_Product_1-4_Spotlight_Studio_GG_Desktop-2x.jpg?auto=format,compress&h=750",
            width: 1200,
            height: 750,
          },
          constantValueEnabled: true,
        },
      },
      {
        title: toTranslatableString("Get Rewarded for Recycling"),
        description: toTranslatableString(
          "Receive $5 off a $25+ purchase for eligible Rambler products in store."
        ),
        actionText: toTranslatableString("See more"),
        actionHref: "https://www.yeti.com/rambler-buy-back.html",
        image: {
          field: "",
          constantValue: {
            url: "https://yeti-webmedia.imgix.net/m/2d483e0edf43662d/original/230107_PLP_TV_Lifestyle_Recycle_Desktop-2x.jpg?auto=format,compress&h=750",
            width: 1200,
            height: 750,
          },
          constantValueEnabled: true,
        },
      },
      {
        title: toTranslatableString("Live Music & Events"),
        description: toTranslatableString(
          "Check upcoming events, including live music and book tours."
        ),
        actionText: toTranslatableString("See more"),
        actionHref: "https://www.facebook.com/Yeti/events",
        image: {
          field: "",
          constantValue: {
            url: "https://yeti-webmedia.imgix.net/m/5f18bc18f671f952/original/230107_PLP_TV_Lifestyle_Live_Events_Desktop-2x.jpg?auto=format,compress&h=750",
            width: 1200,
            height: 750,
          },
          constantValueEnabled: true,
        },
      },
    ],
  },
};

export const YetiExploreCardsSlot: ComponentConfig<{
  props: YetiExploreCardsSlotProps;
}> = {
  label: "Yeti Explore Cards Slot",
  fields,
  defaultProps: defaultYetiExploreCardsSlotProps,
  render: (props) => <YetiExploreCardsSlotComponent {...props} />,
};
