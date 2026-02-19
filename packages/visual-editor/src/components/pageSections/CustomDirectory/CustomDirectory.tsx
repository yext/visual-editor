import { ComponentConfig, Fields, WithPuckProps } from "@puckeditor/core";
import React, { useState } from "react";
import { YextField } from "../../../editor/YextField.tsx";
import { useTemplateProps } from "../../../hooks/useDocument.tsx";
import {
  backgroundColors,
  BackgroundStyle,
  msg,
} from "../../../utils/index.ts";
import { Background } from "../../atoms/background.tsx";
import { Heading } from "../../atoms/heading.tsx";
import { MaybeLink } from "../../atoms/maybeLink.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { Body } from "../../atoms/body.tsx";
import { BreadcrumbItem, CustomBreadcrumbs } from "../CustomBreadcrumbs.tsx";

export interface CustomDirectoryProps {
  data: {
    rootTitle: string;
    cardTitle: string;
    cardDescription: string;
  };
  styles: {
    backgroundColor: BackgroundStyle;
  };
}

const API_KEY = "d8016f96c913cc8b79931cef51b941f5";
const API_VERSION = "20250101";

const CustomDirectory = ({
  data: { rootTitle = "FAQs", cardTitle, cardDescription },
  styles,
  puck,
}: WithPuckProps<CustomDirectoryProps>) => {
  const { document: streamDocument } = useTemplateProps();
  console.log(cardTitle, cardDescription);

  const [entities, setEntities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pageTitle, setPageTitle] = useState<string>(rootTitle);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const fetchEntities = async (entityIds: string[]) => {
    if (!entityIds?.length) return;

    setLoading(true);

    try {
      const res = await fetch(
        `https://cdn.yextapis.com/v2/accounts/me/entities` +
          `?entityIds=${entityIds.join(",")}` +
          `&api_key=${API_KEY}` +
          `&v=${API_VERSION}`
      );

      if (!res.ok) {
        console.error("Failed to fetch entities:", res.status);
        return;
      }

      const json = await res.json();

      const fetchedEntities = json.response?.entities ?? [];

      console.log("Fetched entities:", fetchedEntities);

      setEntities(fetchedEntities);
    } catch (error) {
      console.error("Entity fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const childIds = streamDocument?.dm_childEntityIds;

    if (childIds?.length) {
      fetchEntities(childIds);

      setBreadcrumbs([
        {
          id: streamDocument.meta?.id,
          name: rootTitle,
          slug: childIds,
        },
      ]);
    }
  }, [streamDocument]);

  const handleClick = (item: any) => {
    const childIds = item.dm_childEntityIds;

    if (childIds?.length) {
      fetchEntities(childIds);

      setPageTitle(item.name);

      setBreadcrumbs((prev) => [
        ...prev,
        {
          id: item.meta?.id,
          name: item.name,
          slug: childIds,
        },
      ]);
    }
  };
  const handleBreadcrumbClick = (index: number) => {
    const crumb = breadcrumbs[index];

    fetchEntities(crumb.slug!);

    setPageTitle(crumb.name);

    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };
  return (
    <Background background={styles.backgroundColor}>
      {loading && <></>}
      <PageSection className="flex flex-col items-center gap-2">
        <CustomBreadcrumbs
          breadcrumbs={breadcrumbs}
          onNavigate={handleBreadcrumbClick}
          puck={puck}
        />
        <Heading level={2}>{pageTitle}</Heading>
        <PageSection
          verticalPadding="sm"
          background={backgroundColors.background1.value}
          className={"flex min-h-0 min-w-0 mx-auto"}
        >
          <ul className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 w-full">
            {entities.map((item, index) => {
              const hasChildren = item.dm_childEntityIds?.length > 0;

              return (
                <Background
                  className="h-full flex flex-col p-1"
                  background={styles.backgroundColor}
                >
                  <li key={index}>
                    <MaybeLink
                      variant="directoryLink"
                      eventName={`link${index}`}
                      href={hasChildren ? "#" : `/${item.meta.id}`}
                      className="text-wrap break-words block w-full flex items-center"
                      disabled={puck.isEditing}
                    >
                      <div
                        key={item.meta?.id}
                        onClick={(e) => {
                          if (hasChildren) {
                            e.preventDefault();
                            handleClick(item);
                            setPageTitle(item.name);
                          }
                        }}
                      >
                        <Body variant={"lg"}>{item.name}</Body>
                      </div>
                    </MaybeLink>
                  </li>
                </Background>
              );
            })}
          </ul>
        </PageSection>
      </PageSection>
    </Background>
  );
};

const customDirectoryFields: Fields<CustomDirectoryProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      rootTitle: YextField(msg("fields.title", "Title"), {
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
    },
  }),
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
};

export const CustomDirectoryComponent: ComponentConfig<{
  props: CustomDirectoryProps;
}> = {
  label: msg("components.customDirectory", "Custom Directory"),

  fields: customDirectoryFields,

  defaultProps: {
    data: {
      rootTitle: "Directory",
      cardTitle: "Card Title",
      cardDescription: "Card Description",
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
  },

  render: (props) => <CustomDirectory {...props} />,
};
