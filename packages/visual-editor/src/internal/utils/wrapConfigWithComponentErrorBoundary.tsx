import { Config } from "@puckeditor/core";
import React from "react";
import { ComponentErrorBoundary } from "../components/ComponentErrorBoundary.tsx";

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
      Object.entries(components).map(([componentKey, component]) => {
        const WrappedComponent = (props: any) => {
          return component.render(props);
        };

        return [
          componentKey,
          {
            ...component,
            render: (props: any) => (
              <ComponentErrorBoundary
                isEditing={props.puck?.isEditing ?? false}
                resetKeys={[props]}
              >
                <WrappedComponent {...props} />
              </ComponentErrorBoundary>
            ),
          },
        ];
      })
    ),
  };

  return wrappedConfig;
};
