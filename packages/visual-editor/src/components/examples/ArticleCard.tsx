import React from "react";
import { useTranslation } from "react-i18next";
import { useDocument } from "../../hooks/useDocument.tsx";
import { Image } from "../atoms/image.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";
import { type TranslatableAssetImage } from "../../types/images.ts";

export type ArticleCardProps = {
  title?: string | TranslatableString | TranslatableRichText;
  description?: string | TranslatableRichText;
  image?: TranslatableAssetImage;
};

export const ArticleCard = ({
  title,
  description,
  image,
}: ArticleCardProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedTitle =
    typeof title === "string"
      ? title
      : resolveComponentData(title, i18n.language, streamDocument, {
          output: "plainText",
        });
  const resolvedDescription =
    typeof description === "string"
      ? description
      : description
        ? resolveComponentData(description, i18n.language, streamDocument)
        : undefined;

  return (
    <article className="ve-flex ve-flex-col ve-gap-4">
      {image && (
        <Image
          image={image}
          className="ve-w-full ve-rounded-image-borderRadius"
        />
      )}
      <div className="ve-flex ve-flex-col ve-gap-2">
        <h3 className="ve-text-lg ve-font-semibold">{resolvedTitle}</h3>
        {typeof resolvedDescription === "string" ? (
          <p>{resolvedDescription}</p>
        ) : (
          resolvedDescription
        )}
      </div>
    </article>
  );
};
