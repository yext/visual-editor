import React from "react";
import { useTranslation } from "react-i18next";
import { useDocument } from "../../hooks/useDocument.tsx";
import { CTA } from "../atoms/cta.tsx";
import { Image } from "../atoms/image.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { type EnhancedTranslatableCTA } from "../../types/types.ts";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";
import { type TranslatableAssetImage } from "../../types/images.ts";

export type ArticleCardProps = {
  title?: TranslatableString;
  description?: TranslatableRichText;
  highlights?: TranslatableString[];
  image?: TranslatableAssetImage;
  cta?: EnhancedTranslatableCTA;
};

export const ArticleCard = ({
  title,
  description,
  highlights,
  image,
  cta,
}: ArticleCardProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedTitle = resolveComponentData(
    title,
    i18n.language,
    streamDocument,
    {
      output: "plainText",
    }
  );
  const resolvedDescription = description
    ? resolveComponentData(description, i18n.language, streamDocument)
    : undefined;
  const resolvedHighlights =
    highlights?.map((highlight) =>
      resolveComponentData(highlight, i18n.language, streamDocument, {
        output: "plainText",
      })
    ) ?? [];
  const resolvedCtaLabel = cta
    ? resolveComponentData(cta.label, i18n.language, streamDocument, {
        output: "plainText",
      })
    : "";
  const resolvedCtaLink = cta
    ? resolveComponentData(cta.link, i18n.language, streamDocument, {
        output: "plainText",
      })
    : "";

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
        {!!resolvedHighlights.length && (
          <ul className="ve-list-disc ve-pl-5 ve-text-sm ve-text-gray-700">
            {resolvedHighlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        )}
        {resolvedCtaLabel && resolvedCtaLink && (
          <div className="ve-mt-auto ve-pt-3">
            <CTA
              label={resolvedCtaLabel}
              link={resolvedCtaLink}
              linkType={cta?.linkType}
              normalizeLink={cta?.normalizeLink ?? true}
              openInNewTab={cta?.openInNewTab}
              target={cta?.openInNewTab ? "_blank" : undefined}
              ctaType={cta?.ctaType}
              variant="link"
            />
          </div>
        )}
      </div>
    </article>
  );
};
