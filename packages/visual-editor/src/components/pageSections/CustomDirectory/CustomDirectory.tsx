import { WithPuckProps, Fields, ComponentConfig } from "@puckeditor/core";
import React from "react";
import { YextField } from "../../../editor/YextField.tsx";
import { useTemplateProps } from "../../../hooks/useDocument.tsx";
import { msg } from "../../../utils/index.ts";
import { Body } from "../../atoms/body.tsx";
import { MaybeRTF } from "../../atoms/maybeRTF.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { Heading } from "../../atoms/heading.tsx";

export interface CustomDirectoryProps {
  data: {
    title: string;
    cardTitle: string;
    cardDescription: string;
    cardType: "Grid" | "Accordion";
  };
}

const CustomDirectory = ({
  data: { title, cardTitle, cardDescription, cardType },
}: WithPuckProps<CustomDirectoryProps>) => {
  const { document: streamDocument } = useTemplateProps();
  const [entities, setEntities] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchEntities = async () => {
      const childIds = streamDocument?.dm_childEntityIds;
      console.log("childIds:", childIds);

      if (!childIds?.length) return;

      const apiKey = "";
      const v = "";

      try {
        const res = await fetch(
          `https://cdn.yextapis.com/v2/accounts/me/entities` +
            `?entityIds=${childIds.join(",")}` +
            `&api_key=${apiKey}&v=${v}`
        );

        if (!res.ok) {
          console.error("Failed to fetch entities:", res.status);
          return;
        }

        const json = await res.json();

        console.log("Fetched entities:", json.response);

        setEntities(json.response?.entities ?? []);
      } catch (error) {
        console.error("Entity fetch error:", error);
      }
    };

    fetchEntities();
  }, [streamDocument]);

  return (
    <PageSection>
      <Heading level={3}>
        {title}
        {cardTitle}
        {cardType}
      </Heading>

      <Body>
        <MaybeRTF data={cardDescription} />
      </Body>

      {/* Render hydrated entities */}
      <div>
        {entities.map((entity) => (
          <div key={entity.id}>
            <h4>{entity.name}</h4>
            <p>{entity.description}</p>
          </div>
        ))}
      </div>
    </PageSection>
  );
};

const customDirectoryFields: Fields<CustomDirectoryProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      title: YextField(msg("fields.title", "Title"), {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      cardTitle: YextField(msg("fields.cardTitle", "Card Title"), {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      cardDescription: YextField(msg("fields.description", "Description"), {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      cardType: {
        label: msg("fields.cardType", "Card Type"),
        type: "radio",
        options: [
          { label: "Grid", value: "Grid" },
          { label: "Accordion", value: "Accordion" },
        ],
      },
    },
  }),
};

export const CustomDirectoryComponent: ComponentConfig<{
  props: CustomDirectoryProps;
}> = {
  label: msg("components.customDirectory", "Custom Directory"),
  fields: customDirectoryFields,
  defaultProps: {
    data: {
      title: "Test",
      cardTitle: "Test Card",
      cardDescription: "Test Descriptiom",
      cardType: "Grid",
    },
  },
  render: (props) => <CustomDirectory {...props} />,
};
