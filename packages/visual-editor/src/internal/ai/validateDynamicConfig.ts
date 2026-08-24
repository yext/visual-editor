const allowedFieldTypes = new Set([
  "testEntityField",
  "testRichText",
  "testImage",
  "testCTA",
]);

type DynamicComponent = {
  label?: unknown;
  html?: unknown;
  styles?: unknown;
  streaming?: unknown;
  fields?: unknown;
  defaultProps?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isBalancedSingleRoot = (html: string): boolean => {
  const tags = html.match(/<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>/g) ?? [];
  const voidTags = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
  ]);
  const stack: string[] = [];

  for (const tag of tags) {
    if (tag.startsWith("<!--")) {
      continue;
    }

    const match = /^<\/?\s*([A-Za-z][\w-]*)/.exec(tag);
    if (!match) {
      return false;
    }

    const tagName = match[1].toLowerCase();
    if (tag.startsWith("</")) {
      if (stack.pop() !== tagName) {
        return false;
      }
      continue;
    }

    if (!tag.endsWith("/>") && !voidTags.has(tagName)) {
      stack.push(tagName);
    }
  }

  return stack.length === 0 && tags.length > 0;
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

/**
 * Validates the persisted design-mode contract before a registration is made
 * available to Puck. Dynamic components derive fields from annotations, while
 * Yext transforms require matching field definitions and authored values.
 */
export const validateDynamicComponent = (
  componentName: string,
  component: unknown
): string[] => {
  if (!isRecord(component)) {
    return [`${componentName} must be an object.`];
  }

  const registration = component as DynamicComponent;
  const errors: string[] = [];
  if (typeof registration.label !== "string" || !registration.label.trim()) {
    errors.push(`${componentName} must have a non-empty label.`);
  }
  if (typeof registration.html !== "string" || !registration.html.trim()) {
    errors.push(`${componentName} must have HTML.`);
  } else if (!isBalancedSingleRoot(registration.html)) {
    errors.push(`${componentName} HTML must have one balanced root element.`);
  }
  if (typeof registration.styles !== "string") {
    errors.push(`${componentName} must have a styles string.`);
  }
  if (registration.streaming === true) {
    errors.push(`${componentName} must not be registered while streaming.`);
  }
  if (!isRecord(registration.fields)) {
    errors.push(`${componentName} must define fields.`);
  }
  if (!isRecord(registration.defaultProps)) {
    errors.push(`${componentName} must define defaultProps.`);
  }

  if (typeof registration.html !== "string") {
    return errors;
  }

  if (/data-puck-slot\s*=/.test(registration.html)) {
    errors.push(`${componentName} must not use slots.`);
  }

  const annotationTypes = new Map<string, string>();
  const annotationPattern =
    /data-puck-field-([A-Za-z][\w-]*)\s*=\s*(['"])([\s\S]*?)\2/g;
  for (const match of registration.html.matchAll(annotationPattern)) {
    const [, fieldName, , rawShape] = match;
    if (annotationTypes.has(fieldName)) {
      errors.push(`${componentName} defines ${fieldName} more than once.`);
      continue;
    }
    try {
      const shape = JSON.parse(rawShape);
      if (
        !isRecord(shape) ||
        Object.keys(shape).length !== 1 ||
        typeof shape.type !== "string" ||
        !allowedFieldTypes.has(shape.type)
      ) {
        errors.push(
          `${componentName} ${fieldName} must use exactly one supported test field type.`
        );
      } else {
        annotationTypes.set(fieldName, shape.type);
      }
    } catch {
      errors.push(`${componentName} ${fieldName} has invalid field JSON.`);
    }
  }

  const annotationCount = (registration.html.match(/data-puck-field-/g) ?? [])
    .length;
  if (annotationCount !== annotationTypes.size) {
    errors.push(`${componentName} has an invalid field annotation.`);
  }

  if (isRecord(registration.fields) && isRecord(registration.defaultProps)) {
    for (const [fieldName, annotationType] of annotationTypes) {
      const field = registration.fields[fieldName];
      if (!isRecord(field) || typeof field.type !== "string") {
        errors.push(
          `${componentName} is missing a field definition for ${fieldName}.`
        );
      } else if (!allowedFieldTypes.has(field.type)) {
        errors.push(
          `${componentName} ${fieldName} has an unsupported field type.`
        );
      } else if (field.type !== annotationType) {
        errors.push(
          `${componentName} ${fieldName} does not match its HTML field type.`
        );
      }
      const defaultProps = registration.defaultProps[fieldName];
      if (!isRecord(defaultProps)) {
        errors.push(
          `${componentName} is missing defaultProps for ${fieldName}.`
        );
      } else if (!hasMeaningfulDefault(defaultProps, annotationType)) {
        errors.push(
          `${componentName} ${fieldName} must have a non-empty default value.`
        );
      }
    }

    for (const fieldName of Object.keys(registration.fields)) {
      if (!annotationTypes.has(fieldName)) {
        errors.push(
          `${componentName} has an unannotated field definition for ${fieldName}.`
        );
      }
    }
    for (const fieldName of Object.keys(registration.defaultProps)) {
      if (!annotationTypes.has(fieldName)) {
        errors.push(
          `${componentName} has unannotated defaultProps for ${fieldName}.`
        );
      }
    }
  }

  return errors;
};

export const validateDynamicConfig = (dynamicConfig: unknown): string[] => {
  if (!isRecord(dynamicConfig) || !isRecord(dynamicConfig.components)) {
    return ["Dynamic config must contain a components object."];
  }

  return Object.entries(dynamicConfig.components).flatMap(
    ([componentName, component]) =>
      validateDynamicComponent(componentName, component)
  );
};
