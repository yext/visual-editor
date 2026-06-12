import { Config } from "@puckeditor/core";
import React from "react";
import { ComponentErrorBoundary } from "../components/ComponentErrorBoundary.tsx";

type ConfigComponent = NonNullable<Config["components"]>[string];

export const wrapComponentConfigWithErrorBoundary = <T extends ConfigComponent>(
  component: T
): T => {
  const WrappedComponent = (props: any) => {
    return component.render(props);
  };

  return {
    ...component,
    render: (props: any) => (
      <ComponentErrorBoundary
        isEditing={props.puck?.isEditing ?? false}
        resetKeys={[props]}
      >
        <WrappedComponent {...props} />
      </ComponentErrorBoundary>
    ),
  };
};

export const wrapConfigWithComponentErrorBoundary = <T extends Config>(
  config: T
): T => {
  const components = config.components ?? {};
  if (Object.keys(components).length === 0) {
    return config;
  }

  const wrappedConfig = {
    ...config,
    components: Object.fromEntries(
      Object.entries(components).map(([componentKey, component]) => [
        componentKey,
        wrapComponentConfigWithErrorBoundary(component),
      ])
    ),
  };

  return wrappedConfig;
};
