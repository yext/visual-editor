import React from "react";
import {
  Render as PuckRender,
  resolveAllData,
  walkTree,
  type Config,
  type Data,
  type Fields,
  type PuckContext,
} from "@puckeditor/core";
import { useDocument } from "../hooks/useDocument.tsx";
import type { z } from "zod";
import { MainContent } from "../components/helpers/MainContent.tsx";

const previewContext: PuckContext = {
  isEditing: false,
  dragRef: null,
  metadata: {},
  renderDropZone: () => null,
};

/** Context and callbacks belong to the host, never to a generated spec. */
export const JsonRenderEditingContext =
  React.createContext<PuckContext>(previewContext);

export const JsonRenderSection = ({
  render: Render,
  schema,
  puckConfig,
  props,
  children,
}: {
  render: React.ComponentType<any>;
  schema?: z.ZodType;
  puckConfig?: Config;
  props: Record<string, unknown>;
  children?: React.ReactNode;
}) => {
  const puck = React.useContext(JsonRenderEditingContext);
  const { puck: _generatedPuck, ...sectionProps } = props;
  // json-render resolves bindings before calling the registry. Recheck them on
  // every render, since state may have changed since server-side acceptance.
  const result = schema?.safeParse({
    ...sectionProps,
    puck: { isEditing: puck.isEditing },
  });
  if (result && !result.success) return null;
  const validatedProps = result?.data ?? sectionProps;
  if (
    puckConfig &&
    hasSerializedSlots(validatedProps, puckConfig.components.Section.fields)
  ) {
    return <SerializedPuckSection props={validatedProps} config={puckConfig} />;
  }
  return (
    <Render {...validatedProps} puck={puck}>
      {children}
    </Render>
  );
};

/** Only fields declared as slots need Puck's data-to-component conversion. */
const hasSerializedSlots = (
  props: Record<string, any>,
  fields?: Fields
): boolean =>
  Object.entries(fields ?? {}).some(([key, field]) => {
    if (field.type === "slot") return Array.isArray(props[key]);
    if (
      field.type === "object" &&
      props[key] &&
      typeof props[key] === "object"
    ) {
      return hasSerializedSlots(props[key], field.objectFields);
    }
    return false;
  });

const SerializedPuckSection = ({
  props,
  config,
}: {
  props: Record<string, any>;
  config: Config;
}) => {
  const streamDocument = useDocument();
  const metadata = React.useMemo(() => ({ streamDocument }), [streamDocument]);
  // Schema parsing and streamed spec snapshots recreate objects with identical
  // contents. Reuse the data until serialized props actually change so an in-flight
  // slot resolution is not cancelled by another section or text delta arriving.
  const serializedProps = JSON.stringify(props);
  const data = React.useMemo<Data>(() => {
    const sectionProps: Record<string, any> = JSON.parse(serializedProps);
    let nextId = 0;
    const sectionId = sectionProps.id ?? "json-render-section";
    return walkTree(
      {
        root: { props: {} },
        content: [
          { type: "Section", props: { ...sectionProps, id: sectionId } },
        ],
      },
      config,
      (content) =>
        content.map((item) => ({
          ...item,
          props: {
            ...item.props,
            id: item.props.id ?? `${sectionId}-slot-${nextId++}`,
          },
        }))
    );
  }, [serializedProps, config]);
  const [resolved, setResolved] = React.useState<{
    source: Data;
    data: Data;
  }>();
  const [error, setError] = React.useState<Error>();
  React.useEffect(() => {
    let active = true;
    setError(undefined);
    void resolveAllData(data, config, metadata).then(
      (result) => {
        if (active) setResolved({ source: data, data: result });
      },
      (reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error ? reason : new Error(String(reason))
          );
      }
    );
    return () => {
      active = false;
    };
  }, [data, config, metadata]);
  if (error) throw error;
  if (resolved?.source !== data) return null;
  return (
    <PuckRender config={config} data={resolved.data} metadata={metadata} />
  );
};

/** Bridge json-render children into MainContent's Puck content slot. */
export const JsonRenderMainContent = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const puck = React.useContext(JsonRenderEditingContext);
  return (
    <MainContent.render
      id="MainContent-json-render"
      content={() => <>{children}</>}
      puck={puck}
    />
  );
};
