import { Config } from "@puckeditor/core";
import React from "react";
import { ComponentErrorBoundary } from "../components/ComponentErrorBoundary.tsx";

const wrappedConfigCache = new WeakMap<Config<any>, Config<any>>();

export const wrapConfigWithComponentErrorBoundary = (
  config: Config<any>
): Config<any> => {
  const cachedConfig = wrappedConfigCache.get(config);
  if (cachedConfig) {
    return cachedConfig;
  }

  const components = config.components ?? {};
  if (Object.keys(components).length === 0) {
    wrappedConfigCache.set(config, config);
    return config;
  }

  const wrappedConfig: Config<any> = {
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
    ) as Config<any>["components"],
  };

  wrappedConfigCache.set(config, wrappedConfig);

  return wrappedConfig;
};
