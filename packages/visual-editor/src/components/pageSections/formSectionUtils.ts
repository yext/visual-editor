import { type TranslatableString } from "../../types/types.ts";
import { type StreamDocument } from "../../utils/types/StreamDocument.ts";

export type FormField = {
  type:
    | "preferredContactMethod"
    | "firstName"
    | "lastName"
    | "phone"
    | "email"
    | "message"
    | "phoneOptIn"
    | "text"
    | "dropdown"
    | "checkboxGroup";
  label: TranslatableString;
  key?: string;
  required?: boolean;
  options?: { label: TranslatableString; value: string }[];
};

/** Check that the editor setup can supply every field required by the API. */
export function hasInvalidConfiguration(
  data: {
    fields: FormField[];
    showPreferredContactMethod: boolean;
    defaultContactMethod: "PHONE" | "EMAIL";
  },
  streamDocument: StreamDocument
): boolean {
  const fields = data.fields ?? [];
  const configuredTypes = fields.map((field) => field.type);
  const missingRequiredFields =
    !configuredTypes.includes("firstName") ||
    !configuredTypes.includes("lastName");
  const missingContactFields =
    (data.showPreferredContactMethod &&
      !configuredTypes.includes("preferredContactMethod")) ||
    !configuredTypes.includes(
      data.defaultContactMethod === "PHONE" ? "phone" : "email"
    ) ||
    (data.showPreferredContactMethod &&
      (!configuredTypes.includes("phone") ||
        !configuredTypes.includes("email")));
  const invalidOptions = fields.some((field) =>
    field.type === "dropdown" || field.type === "checkboxGroup"
      ? !field.options?.length ||
        field.options.some((option) => !option.value.trim())
      : false
  );
  const customKeys = fields
    .filter((field) =>
      ["text", "dropdown", "checkboxGroup"].includes(field.type)
    )
    .map((field) => field.key?.trim() ?? "");
  // The honeypot is hidden in the form, so visible fields cannot use its key.
  const invalidCustomKeys =
    customKeys.some((key) => !key || key.toLowerCase().includes("wingspan")) ||
    new Set(customKeys).size !== customKeys.length;
  const duplicateStandardFields = [
    "firstName",
    "lastName",
    "preferredContactMethod",
    "phone",
    "email",
    "message",
    "phoneOptIn",
  ].some(
    (type) =>
      configuredTypes.filter((configuredType) => configuredType === type)
        .length > 1
  );

  return (
    !streamDocument.id ||
    missingRequiredFields ||
    missingContactFields ||
    invalidOptions ||
    invalidCustomKeys ||
    duplicateStandardFields
  );
}

/**
 * Check entered values and build the API data object.
 * 1. Check required standard and custom values.
 * 2. Add custom values and phone consent.
 * 3. Return the API data, or null when a required value is missing.
 */
export function prepareSubmissionData(
  values: FormData,
  fields: FormField[],
  contactMethod: "PHONE" | "EMAIL"
): {
  first_name: string;
  last_name: string;
  preferred_contact_method: "PHONE" | "EMAIL";
  phone?: string;
  email?: string;
  message?: string;
  relate_opt_in?: boolean;
  custom_data: Record<string, string | string[]>;
} | null {
  const firstName = String(values.get("first_name") ?? "").trim();
  const lastName = String(values.get("last_name") ?? "").trim();
  const phone = String(values.get("phone") ?? "").trim();
  const email = String(values.get("email") ?? "").trim();
  const missingRequiredValue = fields.some(
    (field, index) =>
      field.required &&
      (field.type === "checkboxGroup"
        ? !values.getAll(`custom_${index}`).length
        : ["text", "message", "phone", "email"].includes(field.type) &&
          !String(
            values.get(
              field.type === "text" ? `custom_${index}` : field.type
            ) ?? ""
          ).trim())
  );

  if (
    !firstName ||
    !lastName ||
    !(contactMethod === "PHONE" ? phone : email) ||
    missingRequiredValue
  ) {
    return null;
  }

  const customData: Record<string, string | string[]> = {
    yext_wingspan_url: String(values.get("yext_wingspan_url") ?? ""),
  };
  fields.forEach((field, index) => {
    if (
      !["text", "dropdown", "checkboxGroup"].includes(field.type) ||
      !field.key
    ) {
      return;
    }
    const name = `custom_${index}`;
    const value =
      field.type === "checkboxGroup"
        ? values.getAll(name).map(String)
        : String(values.get(name) ?? "").trim();
    if (Array.isArray(value) ? value.length : value) {
      customData[field.key.trim()] = value;
    }
  });

  return {
    first_name: firstName,
    last_name: lastName,
    preferred_contact_method: contactMethod,
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
    ...(values.get("message")
      ? { message: String(values.get("message")).trim() }
      : {}),
    ...(fields.some((field) => field.type === "phoneOptIn") &&
    contactMethod === "PHONE"
      ? { relate_opt_in: values.has("relate_opt_in") }
      : {}),
    custom_data: customData,
  };
}
