type DynamicComponent = {
  html?: unknown;
  styles?: unknown;
  streaming?: unknown;
  fields?: unknown;
  defaultProps?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const supportedFieldTypes = new Set([
  "testEntityField",
  "testRichText",
  "testImage",
  "testCTA",
]);

const getFieldLabel = (fieldName: string): string => {
  return fieldName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());
};

const getDefaultProps = (
  fieldName: string,
  fieldType: string,
  value: string
): Record<string, unknown> => {
  if (fieldType === "testEntityField") {
    return {
      field: "",
      constantValue: value.trim() || getFieldLabel(fieldName),
      constantValueEnabled: true,
    };
  }
  if (fieldType === "testRichText") {
    return {
      field: "",
      constantValue: {
        en: {
          json: "",
          html: value.trim() || `<p>${getFieldLabel(fieldName)}</p>`,
        },
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    };
  }
  if (fieldType === "testImage") {
    return {
      field: "",
      constantValueEnabled: true,
      constantValue: {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        alternateText: getFieldLabel(fieldName),
      },
      aspectRatio: 1.78,
      imageFillType: "fill",
      width: 640,
    };
  }

  return {
    field: "",
    constantValueEnabled: true,
    selectedType: "textAndLink",
    constantValue: {
      ctaType: "textAndLink",
      label: {
        en: "Learn More",
        hasLocalizedValue: "true",
      },
      link: "/learn-more",
      linkType: "URL",
    },
  };
};

const hasMeaningfulDefault = (value: unknown, fieldType: string): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  if (value.constantValueEnabled === false) {
    return typeof value.field === "string" && value.field.trim().length > 0;
  }

  if (value.constantValueEnabled !== true) {
    return false;
  }

  if (fieldType === "testEntityField") {
    return (
      typeof value.constantValue === "string" &&
      value.constantValue.trim().length > 0
    );
  }
  if (fieldType === "testRichText") {
    const localizedValue = isRecord(value.constantValue)
      ? value.constantValue.en
      : undefined;
    return (
      isRecord(localizedValue) &&
      typeof localizedValue.html === "string" &&
      localizedValue.html.replace(/<[^>]*>/g, "").trim().length > 0
    );
  }
  if (fieldType === "testImage") {
    return (
      isRecord(value.constantValue) &&
      typeof value.constantValue.url === "string" &&
      value.constantValue.url.trim().length > 0
    );
  }

  return (
    isRecord(value.constantValue) &&
    isRecord(value.constantValue.label) &&
    typeof value.constantValue.label.en === "string" &&
    value.constantValue.label.en.trim().length > 0
  );
};

const getFieldDefinition = (
  fieldName: string,
  fieldType: string
): Record<string, unknown> => {
  const label = getFieldLabel(fieldName);
  if (fieldType === "testEntityField") {
    return {
      type: fieldType,
      label,
      filter: { types: ["type.string"] },
      output: "plainText",
    };
  }
  if (fieldType === "testRichText") {
    return {
      type: fieldType,
      label,
      filter: { types: ["type.string", "type.rich_text_v2"] },
    };
  }
  if (fieldType === "testImage") {
    return {
      type: fieldType,
      label,
      filter: { types: ["type.image"] },
    };
  }
  return { type: fieldType, label };
};

/**
 * Converts Puck design-mode annotations into the transform-backed authored
 * values that Yext custom fields require. Puck supplies only annotation types
 * and HTML defaults, while transforms require matching fields and defaultProps.
 */
export const normalizeDynamicConfig = (
  dynamicConfig: unknown
): { dynamicConfig: unknown; changed: boolean } => {
  if (!isRecord(dynamicConfig) || !isRecord(dynamicConfig.components)) {
    return { dynamicConfig, changed: false };
  }

  let changed = false;
  const components = Object.fromEntries(
    Object.entries(dynamicConfig.components).map(
      ([componentName, component]) => {
        if (!isRecord(component) || typeof component.html !== "string") {
          return [componentName, component];
        }

        const registration = component as DynamicComponent;
        const html = component.html;
        const fields = isRecord(registration.fields)
          ? { ...registration.fields }
          : {};
        const defaultProps = isRecord(registration.defaultProps)
          ? { ...registration.defaultProps }
          : {};
        const fieldPattern =
          /<([A-Za-z][\w-]*)\b([^>]*?)data-puck-field-([A-Za-z][\w-]*)\s*=\s*'({[\s\S]*?})'([^>]*)>([\s\S]*?)<\/\1>/g;
        let match: RegExpExecArray | null;
        let normalizedHtml = html;
        let componentChanged = registration.streaming === true;

        while ((match = fieldPattern.exec(html)) !== null) {
          const [
            fieldMarkup,
            tagName,
            attributesBefore,
            fieldName,
            rawShape,
            attributesAfter,
            innerHtml,
          ] = match;
          try {
            const shape = JSON.parse(rawShape);
            if (
              !isRecord(shape) ||
              typeof shape.type !== "string" ||
              !supportedFieldTypes.has(shape.type)
            ) {
              continue;
            }

            if (!fields[fieldName]) {
              fields[fieldName] = getFieldDefinition(fieldName, shape.type);
              componentChanged = true;
            }
            if (!hasMeaningfulDefault(defaultProps[fieldName], shape.type)) {
              defaultProps[fieldName] = getDefaultProps(
                fieldName,
                shape.type,
                innerHtml
              );
              componentChanged = true;
            }
            if (innerHtml.trim()) {
              normalizedHtml = normalizedHtml.replace(
                fieldMarkup,
                "<" +
                  tagName +
                  attributesBefore +
                  "data-puck-field-" +
                  fieldName +
                  "='" +
                  rawShape +
                  "'" +
                  attributesAfter +
                  "></" +
                  tagName +
                  ">"
              );
              componentChanged = true;
            }
          } catch {
            continue;
          }
        }

        changed ||= componentChanged;
        const { streaming: _streaming, ...settledRegistration } = registration;
        return [
          componentName,
          {
            ...settledRegistration,
            html: normalizedHtml,
            styles: registration.styles,
            fields,
            defaultProps,
          },
        ];
      }
    )
  );

  return changed
    ? {
        dynamicConfig: {
          ...dynamicConfig,
          components,
        },
        changed,
      }
    : { dynamicConfig, changed };
};

/**
 * Normalizes dynamic component registrations and repairs generated instances
 * that were inserted before their fields and default props were available.
 */
export const normalizeDynamicData = (
  data: Data<any, any>,
  config: Config
): { data: Data; changed: boolean } => {
  const rootProps = isRecord(data.root?.props) ? data.root.props : {};
  const normalized = normalizeDynamicConfig(rootProps._dynamicConfig);
  const normalizedDynamicConfig = isRecord(normalized.dynamicConfig)
    ? normalized.dynamicConfig
    : {};
  const components = normalizedDynamicConfig.components;

  if (!isRecord(components)) {
    return { data, changed: normalized.changed };
  }

  let instancesChanged = false;
  const dataWithRepairedInstances = walkTree(data, config, (content) => {
    return content.map((component) => {
      const registration = components[component.type];
      if (!isRecord(registration) || !isRecord(registration.fields)) {
        return component;
      }

      const defaultProps = isRecord(registration.defaultProps)
        ? registration.defaultProps
        : {};
      const props = component.props;
      let repairedProps: typeof component.props | undefined;

      Object.entries(registration.fields).forEach(([fieldName, field]) => {
        if (!isRecord(field) || typeof field.type !== "string") {
          return;
        }
        const defaultValue = defaultProps[fieldName];
        if (
          !supportedFieldTypes.has(field.type) ||
          hasMeaningfulDefault(props[fieldName], field.type) ||
          !hasMeaningfulDefault(defaultValue, field.type)
        ) {
          return;
        }

        repairedProps ??= { ...props };
        repairedProps[fieldName] = defaultValue as any;
      });

      if (!repairedProps) {
        return component;
      }

      instancesChanged = true;
      return { ...component, props: repairedProps };
    }) as typeof content;
  }) as Data;

  if (!normalized.changed && !instancesChanged) {
    return { data, changed: false };
  }

  return {
    data: {
      ...dataWithRepairedInstances,
      root: {
        ...dataWithRepairedInstances.root,
        props: {
          ...rootProps,
          _dynamicConfig: normalized.dynamicConfig,
        },
      },
    } as Data,
    changed: true,
  };
};
import { type Config, type Data, walkTree } from "@puckeditor/core";
