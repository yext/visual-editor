import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { useDocument } from "../../hooks/useDocument.tsx";
import { TranslatableRichText, TranslatableString } from "../../types/types.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import {
  backgroundColors,
  ThemeColor,
  ThemeOptions,
} from "../../utils/themeConfigOptions.ts";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { TranslatableRichTextField } from "../../editor/TranslatableRichTextField.tsx";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { Heading } from "../atoms/heading.tsx";
import { Body } from "../atoms/body.tsx";
import { Button } from "../atoms/button.tsx";

type FormField = {
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

export interface FormSectionProps {
  data: {
    heading: TranslatableString;
    description: TranslatableRichText;
    submitLabel: TranslatableString;
    formType: "HS_CONTACT" | "HS_EVENT";
    turnstileSiteKey: string;
    showPreferredContactMethod: boolean;
    defaultContactMethod: "PHONE" | "EMAIL";
    fields: FormField[];
  };
  styles: {
    backgroundColor?: ThemeColor;
    buttonVariant: "primary" | "secondary" | "link";
  };
  liveVisibility: boolean;
}

type Turnstile = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance: "interaction-only";
      execution: "execute";
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      "timeout-callback": () => void;
    }
  ) => string;
  execute: (container: HTMLElement) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const turnstileScriptPromises = new WeakMap<Document, Promise<Turnstile>>();

/** Load Turnstile once in the document that contains the form. */
function loadTurnstile(formDocument: Document): Promise<Turnstile> {
  const formWindow = formDocument.defaultView;
  if (!formWindow) {
    return Promise.reject(new Error("Form document has no window"));
  }
  if (formWindow.turnstile) {
    return Promise.resolve(formWindow.turnstile);
  }
  const pending = turnstileScriptPromises.get(formDocument);
  if (pending) {
    return pending;
  }
  const promise = new Promise<Turnstile>((resolve, reject) => {
    const script = formDocument.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        if (formWindow.turnstile) {
          resolve(formWindow.turnstile);
        } else {
          script.remove();
          reject(new Error("Turnstile did not initialize"));
        }
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => {
        script.remove();
        reject(new Error("Turnstile did not load"));
      },
      { once: true }
    );
    formDocument.head.appendChild(script);
  }).catch((error: unknown) => {
    turnstileScriptPromises.delete(formDocument);
    throw error;
  });
  turnstileScriptPromises.set(formDocument, promise);
  return promise;
}

const formSectionFields: YextFields<FormSectionProps> = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
      heading: {
        type: "translatableString",
        label: msg("form.heading", "Header"),
        showFieldSelector: false,
      },
      description: TranslatableRichTextField(
        msg("form.description", "Description")
      ),
      submitLabel: {
        type: "translatableString",
        label: msg("form.submitLabel", "Primary CTA Label"),
        showFieldSelector: false,
      },
      formType: {
        type: "radio",
        label: msg("form.formType", "Form Type"),
        options: [
          {
            label: msg("form.hearsayContact", "Hearsay Contact"),
            value: "HS_CONTACT",
          },
          {
            label: msg("form.hearsayEvent", "Hearsay Event"),
            value: "HS_EVENT",
          },
        ],
      },
      turnstileSiteKey: {
        type: "text",
        label: msg("form.turnstileSiteKey", "Turnstile Site Key"),
      },
      showPreferredContactMethod: {
        type: "radio",
        label: msg(
          "form.showPreferredContactMethod",
          "Show Preferred Contact Method"
        ),
        options: ThemeOptions.SHOW_HIDE,
      },
      defaultContactMethod: {
        type: "radio",
        label: msg("form.defaultContactMethod", "Default Contact Method"),
        options: [
          { label: msg("form.phone", "Phone"), value: "PHONE" },
          { label: msg("form.email", "Email"), value: "EMAIL" },
        ],
      },
      fields: {
        type: "array",
        label: msg("form.fields", "Form Fields"),
        defaultItemProps: { type: "text", label: "", key: "", required: false },
        getItemSummary: (field: FormField) =>
          field.label
            ? resolveComponentData(field.label, "en")
            : pt("form.field", "Field"),
        arrayFields: {
          type: {
            type: "select",
            label: msg("form.fieldType", "Field Type"),
            options: [
              {
                label: msg("form.preferredMethod", "Preferred Contact Method"),
                value: "preferredContactMethod",
              },
              {
                label: msg("form.firstName", "First Name"),
                value: "firstName",
              },
              { label: msg("form.lastName", "Last Name"), value: "lastName" },
              { label: msg("form.phone", "Phone"), value: "phone" },
              { label: msg("form.email", "Email"), value: "email" },
              { label: msg("form.message", "Message"), value: "message" },
              {
                label: msg("form.phoneOptIn", "Phone Opt-In"),
                value: "phoneOptIn",
              },
              { label: msg("form.customText", "Custom Text"), value: "text" },
              {
                label: msg("form.customDropdown", "Custom Dropdown"),
                value: "dropdown",
              },
              {
                label: msg("form.customCheckboxGroup", "Custom Checkbox Group"),
                value: "checkboxGroup",
              },
            ],
          },
          label: {
            type: "translatableString",
            label: msg("form.fieldLabel", "Label"),
            showFieldSelector: false,
          },
          key: {
            type: "text",
            label: msg("form.customFieldKey", "Custom Field Key"),
          },
          required: {
            type: "radio",
            label: msg("form.required", "Required"),
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
          options: {
            type: "array",
            label: msg("form.options", "Options"),
            defaultItemProps: { label: "", value: "" },
            getItemSummary: (option: {
              label: TranslatableString;
              value: string;
            }) =>
              option.label
                ? resolveComponentData(option.label, "en")
                : pt("form.option", "Option"),
            arrayFields: {
              label: {
                type: "translatableString",
                label: msg("form.optionLabel", "Option Label"),
                showFieldSelector: false,
              },
              value: {
                type: "text",
                label: msg("form.optionValue", "Option Value"),
              },
            },
          },
        },
      },
    },
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
      buttonVariant: {
        type: "radio",
        label: msg("form.buttonVariant", "Button Variant"),
        options: ThemeOptions.CTA_VARIANT,
      },
    },
  },
  liveVisibility: {
    type: "radio",
    label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
    options: [
      { label: msg("fields.options.show", "Show"), value: true },
      { label: msg("fields.options.hide", "Hide"), value: false },
    ],
  },
};

const inputClassName =
  "w-full rounded-button-borderRadius border border-current/30 bg-transparent px-3 py-3 font-body-fontFamily text-body-fontSize focus-visible:outline-2 focus-visible:outline-palette-primary";

/**
 * Show the configured fields, verify the visitor, and submit to the fixed form path.
 * 1. Check that the editor configuration can supply the required API fields.
 * 2. Execute Turnstile only after the visitor submits a valid form.
 * 3. Send the API body, then show the result without losing data on an error.
 */
const FormSectionComponent: PuckComponent<FormSectionProps> = ({
  data,
  styles,
  puck,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [contactMethod, setContactMethod] = React.useState(
    data.defaultContactMethod
  );
  const [status, setStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [turnstileReady, setTurnstileReady] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const turnstileContainerRef = React.useRef<HTMLDivElement>(null);
  const formId = React.useId();
  const widgetIdRef = React.useRef<string>();
  const tokenRequestRef = React.useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }>();

  const fields = data.fields ?? [];
  const configuredTypes = fields.map((field) => field.type);
  const customKeys = fields
    .filter((field) =>
      ["text", "dropdown", "checkboxGroup"].includes(field.type)
    )
    .map((field) => field.key?.trim() ?? "");
  const invalidConfiguration =
    !streamDocument.id ||
    !configuredTypes.includes("firstName") ||
    !configuredTypes.includes("lastName") ||
    (data.showPreferredContactMethod &&
      !configuredTypes.includes("preferredContactMethod")) ||
    !configuredTypes.includes(
      data.defaultContactMethod === "PHONE" ? "phone" : "email"
    ) ||
    (data.showPreferredContactMethod &&
      (!configuredTypes.includes("phone") ||
        !configuredTypes.includes("email"))) ||
    fields.some((field) =>
      field.type === "dropdown" || field.type === "checkboxGroup"
        ? !field.options?.length ||
          field.options.some((option) => !option.value.trim())
        : false
    ) ||
    // The honeypot is hidden below, so visible custom fields cannot use its key.
    customKeys.some((key) => !key || key.toLowerCase().includes("wingspan")) ||
    new Set(customKeys).size !== customKeys.length ||
    [
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

  React.useEffect(() => {
    setContactMethod(data.defaultContactMethod);
  }, [data.defaultContactMethod]);

  React.useEffect(() => {
    if (
      puck.isEditing ||
      invalidConfiguration ||
      !data.turnstileSiteKey ||
      !turnstileContainerRef.current
    ) {
      return;
    }
    let active = true;
    const formDocument = turnstileContainerRef.current.ownerDocument;
    loadTurnstile(formDocument)
      .then((turnstile) => {
        if (!active || !turnstileContainerRef.current) {
          return;
        }
        widgetIdRef.current = turnstile.render(turnstileContainerRef.current, {
          sitekey: data.turnstileSiteKey,
          appearance: "interaction-only",
          execution: "execute",
          callback: (token) => tokenRequestRef.current?.resolve(token),
          "error-callback": () =>
            tokenRequestRef.current?.reject(new Error("Turnstile failed")),
          "expired-callback": () =>
            tokenRequestRef.current?.reject(new Error("Turnstile expired")),
          "timeout-callback": () =>
            tokenRequestRef.current?.reject(new Error("Turnstile timed out")),
        });
        setTurnstileReady(true);
        setStatus("idle");
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Turnstile could not load or render", error);
          setStatus("error");
        }
      });
    return () => {
      active = false;
      tokenRequestRef.current?.reject(new Error("Form unmounted"));
      tokenRequestRef.current = undefined;
      if (widgetIdRef.current) {
        formDocument.defaultView?.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
      setTurnstileReady(false);
    };
  }, [data.turnstileSiteKey, invalidConfiguration, puck.isEditing]);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const turnstile =
      turnstileContainerRef.current?.ownerDocument.defaultView?.turnstile;
    if (
      puck.isEditing ||
      status === "pending" ||
      invalidConfiguration ||
      !turnstileReady ||
      !turnstile ||
      !widgetIdRef.current ||
      !turnstileContainerRef.current
    ) {
      return;
    }
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    const values = new FormData(form);
    const firstName = String(values.get("first_name") ?? "").trim();
    const lastName = String(values.get("last_name") ?? "").trim();
    const phone = String(values.get("phone") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    if (
      !firstName ||
      !lastName ||
      !(contactMethod === "PHONE" ? phone : email) ||
      fields.some(
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
      )
    ) {
      setStatus("error");
      return;
    }
    setStatus("pending");
    try {
      let timeoutId: ReturnType<typeof setTimeout>;
      const token = await new Promise<string>((resolve, reject) => {
        tokenRequestRef.current = { resolve, reject };
        timeoutId = setTimeout(
          () => reject(new Error("Turnstile timed out")),
          120_000
        );
        turnstile.execute(turnstileContainerRef.current!);
      }).finally(() => clearTimeout(timeoutId));
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
      const response = await fetch("/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: String(streamDocument.id),
          token,
          type: data.formType,
          data: {
            first_name: firstName,
            last_name: lastName,
            preferred_contact_method: contactMethod,
            ...(phone ? { phone } : {}),
            ...(email ? { email } : {}),
            ...(values.get("message")
              ? { message: String(values.get("message")).trim() }
              : {}),
            ...(configuredTypes.includes("phoneOptIn") &&
            contactMethod === "PHONE"
              ? { relate_opt_in: values.has("relate_opt_in") }
              : {}),
            custom_data: customData,
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Form submission failed");
      }
      formRef.current?.reset();
      setContactMethod(data.defaultContactMethod);
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      tokenRequestRef.current = undefined;
      if (widgetIdRef.current) {
        turnstile.reset(widgetIdRef.current);
      }
    }
  };

  const renderField = (field: FormField, index: number): React.ReactNode => {
    const label = resolveComponentData(field.label, locale, streamDocument);
    const required =
      field.type === "firstName" ||
      field.type === "lastName" ||
      (field.type === "phone" && contactMethod === "PHONE") ||
      (field.type === "email" && contactMethod === "EMAIL") ||
      Boolean(field.required);
    const name =
      {
        firstName: "first_name",
        lastName: "last_name",
        phone: "phone",
        email: "email",
        message: "message",
      }[
        field.type as "firstName" | "lastName" | "phone" | "email" | "message"
      ] ?? `custom_${index}`;
    const id = `${formId}-${index}`;

    if (field.type === "preferredContactMethod") {
      return data.showPreferredContactMethod ? (
        <fieldset key={index} className="col-span-full mb-2">
          <legend className="mb-4 font-body-fontFamily font-body-fontWeight text-palette-primary-dark">
            {label}
          </legend>
          <div className="flex flex-col gap-2">
            {(["PHONE", "EMAIL"] as const).map((method) => (
              <label
                key={method}
                className="flex items-center gap-3 font-body-fontFamily text-body-fontSize"
              >
                <input
                  type="radio"
                  name="preferred_contact_method"
                  value={method}
                  checked={contactMethod === method}
                  onChange={() => setContactMethod(method)}
                  className="accent-palette-primary"
                />
                {pt(
                  method === "PHONE" ? "form.phone" : "form.email",
                  method === "PHONE" ? "Phone" : "Email"
                )}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null;
    }
    if (field.type === "phoneOptIn") {
      return contactMethod === "PHONE" ? (
        <label
          key={index}
          className="col-span-full flex items-start gap-3 font-body-fontFamily text-body-sm-fontSize"
        >
          <input
            type="checkbox"
            name="relate_opt_in"
            required={field.required}
            className="mt-1 accent-palette-primary"
          />
          {label}
        </label>
      ) : null;
    }
    if (field.type === "checkboxGroup") {
      return (
        <fieldset key={index} className="col-span-full">
          <legend className="mb-2 font-body-fontFamily text-body-fontSize">
            {label}
            {required ? " *" : ""}
          </legend>
          <div className="flex flex-col gap-2">
            {field.options?.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="flex items-center gap-3 font-body-fontFamily text-body-fontSize"
              >
                <input
                  type="checkbox"
                  name={name}
                  value={option.value}
                  className="accent-palette-primary"
                />
                {resolveComponentData(option.label, locale, streamDocument)}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    return (
      <div
        key={index}
        className={
          field.type === "message" || field.type === "dropdown"
            ? "col-span-full"
            : "min-w-0"
        }
      >
        <label
          htmlFor={id}
          className="mb-2 block font-body-fontFamily text-body-sm-fontSize"
        >
          {label}
          {required ? " *" : ""}
        </label>
        {field.type === "message" ? (
          <textarea
            id={id}
            name={name}
            required={required}
            rows={7}
            className={inputClassName}
          />
        ) : field.type === "dropdown" ? (
          <select
            id={id}
            name={name}
            required={required}
            defaultValue=""
            className={inputClassName}
          >
            <option value="">
              {pt("form.selectOption", "Select an option")}
            </option>
            {field.options?.map((option, optionIndex) => (
              <option key={optionIndex} value={option.value}>
                {resolveComponentData(option.label, locale, streamDocument)}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            name={name}
            required={required}
            type={
              field.type === "email"
                ? "email"
                : field.type === "phone"
                  ? "tel"
                  : "text"
            }
            autoComplete={
              {
                firstName: "given-name",
                lastName: "family-name",
                phone: "tel",
                email: "email",
              }[field.type as "firstName" | "lastName" | "phone" | "email"]
            }
            className={inputClassName}
          />
        )}
      </div>
    );
  };

  const description = resolveComponentData(
    data.description,
    locale,
    streamDocument,
    { variant: "base" }
  );

  return (
    <PageSection background={styles.backgroundColor}>
      <div className="space-y-5">
        <Heading level={2}>
          {resolveComponentData(data.heading, locale, streamDocument)}
        </Heading>
        <div className="space-y-3">
          {typeof description === "string" ? (
            <Body className="whitespace-pre-line">{description}</Body>
          ) : (
            description
          )}
        </div>
        <form
          ref={formRef}
          onSubmit={submit}
          onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
            // Puck 0.22.2 misses text inputs inside the preview iframe.
            if (event.key === "Backspace" || event.key === "Delete") {
              event.stopPropagation();
            }
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map(renderField)}
          </div>
          <div className="sr-only" aria-hidden="true">
            <input
              name="yext_wingspan_url"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          {!puck.isEditing && <div ref={turnstileContainerRef} />}
          {(invalidConfiguration ||
            (!puck.isEditing && !data.turnstileSiteKey)) && (
            <Body role="alert">
              {pt(
                "form.configurationError",
                "This form is not ready. Check its fields and Turnstile site key."
              )}
            </Body>
          )}
          {status === "success" && (
            <Body role="status">
              {pt("form.success", "Your message was sent.")}
            </Body>
          )}
          {status === "error" && (
            <Body role="alert">
              {!turnstileReady
                ? pt(
                    "form.verificationError",
                    "Verification could not load. Reload the page and try again."
                  )
                : pt(
                    "form.error",
                    "Your message could not be sent. Try again."
                  )}
            </Body>
          )}
          <div className="flex justify-center">
            <Button
              type="submit"
              variant={styles.buttonVariant}
              disabled={
                !puck.isEditing &&
                (status === "pending" ||
                  invalidConfiguration ||
                  !data.turnstileSiteKey ||
                  !turnstileReady)
              }
            >
              {status === "pending"
                ? pt("form.sending", "Sending...")
                : resolveComponentData(
                    data.submitLabel,
                    locale,
                    streamDocument
                  )}
            </Button>
          </div>
        </form>
      </div>
    </PageSection>
  );
};

/** A contact or event form that sends visitor data to the site's Hearsay endpoint. */
export const FormSection: YextComponentConfig<FormSectionProps> = {
  label: msg("components.form", "Form Section"),
  fields: formSectionFields,
  defaultProps: {
    data: {
      heading: { defaultValue: "Contact us" },
      description: {
        defaultValue:
          "Please fill in all the mandatory fields.\n\nTo protect your privacy, we ask that you not send any confidential information through this contact form.",
      },
      submitLabel: { defaultValue: "Send Message" },
      formType: "HS_CONTACT",
      turnstileSiteKey: "",
      showPreferredContactMethod: true,
      defaultContactMethod: "PHONE",
      fields: [
        {
          type: "preferredContactMethod",
          label: { defaultValue: "Preferred Communication Method" },
        },
        { type: "firstName", label: { defaultValue: "First name" } },
        { type: "lastName", label: { defaultValue: "Last name" } },
        { type: "phone", label: { defaultValue: "Phone" } },
        { type: "email", label: { defaultValue: "Email" } },
        { type: "message", label: { defaultValue: "Message" } },
        {
          type: "phoneOptIn",
          label: { defaultValue: "I consent to receive text messages." },
        },
      ],
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      buttonVariant: "primary",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <FormSectionComponent {...props} />
    </VisibilityWrapper>
  ),
};
