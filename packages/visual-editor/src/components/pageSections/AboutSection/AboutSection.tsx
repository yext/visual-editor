import React from "react";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  Slot,
  WithId,
} from "@puckeditor/core";
import {
  backgroundColors,
  BackgroundStyle,
  BodyTextProps,
  Button,
  HeadingLevel,
  HeadingTextProps,
  msg,
  PageSection,
  VisibilityWrapper,
  YextField,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";
import {
  AboutSectionDetailsColumnProps,
  defaultAboutSectionProps,
} from "./AboutSectionDetailsColumn";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary";

const placeholderText = {
  en: {
    json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.","type":"text","version":1},{"type":"linebreak","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.","type":"text","version":1},{"type":"linebreak","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.","type":"text","version":1},{"type":"linebreak","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
    html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</span><br/><br/><span>Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</span><br/><br/><span>In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</span><br/><br/><span>Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</span></p>',
  },
  hasLocalizedValue: "true",
};

export type AboutSectionProps = {
  /**
   * This object contains properties for customizing the component's data.
   * @propCategory Data Props
   */
  data: {
    showDetailsColumn: boolean;
  };
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 2
     */
    backgroundColor?: BackgroundStyle;
  };

  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    DescriptionSlot: Slot;
    SidebarSlot: Slot;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
};

const aboutSectionFields: Fields<AboutSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      showDetailsColumn: YextField(
        msg("fields.showDetailsColumn", "Show Details Column"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.yes", "Yes"),
              value: true,
            },
            {
              label: msg("fields.options.no", "No"),
              value: false,
            },
          ],
        }
      ),
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
      SectionHeadingSlot: {
        type: "slot",
      },
      DescriptionSlot: {
        type: "slot",
      },
      SidebarSlot: {
        type: "slot",
      },
    },
    visible: false,
  },
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

const AboutComponent: PuckComponent<AboutSectionProps> = (props) => {
  const { data, styles, slots } = props;
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const [isDescriptionOverflown, setIsDescriptionOverflown] =
    React.useState(false);
  const descriptionSlotRef = React.useRef<HTMLDivElement>(null);

  // Only show expand/collapse button if the description content is truncated
  React.useLayoutEffect(() => {
    if (!descriptionSlotRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const bodyText = descriptionSlotRef.current?.querySelector(
        ".description-slot"
      ) as HTMLElement | undefined;

      if (!bodyText) {
        return;
      }

      setIsDescriptionOverflown(bodyText.scrollHeight > bodyText.clientHeight);
    });

    observer.observe(descriptionSlotRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col lg:flex-row gap-8"
    >
      <div className="w-full lg:w-2/3 flex flex-col flex-none">
        <slots.SectionHeadingSlot
          style={{ height: "auto" }}
          className="mb-8"
          allow={[]}
        />
        <div ref={descriptionSlotRef}>
          <slots.DescriptionSlot
            style={{ height: "auto" }}
            className={`description-slot mb-2 ${expanded ? "" : "line-clamp-[10] lg:line-clamp-none"}`}
            allow={[]}
          />
        </div>
        {(isDescriptionOverflown || expanded) && (
          <Button
            variant="link"
            className="visible lg:hidden font-body-fontFamily font-bold text-body-fontSize no-underline cursor-pointer inline-flex items-center gap-2"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? t("readLess", "Read less") : t("readMore", "Read more")}
            <FaChevronDown
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              size={12}
            />
          </Button>
        )}
      </div>
      {data.showDetailsColumn && (
        <slots.SidebarSlot
          style={{ height: "auto", width: "100%" }}
          allow={[]}
        />
      )}
    </PageSection>
  );
};

export const AboutSection: ComponentConfig<{ props: AboutSectionProps }> = {
  label: msg("components.aboutSection", "About Section"),
  fields: aboutSectionFields,
  defaultProps: {
    data: {
      showDetailsColumn: true,
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "About [[name]]",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      DescriptionSlot: [
        {
          type: "BodyTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: placeholderText,
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "base",
            },
            parentStyles: {
              className: "",
            },
          } satisfies BodyTextProps,
        },
      ],
      SidebarSlot: [
        {
          type: "AboutSectionDetailsColumn",
          props: {
            sections: [
              {
                header: {
                  field: "",
                  constantValue: {
                    en: "Hours",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                content: {
                  type: "hoursStatus",
                  hoursStatus: defaultAboutSectionProps.hoursStatus,
                },
              },
              {
                header: {
                  field: "",
                  constantValue: {
                    en: "Services Offered",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                content: {
                  type: "textList",
                  textList: {
                    list: {
                      field: "services",
                      constantValue: [],
                    },
                    commaSeparated: false,
                  },
                },
              },
              {
                header: {
                  field: "",
                  constantValue: {
                    en: "Follow Us",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
                content: {
                  type: "socialMedia",
                  socialMedia: defaultAboutSectionProps.socialMedia,
                },
              },
            ],
          } satisfies AboutSectionDetailsColumnProps,
        },
      ],
    },
    liveVisibility: true,
  },
  resolveData: (data) => {
    const sectionHeadingLevel = (
      data.props.slots.SectionHeadingSlot?.[0]?.props as
        | WithId<HeadingTextProps>
        | undefined
    )?.styles?.level;

    if (
      data.props.slots.SectionHeadingSlot?.[0]?.props &&
      data.props.slots.SidebarSlot?.[0]?.props &&
      sectionHeadingLevel
    ) {
      const semanticOverride =
        typeof sectionHeadingLevel === "number" && sectionHeadingLevel < 6
          ? ((sectionHeadingLevel + 1) as HeadingLevel)
          : "span";
      (
        data.props.slots.SidebarSlot[0]
          .props as WithId<AboutSectionDetailsColumnProps>
      ).headingLevelOverride = semanticOverride;
    }

    return data;
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
        iconSize="md"
      >
        <AboutComponent {...props} />
      </VisibilityWrapper>
    </ComponentErrorBoundary>
  ),
};
