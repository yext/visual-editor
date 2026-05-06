import { type PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "./ArticleCard.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import {
  toPuckFields,
  type YextFields,
  type YextComponentConfig,
} from "../../fields/fields.ts";
import { type ItemSourceValue } from "../../fields/ItemSourceField.tsx";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { createItemSource } from "../../utils/createItemSource.ts";
import { type StreamDocument } from "../../utils/types/StreamDocument.ts";
import { type TranslatableAssetImage } from "../../types/images.ts";
import {
  type EnhancedTranslatableCTA,
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";

type ArticleItem = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  highlights: YextEntityField<TranslatableString[]>;
  image: YextEntityField<TranslatableAssetImage>;
  cta: YextEntityField<EnhancedTranslatableCTA>;
};

export type ArticleListProps = {
  itemSource: ItemSourceValue<ArticleItem>;
  itemMappings?: ArticleItem;
  heading: {
    text: TranslatableString;
  };
  styles: {
    showHeading: boolean;
    columns: number;
  };
};

const articleItems = createItemSource<ArticleListProps, ArticleItem>({
  itemSourcePath: "itemSource",
  itemMappingsPath: "itemMappings",
  itemSourceLabel: "Articles",
  itemMappingsLabel: "Article Mappings",
  itemFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: {
        types: ["type.string"],
      },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
    highlights: {
      type: "entityField",
      label: "Highlights",
      filter: {
        types: ["type.string"],
        includeListsOnly: true,
      },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: {
        types: ["type.image"],
      },
    },
    cta: {
      type: "entityField",
      label: "CTA",
      filter: {
        types: ["type.cta"],
      },
    },
  },
});

const articleListFields: YextFields<ArticleListProps> = {
  ...articleItems.fields,
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
  styles: {
    type: "object",
    label: "Styles",
    objectFields: {
      showHeading: {
        type: "radio",
        label: "Show Heading",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      },
      columns: {
        type: "number",
        label: "Columns",
      },
    },
  },
};

const ArticleListComponent: PuckComponent<ArticleListProps> = ({
  heading,
  itemSource,
  itemMappings,
  styles,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument<StreamDocument>();
  const items = articleItems.resolveItems(
    itemSource,
    itemMappings,
    streamDocument
  );
  const resolvedHeadingText = resolveComponentData(
    heading.text,
    i18n.language,
    streamDocument,
    {
      output: "plainText",
    }
  );

  return (
    <section className="ve-flex ve-flex-col ve-gap-6">
      {styles.showHeading && (
        <h2 className="ve-text-2xl ve-font-semibold">{resolvedHeadingText}</h2>
      )}
      <div
        className="ve-grid ve-gap-6"
        style={{
          gridTemplateColumns: `repeat(${styles.columns}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item, index) => (
          <ArticleCard
            key={index}
            title={item.title}
            description={item.description}
            highlights={item.highlights}
            image={item.image}
            cta={item.cta}
          />
        ))}
      </div>
    </section>
  );
};

export const ArticleList: YextComponentConfig<ArticleListProps> = {
  label: "Article List",
  fields: articleListFields,
  defaultProps: {
    ...articleItems.defaultProps,
    itemSource: articleItems.defaultProps.itemSource!,
    itemMappings: articleItems.defaultProps.itemMappings!,
    heading: {
      text: { defaultValue: "Featured Articles" },
    },
    styles: {
      showHeading: true,
      columns: 3,
    },
  },
  resolveFields: (data) =>
    toPuckFields({
      ...articleListFields,
      ...articleItems.resolveFields(data),
    }),
  render: (props) => <ArticleListComponent {...props} />,
};
