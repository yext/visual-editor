import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  Slot,
  useGetPuck,
  createUsePuck,
  ComponentData,
  AutoField,
  setDeep,
  FieldLabel,
} from "@measured/puck";
import {
  Image,
  HeadingLevel,
  BackgroundStyle,
  YextField,
  YextEntityField,
  useDocument,
  PageSection,
  Heading,
  EntityField,
  Background,
  CTA,
  backgroundColors,
  VisibilityWrapper,
  EventSectionType,
  EventStruct,
  Timestamp,
  TimestampOption,
  ComponentFields,
  msg,
  pt,
  getAnalyticsScopeHash,
  CTAVariant,
  resolveComponentData,
  imgSizesHelper,
  resolveYextEntityField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  defaultEvent,
  EVENT_CONSTANT_CONFIG,
} from "../../internal/puck/constant-value-fields/EventSection.tsx";

const usePuck = createUsePuck();

export interface EventSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: {
    /**
     * The source of event data, which can be linked to a Yext field or provided as a constant value.
     * @defaultValue A list of 3 placeholder events.
     */
    events: YextEntityField<EventSectionType>;
  };

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 3
     */
    backgroundColor?: BackgroundStyle;
  };

  slots: {
    SectionHeadingSlot: Slot;
    CardSlot: Slot;
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

const eventSectionFields: Fields<EventSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      events: YextField(msg("fields.events", "Events"), {
        type: "entityField",
        filter: {
          types: [ComponentFields.EventSection.type],
        },
      }),
    },
  }),
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
      CardSlot: { type: "slot" },
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

export type EventCardProps = {
  /** The card number (1-based index). Used for analytics */
  cardNumber?: number;
  /** The heading level of the parent section. Used to ensure proper heading semantics */
  sectionHeadingLevel?: HeadingLevel;
  data: {
    /** Whether the event is a constant value or an entity field */
    constantValueEnabled: boolean;
    /** The event to display in the card. */
    event: EventStruct;
  };
  styles: {
    /** The h tag level of each event card's title */
    headingLevel: HeadingLevel;
    /** The background color of each event card */
    backgroundColor?: BackgroundStyle;
    /** The CTA variant to use in each event card */
    ctaVariant: CTAVariant;
    /** Whether to truncate the event description text */
    truncateDescription: boolean;
  };
};

const EventCardFields: Fields<EventCardProps> = {
  data: {
    type: "custom",
    render: ({ value, onChange }) => {
      const { event, constantValueEnabled } = value;
      if (!constantValueEnabled) {
        // TODO: use copy from design
        return <p>Using Data from Knowledge Graph</p>;
      }
      return (
        <FieldLabel label={pt("fields.Data", "Data")}>
          <AutoField
            field={EVENT_CONSTANT_CONFIG()}
            value={event}
            onChange={(v) => onChange({ constantValueEnabled, event: v })}
          />
        </FieldLabel>
      );
    },
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
      ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      truncateDescription: YextField(
        msg("fields.truncateDescription", "Truncate Description"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.truncate", "Truncate"),
              value: true,
            },
            {
              label: msg("fields.options.showFullText", "Show Full Text"),
              value: false,
            },
          ],
        }
      ),
    },
  },
};

const EventCardComponent = ({
  cardNumber,
  data,
  styles,
  sectionHeadingLevel = 2,
}: EventCardProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const { event } = data;

  if (!event) {
    return;
  }

  return (
    <Background
      background={styles.backgroundColor}
      className={`flex flex-col md:flex-row rounded-lg overflow-hidden md:items-start`}
    >
      {event.image && (
        <div className="lg:w-[45%] w-full">
          <Image
            image={event.image}
            aspectRatio={
              event.image.width && event.image.height
                ? event.image.width / event.image.height
                : 1.78
            }
            sizes={imgSizesHelper({
              base: "calc(100vw - 32px)",
              lg: "calc(maxWidth * 0.45)",
            })}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-4 p-6 w-full md:w-[55%] justify-between flex-grow">
        <div className="flex flex-col gap-2">
          {event.title && (
            <Heading
              level={styles.headingLevel}
              semanticLevelOverride={
                sectionHeadingLevel < 6
                  ? ((sectionHeadingLevel + 1) as HeadingLevel)
                  : "span"
              }
            >
              {resolveComponentData(event.title, i18n.language, streamDocument)}
            </Heading>
          )}
          {event.dateTime && (
            <Timestamp
              date={event.dateTime}
              option={TimestampOption.DATE_TIME}
              hideTimeZone={true}
            />
          )}
          {event.description && (
            <p className={styles.truncateDescription ? "md:line-clamp-2" : ""}>
              {resolveComponentData(event.description, i18n.language)}
            </p>
          )}
        </div>
        {event.cta && (
          <CTA
            eventName={`cta${cardNumber}`}
            label={resolveComponentData(
              event.cta.label,
              i18n.language,
              streamDocument
            )}
            link={resolveComponentData(
              event.cta.link,
              i18n.language,
              streamDocument
            )}
            linkType={event.cta.linkType}
            ctaType={event.cta.ctaType}
            coordinate={event.cta.coordinate}
            presetImageType={event.cta.presetImageType}
            variant={styles.ctaVariant}
          />
        )}
      </div>
    </Background>
  );
};

export const EventCard: ComponentConfig<{ props: EventCardProps }> = {
  label: msg("components.eventCard", "Event Card"),
  fields: EventCardFields,
  render: (props) => <EventCardComponent {...props} />,
};

const EventSectionComponent: PuckComponent<EventSectionProps> = (props) => {
  const {
    data,
    styles,
    slots,
    id,
    puck: { isEditing },
  } = props;

  const streamDocument = useDocument();
  const {
    i18n: { language: locale },
  } = useTranslation();
  const getPuck = useGetPuck();

  const puckComponentData: ComponentData<EventSectionProps> | undefined =
    usePuck((s) => {
      return s.getItemById(id);
    });

  const [constantValues, setConstantValues] = React.useState<EventStruct[]>([]);
  React.useEffect(() => {
    // This useEffect tracks the constant values so that they can be restored if the user switches
    // from constant values to entity field and back again.
    if (!data.events.constantValueEnabled) {
      return;
    }
    setConstantValues(
      puckComponentData?.props?.slots?.CardSlot.map(
        (slot) => slot.props.data.event
      ) || []
    );
  }, [puckComponentData?.props?.slots?.CardSlot]);

  const {
    entityValueEvents,
    numberOfEvents,
  }: { entityValueEvents: EventStruct[] | undefined; numberOfEvents: number } =
    React.useMemo(() => {
      const resolvedEvents = resolveYextEntityField<EventSectionType>(
        streamDocument,
        data.events,
        locale
      );

      if (
        !resolvedEvents ||
        (!data.events.constantValueEnabled && data.events.field === "")
      ) {
        return { entityValueEvents: undefined, numberOfEvents: 0 };
      }

      if ("numberOfConstantCards" in resolvedEvents) {
        return {
          entityValueEvents: undefined,
          numberOfEvents: resolvedEvents.numberOfConstantCards,
        };
      } else {
        return {
          entityValueEvents: resolvedEvents.events,
          numberOfEvents: resolvedEvents.events.length,
        };
      }
    }, [data.events, locale, streamDocument]);

  console.log("resolvedEvents", entityValueEvents, numberOfEvents);
  React.useEffect(() => {
    // This useEffect synchronizes the styling props of all EventCards
    if (!isEditing || !puckComponentData?.props?.id) {
      return;
    }

    const { selectedItem, dispatch, getSelectorForId } = getPuck();
    if (!selectedItem) {
      return;
    }

    const sectionSelector = getSelectorForId(id);
    const cardSelector = getSelectorForId(selectedItem.props.id);
    if (!sectionSelector || !cardSelector) {
      return;
    }

    // Merge the existing EventCard props with the new updates
    const oldCardProps = puckComponentData.props.slots
      .CardSlot as ComponentData<EventCardProps>[];

    let newCardProps: ComponentData<EventCardProps>[] | undefined;
    if (selectedItem?.type === "EventCard") {
      newCardProps = oldCardProps.map((currentSlot) => {
        return {
          type: "EventCard",
          props: {
            // Keep the unique props and data of each card
            id: currentSlot.props.id,
            cardNumber: currentSlot.props.cardNumber,
            data: currentSlot.props.data,
            sectionHeadingLevel: currentSlot.props.sectionHeadingLevel,
            // Sync the styling props across all cards
            styles: {
              headingLevel: selectedItem.props.styles.headingLevel,
              backgroundColor: selectedItem.props.styles.backgroundColor,
              ctaVariant: selectedItem.props.styles.ctaVariant,
              truncateDescription:
                selectedItem.props.styles.truncateDescription,
            },
          },
        };
      });
    } else if ((selectedItem?.type as string) === "HeadingTextSlot") {
      // When the heading text level changes in the heading text slot,
      // update all cards to reflect the new section heading level
      newCardProps = oldCardProps.map((currentSlot) => {
        return {
          type: "EventCard",
          props: {
            ...currentSlot.props,
            sectionHeadingLevel:
              puckComponentData.props.slots.SectionHeadingSlot?.[0]?.props
                .styles.level || 2,
          },
        };
      });
    }
    // Only dispatch update if the card props have changed
    if (
      !newCardProps?.length ||
      JSON.stringify(oldCardProps) === JSON.stringify(newCardProps)
    ) {
      return;
    }

    // Update the cards
    const updatedData = setDeep(
      puckComponentData,
      "props.slots.CardSlot",
      newCardProps
    );

    console.log("dispatch 1", updatedData);
    dispatch({
      type: "replace",
      destinationZone: sectionSelector.zone,
      destinationIndex: sectionSelector.index,
      data: updatedData,
    });
  }, [puckComponentData?.props.slots]);

  React.useEffect(() => {
    // This useEffect adds/removes EventCards to match the number of events
    if (!isEditing) {
      return;
    }

    const { dispatch, getSelectorForId, selectedItem } = getPuck();
    if (!selectedItem?.props?.id || selectedItem.type !== "EventSection") {
      return;
    }

    const selector = getSelectorForId(selectedItem?.props?.id);
    if (!selector) {
      return;
    }

    // Create one card for each event. Preserve the existing card props if the exist, otherwise use defaults.
    const existingCardProps: EventCardProps | undefined =
      selectedItem.props.slots.CardSlot?.[0]?.props;
    const newCardProps: { type: string; props: EventCardProps }[] =
      numberOfEvents > 0
        ? Array.from({ length: numberOfEvents }, (_, index) => ({
            type: "EventCard",
            props: {
              cardNumber: index,
              data: {
                event: entityValueEvents
                  ? entityValueEvents[index]
                  : (constantValues[index] ?? defaultEvent),
                constantValueEnabled: !!data.events.constantValueEnabled,
              },
              sectionHeadingLevel:
                puckComponentData?.props.slots.SectionHeadingSlot?.[0]?.props
                  .styles.level || 2,
              styles: {
                headingLevel: existingCardProps?.styles?.headingLevel || 4,
                backgroundColor:
                  existingCardProps?.styles?.backgroundColor ||
                  backgroundColors.background1.value,
                ctaVariant: existingCardProps?.styles?.ctaVariant || "primary",
                truncateDescription:
                  existingCardProps?.styles?.truncateDescription || true,
              },
            },
          }))
        : [];

    const updatedData = setDeep(
      selectedItem,
      "props.slots.CardSlot",
      newCardProps
    );

    console.log("dispatch 2", updatedData);
    dispatch({
      type: "replace",
      destinationZone: selector.zone,
      destinationIndex: selector.index,
      data: updatedData,
    });
  }, [data.events]);

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      <slots.SectionHeadingSlot />
      {numberOfEvents > 0 && (
        <EntityField
          displayName={pt("fields.events", "Events")}
          fieldId={data.events.field}
          constantValueEnabled={data.events.constantValueEnabled}
        >
          <slots.CardSlot className="flex flex-col gap-8" />
        </EntityField>
      )}
    </PageSection>
  );
};

/**
 * The Events Section component is designed to display a curated list of events. It features a prominent section heading and renders each event as an individual card, making it ideal for showcasing upcoming activities, workshops, or promotions.
 * Available on Location templates.
 */
export const EventSection: ComponentConfig<{ props: EventSectionProps }> = {
  label: msg("components.eventsSection", "Events Section"),
  fields: eventSectionFields,
  defaultProps: {
    data: {
      events: {
        field: "",
        constantValue: {
          numberOfConstantCards: 3,
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background3.value,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Upcoming Events",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "left" },
          },
        },
      ],
      CardSlot: [
        // filled based on data.events
      ],
    },
    analytics: {
      scope: "eventsSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "eventsSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <EventSectionComponent {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
