import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@measured/puck";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  Image,
  YextField,
  msg,
  pt,
  imgSizesHelper,
  ImgSizesByBreakpoint,
  resolveDataFromParent,
  AssetImageType,
  TranslatableString,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";
import { ImageStylingFields, ImageStylingProps } from "./styling.ts";
import { EmptyImageState } from "./EmptyImageState";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";
const DEFAULT_LINK = "#";
const LINK_REGEX_VALIDATION = /^(https?:\/\/[^\s]+|\/[^\s]*|#[^\s]*)$/;

export interface ImageWrapperProps {
  data: {
    /** The image to display. */
    image: YextEntityField<ImageType | ComplexImageType | AssetImageType>;
    link?: TranslatableString;
  };

  /** Size and aspect ratio of the image. */
  styles: ImageStylingProps;

  /** @internal Controlled data from the parent section. */
  parentData?: {
    field: string;
    image: ImageType | ComplexImageType | AssetImageType | undefined;
  };

  /** Additional CSS classes to apply to the image. */
  className?: string;

  sizes?: ImgSizesByBreakpoint;

  hideWidthProp?: boolean;
}

export const ImageWrapperFields: Fields<ImageWrapperProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      image: YextField<any, ImageType | ComplexImageType | AssetImageType>(
        msg("fields.options.image", "Image"),
        {
          type: "entityField",
          filter: {
            types: ["type.image"],
          },
        }
      ),
      link: YextField(msg("fields.link", "Link"), {
        type: "translatableString",
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      ...ImageStylingFields,
    },
  }),
};

const ImageWrapperComponent: PuckComponent<ImageWrapperProps> = (props) => {
  const {
    data,
    styles,
    parentData,
    className,
    puck,
    sizes = {
      base: styles.width ? `min(100vw, width)` : "100vw",
      md: styles.width
        ? `min(width, calc((maxWidth - 32px) / 2))`
        : "maxWidth / 2",
    },
    hideWidthProp,
  } = props;
  const { i18n, t } = useTranslation();
  const streamDocument = useDocument();
  const resolvedImage = React.useMemo(() => {
    return parentData
      ? parentData?.image
      : resolveComponentData(data.image, i18n.language, streamDocument);
  }, [parentData, data.image, i18n.language, streamDocument]);

  const getImageUrl = (
    image: ImageType | ComplexImageType | AssetImageType | undefined
  ): string | undefined => {
    if (!image) {
      return undefined;
    }

    if ("image" in image) {
      return image.image?.url;
    }

    return image.url;
  };

  const imageUrl = getImageUrl(resolvedImage);
  const isEmpty =
    !resolvedImage ||
    !imageUrl ||
    (typeof imageUrl === "string" && imageUrl.trim() === "");

  const inputLink = resolveComponentData(
    data.link ?? { en: DEFAULT_LINK, hasLocalizedValue: "true" as const },
    i18n.language,
    streamDocument
  );

  const resolvedLink =
    typeof inputLink === "string" &&
    LINK_REGEX_VALIDATION.test(inputLink.trim())
      ? inputLink.trim()
      : DEFAULT_LINK;
  const isPlaceHolderLink = resolvedLink === "#";

  if (isEmpty) {
    return (
      <EmptyImageState
        isEmpty={isEmpty}
        isEditing={puck.isEditing ?? false}
        constantValueEnabled={data.image.constantValueEnabled ?? false}
        constantValue={data.image.constantValue as AssetImageType | undefined}
        fieldId={parentData ? parentData.field : data.image.field}
        containerStyle={{
          ...(hideWidthProp
            ? {}
            : styles.width
              ? { width: `${styles.width}px` }
              : {}),
          ...(styles.aspectRatio ? { aspectRatio: styles.aspectRatio } : {}),
        }}
        containerClassName={
          className || "max-w-full rounded-image-borderRadius w-full h-full"
        }
        fullHeight
        dragRef={puck.dragRef ?? undefined}
        hasParentData={!!parentData}
      />
    );
  }

  const transformedSizes = imgSizesHelper(sizes, `${styles.width}px`);

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={parentData ? parentData.field : data.image.field}
      constantValueEnabled={!parentData && data.image.constantValueEnabled}
      fullHeight
      ref={puck.dragRef}
    >
      <div className="w-full h-full">
        <Link
          className={isPlaceHolderLink ? "cursor-auto pointer-events-none" : ""}
          href={resolvedLink}
          eventName="clickedOnImage"
          aria-label={t("link", "Link")}
        >
          <Image
            image={resolvedImage}
            aspectRatio={styles.aspectRatio}
            width={hideWidthProp ? undefined : styles.width}
            className={
              className || "max-w-full rounded-image-borderRadius w-full h-full"
            }
            sizes={transformedSizes}
          />
        </Link>
      </div>
    </EntityField>
  );
};

export const imageDefaultProps = {
  data: {
    image: {
      field: "",
      constantValue: {
        url: PLACEHOLDER_IMAGE_URL,
        height: 360,
        width: 640,
      },
      constantValueEnabled: true,
    },
    link: { en: DEFAULT_LINK, hasLocalizedValue: "true" as const },
  },
  styles: {
    aspectRatio: 1.78,
    width: 640,
  },
  allowWidthProp: true,
};

export const ImageWrapper: ComponentConfig<{ props: ImageWrapperProps }> = {
  label: msg("components.image", "Image"),
  inline: true,
  fields: ImageWrapperFields,
  defaultProps: imageDefaultProps,
  resolveFields: (data) => {
    const fields = resolveDataFromParent(ImageWrapperFields, data);

    if (data.props.hideWidthProp) {
      return setDeep(fields, "styles.objectFields.width.visible", false);
    }

    return setDeep(fields, "styles.objectFields.width.visible", true);
  },
  render: (props) => <ImageWrapperComponent {...props} />,
};
