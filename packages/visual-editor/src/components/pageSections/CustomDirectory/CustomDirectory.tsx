import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import React from "react";
import { YextField } from "../../../editor/YextField.tsx";
import { useTemplateProps } from "../../../hooks/useDocument.tsx";
import {
  backgroundColors,
  BackgroundStyle,
  msg,
} from "../../../utils/index.ts";
import { Background } from "../../atoms/background.tsx";
import { Body } from "../../atoms/body.tsx";
import { MaybeLink } from "../../atoms/maybeLink.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { fetchData } from "./utils.ts";

export interface CustomDirectoryProps {
  slots: {
    HeadingSlot: Slot;
  };
  styles: {
    backgroundColor: BackgroundStyle;
  };
}

const CustomDirectoryFields: Fields<CustomDirectoryProps> = {
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot", allow: [] },
    },
  },
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

const API_KEY = "d8016f96c913cc8b79931cef51b941f5";

const CustomDirectory: PuckComponent<CustomDirectoryProps> = ({
  styles,
  slots,
  puck,
}) => {
  const { document: streamDocument } = useTemplateProps();

  const [entities, setEntities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const fetchEntities = async (entityIds: string[]) => {
    if (!entityIds?.length) return;

    setLoading(true);

    try {
      const res = await fetchData({
        endpoint: "https://cdn.yextapis.com/v2/accounts/me/entities",
        apiKey: API_KEY,
        entityIds: entityIds.join(","),
      });

      const fetchedEntities = res?.entities ?? [];

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
    }
  }, [streamDocument?.dm_childEntityIds]);

  const handleClick = (item: any) => {
    const childIds = item.dm_childEntityIds;

    if (childIds?.length) {
      fetchEntities(childIds);
    }
  };

  return (
    <Background background={styles.backgroundColor}>
      {loading && <></>}
      <PageSection className="flex flex-col items-center gap-2">
        {slots?.HeadingSlot && <slots.HeadingSlot style={{ height: "auto" }} />}{" "}
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
                  key={item.id ?? item.uid}
                  className="h-full flex flex-col p-1"
                  background={styles.backgroundColor}
                >
                  <li>
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

export const CustomDirectoryComponent: ComponentConfig<{
  props: CustomDirectoryProps;
}> = {
  label: msg("components.CustomDirectory", "Custom Directory"),

  fields: CustomDirectoryFields,

  defaultProps: {
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Directory",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "center" },
          } satisfies HeadingTextProps,
        },
      ],
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
  },
  render: (props) => <CustomDirectory {...props} />,
};
