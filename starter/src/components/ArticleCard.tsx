import React from "react";
import {
  resolveComponentData,
  useDocument,
  type StreamDocument,
  type TranslatableRichText,
  type TranslatableString,
} from "../../../packages/visual-editor/src/index.ts";
import { useTranslation } from "react-i18next";

export type ArticleCardProps = {
  title?: TranslatableString;
  description?: TranslatableRichText;
};

export const ArticleCard = ({ title, description }: ArticleCardProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument<StreamDocument>();

  return (
    <article className="ve-flex ve-h-full ve-flex-col ve-gap-3 ve-rounded-2xl ve-border ve-border-gray-200 ve-bg-white ve-p-6 ve-shadow-sm">
      <h3 className="ve-text-xl ve-font-semibold ve-text-gray-900">
        {resolveComponentData(title, i18n.language, streamDocument, {
          output: "plainText",
        })}
      </h3>
      <div className="ve-text-sm ve-leading-6 ve-text-gray-600">
        {resolveComponentData(description, i18n.language, streamDocument)}
      </div>
    </article>
  );
};
