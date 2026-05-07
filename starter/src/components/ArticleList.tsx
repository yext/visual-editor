import React from "react";
import {
  createItemSource,
  resolveComponentData,
  toPuckFields,
  useDocument,
  type StreamDocument,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
} from "../../../packages/visual-editor/src/index.ts";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "./ArticleCard.tsx";

type ArticleCardFields = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
};

const articleSource = createItemSource<ArticleCardFields>({
  label: "Articles",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
  },
});

export type ArticleListProps = {
  articles: typeof articleSource.value;
  heading: {
    text: TranslatableString;
  };
};

const articleListFields = {
  articles: articleSource.field,
  heading: {
    type: "object",
    label: "Heading",
    objectFields: {
      text: {
        type: "translatableString",
        label: "Text",
      },
    },
  },
};

const ArticleListComponent = ({ heading, articles }: ArticleListProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument<StreamDocument>();
  const items = articleSource.resolveItems(articles, streamDocument);

  return (
    <section className="ve-mx-auto ve-w-full ve-max-w-6xl ve-px-4 ve-py-10">
      <h2 className="ve-mb-6 ve-text-3xl ve-font-semibold ve-text-gray-900">
        {resolveComponentData(heading.text, i18n.language, streamDocument, {
          output: "plainText",
        })}
      </h2>
      <div className="ve-grid ve-gap-6 md:ve-grid-cols-2 lg:ve-grid-cols-3">
        {items.map((item, index) => (
          <ArticleCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export const ArticleList: YextComponentConfig<ArticleListProps> = {
  label: "Article List",
  fields: toPuckFields(articleListFields),
  defaultProps: {
    articles: articleSource.defaultValue,
    heading: {
      text: {
        defaultValue: "Linked Articles",
      },
    },
  },
  render: (props) => <ArticleListComponent {...props} />,
};
