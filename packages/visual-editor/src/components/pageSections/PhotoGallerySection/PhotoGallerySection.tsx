import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import "pure-react-carousel/dist/react-carousel.es.css";
import {
  backgroundColors,
  BackgroundStyle,
  PageSection,
  YextField,
  VisibilityWrapper,
  msg,
  HeadingTextProps,
} from "@yext/visual-editor";
import { AssetImageType } from "../../../types/images.ts";
import { PhotoGalleryWrapperProps } from "./PhotoGalleryWrapper.tsx";

const PLACEHOLDER_WIDTH = 1000;
const PLACEHOLDER_HEIGHT = 570;
const PLACEHOLDER_IMAGE_URL = `https://placehold.co/${PLACEHOLDER_WIDTH}x${PLACEHOLDER_HEIGHT}/png`;
export const PLACEHOLDER: AssetImageType = {
  url: PLACEHOLDER_IMAGE_URL,
  width: PLACEHOLDER_WIDTH,
  height: PLACEHOLDER_HEIGHT,
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
      <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
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
      backgroundColor: backgroundColors.background1.value,
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
                  { assetImage: PLACEHOLDER },
                  { assetImage: PLACEHOLDER },
                  { assetImage: PLACEHOLDER },
                ],
                constantValueEnabled: true,
              },
            },
            styles: {
              image: {
                aspectRatio: 1.78,
              },
            },
          } satisfies PhotoGalleryWrapperProps,
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <PhotoGallerySectionComponent {...props} />
    </VisibilityWrapper>
  ),
};
