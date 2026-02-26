import { useTranslation } from "react-i18next";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@puckeditor/core";
import "pure-react-carousel/dist/react-carousel.es.css";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../../utils/themeConfigOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { AssetImageType } from "../../../types/images.ts";
import { PhotoGalleryWrapperProps } from "./PhotoGalleryWrapper.tsx";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";

// Generate 3 random placeholder images for the gallery
export const PLACEHOLDER: AssetImageType = {
  ...getRandomPlaceholderImageObject({ width: 1000, height: 570 }),
  width: 1000,
  height: 570,
  assetImage: {
    name: "Placeholder",
  },
};

export interface PhotoGalleryStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * The layout style for displaying images in the gallery.
   * @defaultValue "gallery"
   */
  variant: "gallery" | "carousel";

  /**
   * Whether to show the section heading
   * @defaultValue true
   */
  showSectionHeading: boolean;
}

export interface PhotoGallerySectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: PhotoGalleryStyles;

  /** @internal */
  slots: {
    HeadingSlot: Slot;
    PhotoGalleryWrapper: Slot;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const photoGallerySectionFields: Fields<PhotoGallerySectionProps> = {
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
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "select",
        options: [
          { label: msg("fields.options.gallery", "Gallery"), value: "gallery" },
          {
            label: msg("fields.options.carousel", "Carousel"),
            value: "carousel",
          },
        ],
      }),
      showSectionHeading: YextField(
        msg("fields.showSectionHeading", "Show Section Heading"),
        {
          type: "radio",
          options: "SHOW_HIDE",
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot" },
      PhotoGalleryWrapper: { type: "slot" },
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

const PhotoGallerySectionComponent: PuckComponent<PhotoGallerySectionProps> = ({
  styles,
  slots,
}) => {
  const { t } = useTranslation();

  return (
    <PageSection
      aria-label={t("photoGallerySection", "Photo Gallery Section")}
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {styles.showSectionHeading && (
        <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
      )}
      <slots.PhotoGalleryWrapper style={{ height: "auto" }} allow={[]} />
    </PageSection>
  );
};

/**
 * The Photo Gallery Section is designed to display a collection of images in a visually appealing format. It consists of a main heading for the section and a flexible grid of images, with options for styling the image presentation.
 * Available on Location templates.
 */
export const PhotoGallerySection: ComponentConfig<{
  props: PhotoGallerySectionProps;
}> = {
  label: msg("components.photoGallerySection", "Photo Gallery Section"),
  fields: photoGallerySectionFields,
  defaultProps: {
    styles: {
      variant: "gallery",
      backgroundColor: backgroundColors.background1.value,
      showSectionHeading: true,
    },
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Gallery",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              level: 2,
              align: "left",
            },
          } satisfies HeadingTextProps,
        },
      ],
      PhotoGalleryWrapper: [
        {
          type: "PhotoGalleryWrapper",
          props: {
            data: {
              images: {
                field: "",
                constantValue: [
                  {
                    assetImage: {
                      ...getRandomPlaceholderImageObject({
                        width: 1000,
                        height: 570,
                      }),
                      width: 1000,
                      height: 570,
                      assetImage: { name: "Placeholder" },
                    },
                  },
                  {
                    assetImage: {
                      ...getRandomPlaceholderImageObject({
                        width: 1000,
                        height: 570,
                      }),
                      width: 1000,
                      height: 570,
                      assetImage: { name: "Placeholder" },
                    },
                  },
                  {
                    assetImage: {
                      ...getRandomPlaceholderImageObject({
                        width: 1000,
                        height: 570,
                      }),
                      width: 1000,
                      height: 570,
                      assetImage: { name: "Placeholder" },
                    },
                  },
                ],
                constantValueEnabled: true,
              },
            },
            styles: {
              image: {
                aspectRatio: 1.78,
              },
              carouselImageCount: 1,
            },
            parentData: {
              variant: "gallery",
            },
          } satisfies PhotoGalleryWrapperProps,
        },
      ],
    },
    liveVisibility: true,
  },
  resolveData(data) {
    if (
      data.props.slots.PhotoGalleryWrapper[0]?.props.parentData?.variant ===
      data.props.styles.variant
    ) {
      return data;
    }

    return setDeep(
      data,
      "props.slots.PhotoGalleryWrapper[0].props.parentData.variant",
      data.props.styles.variant
    );
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <PhotoGallerySectionComponent {...props} />
      </VisibilityWrapper>
    </ComponentErrorBoundary>
  ),
};
