import { type PuckComponent } from "@puckeditor/core";
import { ArticleCard } from "./ArticleCard.tsx";
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
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";

type ArticleItem = {
  title: YextEntityField<TranslatableString | TranslatableRichText>;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<TranslatableAssetImage>;
};

export type ArticleListProps = {
  itemSource: ItemSourceValue<ArticleItem>;
  itemMappings?: ArticleItem;
  heading: {
    text: string;
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
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: {
        types: ["type.image"],
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
        type: "text",
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
  const streamDocument = useDocument<StreamDocument>();
  const items = articleItems.resolveItems(
    itemSource,
    itemMappings,
    streamDocument
  );

  return (
    <section className="ve-flex ve-flex-col ve-gap-6">
      {styles.showHeading && (
        <h2 className="ve-text-2xl ve-font-semibold">{heading.text}</h2>
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
            image={item.image}
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
      text: "Featured Articles",
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
