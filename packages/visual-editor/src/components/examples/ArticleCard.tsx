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
    <article className="ve-flex ve-h-full ve-flex-col ve-overflow-hidden ve-rounded-xl ve-border ve-border-gray-200 ve-bg-white ve-shadow-sm">
      {image && <Image image={image} className="ve-w-full" />}
      <div className="ve-flex ve-flex-1 ve-flex-col ve-gap-2 ve-p-5">
        <h3 className="ve-text-lg ve-font-semibold">{resolvedTitle}</h3>
        {typeof resolvedDescription === "string" ? (
          <p className="ve-text-sm ve-text-gray-700">{resolvedDescription}</p>
        ) : (
          resolvedDescription
        )}
      </div>
    </article>
  );
};
