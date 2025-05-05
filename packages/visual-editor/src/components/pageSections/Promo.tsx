import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  YextEntityField,
  Image,
  BackgroundStyle,
  backgroundColors,
  Heading,
  CTA,
  PageSection,
  YextField,
  VisibilityWrapper,
  EntityField,
} from "@yext/visual-editor";
import { ImageType, CTA as CTAType } from "@yext/pages-components";

/** TODO remove types when spruce is ready */
type PromoType = {
  image?: ImageType;
  title?: string; // single line text
  description?: RTF2;
  CTA?: CTAType;
};

type RTF2 = {
  html?: string;
  json?: Record<string, any>;
};
/** end of hardcoded types */

export interface PromoSectionProps {
  promo: YextEntityField<PromoType>;
  styles: {
    backgroundColor?: BackgroundStyle;
    orientation: "left" | "right";
  };
  liveVisibility: boolean;
}

const promoSectionFields: Fields<PromoSectionProps> = {
  promo: YextField("Promo", {
    type: "entityField",
    filter: {
      types: ["type.promo"],
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      orientation: YextField("Image Orientation", {
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const PromoWrapper: React.FC<PromoSectionProps> = ({ promo, styles }) => {
  const document = useDocument();
  const resolvedPromo = resolveYextEntityField(document, promo);

  return (
    <PageSection
      background={styles.backgroundColor}
      className={themeManagerCn(
        "flex flex-col md:flex-row overflow-hidden md:gap-8",
        styles.orientation === "right" && "md:flex-row-reverse"
      )}
    >
      <EntityField
        fieldId={promo.field}
        constantValueEnabled={promo.constantValueEnabled}
      >
        {resolvedPromo?.image && (
          <Image
            image={resolvedPromo.image}
            layout={"auto"}
            aspectRatio={resolvedPromo.image.width / resolvedPromo.image.height}
          />
        )}
        <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 md:px-16 pt-4 md:pt-0 w-full break-words">
          {resolvedPromo?.title && (
            <Heading level={3}>{resolvedPromo?.title}</Heading>
          )}
          {resolvedPromo?.description?.html && (
            <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
              <div
                dangerouslySetInnerHTML={{
                  __html: resolvedPromo.description.html,
                }}
              />
            </div>
          )}
          {resolvedPromo?.CTA && (
            <CTA
              label={resolvedPromo?.CTA.label}
              link={resolvedPromo?.CTA.link}
              linkType={resolvedPromo?.CTA.linkType}
            />
          )}
        </div>
      </EntityField>
    </PageSection>
  );
};

export const PromoSection: ComponentConfig<PromoSectionProps> = {
  label: "Promo Section",
  fields: promoSectionFields,
  defaultProps: {
    promo: {
      field: "",
      constantValue: {},
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      orientation: "left",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <PromoWrapper {...props} />
    </VisibilityWrapper>
  ),
};
