import { type Config, type Data } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import React from "react";
import { getAnalyticsScopeHash } from "../../utils/applyAnalytics.ts";

type DynamicRegistration = {
  analytics?: {
    scope?: string;
  };
  components?: Record<string, DynamicRegistration>;
};

/**
 * Wraps generated design-mode component configs so each instance gets its own
 * Yext analytics scope and transform-backed CTA props receive a deterministic
 * event name derived from the authored field name.
 */
export const withDynamicConfigAnalytics = <T extends Config>(
  configWithDynamicComponents: T,
  data: Partial<Data>
): T => {
  if (!configWithDynamicComponents) {
    return configWithDynamicComponents;
  }

  const dynamicComponents = (
    data.root?.props as { _dynamicConfig?: DynamicRegistration } | undefined
  )?._dynamicConfig?.components;

  if (!dynamicComponents || Object.keys(dynamicComponents).length === 0) {
    return configWithDynamicComponents;
  }

  return {
    ...configWithDynamicComponents,
    components: Object.fromEntries(
      Object.entries(configWithDynamicComponents.components ?? {}).map(
        ([componentName, component]) => {
          const dynamicRegistration = dynamicComponents[componentName];

          if (!dynamicRegistration) {
            return [componentName, component];
          }

          const ctaFieldNames = Object.entries(component.fields ?? {})
            .filter(([, field]) => field?.type === "testCTA")
            .map(([fieldName]) => fieldName);
          const scopePrefix =
            dynamicRegistration.analytics?.scope ??
            `generated.${componentName}`;
          const render = component.render as (
            props: Record<string, any>
          ) => React.ReactNode;

          return [
            componentName,
            {
              ...component,
              render: (props: Record<string, any>) => {
                const analyticsProps = ctaFieldNames.reduce(
                  (nextProps, fieldName) => {
                    const fieldValue = nextProps[fieldName];

                    if (!React.isValidElement(fieldValue)) {
                      return nextProps;
                    }

                    const ctaElement = fieldValue as React.ReactElement<{
                      eventName?: string;
                    }>;

                    if (ctaElement.props?.eventName) {
                      return nextProps;
                    }

                    return {
                      ...nextProps,
                      [fieldName]: React.cloneElement(ctaElement, {
                        eventName: fieldName,
                      }),
                    };
                  },
                  props
                );

                return (
                  <AnalyticsScopeProvider
                    name={`${scopePrefix}${getAnalyticsScopeHash(props.id)}`}
                  >
                    {render(analyticsProps)}
                  </AnalyticsScopeProvider>
                );
              },
            },
          ];
        }
      )
    ),
  };
};
