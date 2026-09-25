import * as React from "react";
import { PuckComponent, setDeep } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { useDocument } from "../../hooks/useDocument.tsx";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { TranslatableRichText, TranslatableString } from "../../types/types.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import {
  backgroundColors,
  ThemeColor,
  ThemeOptions,
} from "../../utils/themeConfigOptions.ts";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { isFakeStarterLocalDev } from "../../utils/isFakeStarterLocalDev.ts";
import { EntityField } from "../../editor/EntityField.tsx";
import {
  toPuckFields,
  YextComponentConfig,
  YextFields,
} from "../../fields/fields.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import {
  getTextColorClass,
  getTextColorStyle,
  getThemeColorCssValue,
} from "../../utils/colors.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { Heading } from "../atoms/heading.tsx";
import { Body } from "../atoms/body.tsx";
import { Button } from "../atoms/button.tsx";
import {
  type FormField,
  hasInvalidConfiguration,
  prepareSubmissionData,
} from "./formSectionUtils.ts";

/** Saved Form settings for content, appearance, and live-page visibility. */
export interface FormSectionProps {
  /** Text, Form type, and fields that the editor can change. */
  data: {
    heading: YextEntityField<TranslatableString>;
    description: YextEntityField<TranslatableRichText>;
    phoneOptInText: YextEntityField<TranslatableRichText>;
    submitLabel: YextEntityField<TranslatableString>;
    formType: "HS_CONTACT" | "HS_EVENT";
    showPreferredContactMethod: boolean;
    defaultContactMethod: "PHONE" | "EMAIL";
    fields: FormField[];
  };
  /** Colors for the section and the contact method label. */
  styles: {
    backgroundColor?: ThemeColor;
    textColor?: ThemeColor;
    preferredContactMethodTextColor?: ThemeColor;
  };
  /** Button variant and optional site colors for the submit CTA. */
  ctaStyles: {
    buttonVariant: "primary" | "secondary" | "link";
    color?: ThemeColor;
    labelColor?: ThemeColor;
  };
  /** Hide the section on the live page when this is false. */
  liveVisibility: boolean;
}

/** Turnstile methods that this Form uses in its own document. */
type Turnstile = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance: "interaction-only";
      execution: "execute";
      callback: (token: string) => void;
      "error-callback": (errorCode: string) => void;
      "expired-callback": () => void;
      "timeout-callback": () => void;
    }
  ) => string;
  execute: (container: HTMLElement) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

/** Callbacks for the token request in the current submit attempt. */
type TokenRequest = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const turnstileScriptPromises = new WeakMap<Document, Promise<Turnstile>>();
const turnstileSiteKeyMarker = "<YEXT_TURNSTILE_SITE_KEY>";
const turnstileTestSiteKey = "1x00000000000000000000AA";
/** Keep the raw marker in page HTML so the server can replace it with a site key. */
const turnstileMarkup = `<div data-sitekey="${turnstileSiteKeyMarker}" data-execution="execute"></div>`;
/** These errors mean a new token request cannot fix the widget setup. */
const turnstileConfigurationErrors = new Set([
  "110100",
  "110110",
  "110200",
  "400020",
  "400070",
]);
const inputClassName =
  "w-full rounded-button-borderRadius border border-current/30 bg-transparent px-3 py-3 font-body-fontFamily text-body-fontSize placeholder:text-current/60 focus-visible:outline-2 focus-visible:outline-palette-primary";

/**
 * Load Turnstile in the document that contains the form, including a preview iframe.
 * Share a pending load. If it fails, remove it from the cache so a later mount can retry.
 * @param formDocument The document that will hold the Turnstile script.
 * @returns The Turnstile API for that document.
 */
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

/**
 * Render the widget in execute mode so it does not issue a token on page load.
 * Send widget results to the token request for the current submit attempt.
 * @returns The widget ID that Turnstile uses for reset and removal.
 */
function renderTurnstile(
  turnstile: Turnstile,
  container: HTMLElement,
  siteKey: string,
  tokenRequestRef: React.MutableRefObject<TokenRequest | undefined>,
  onVerificationError: (errorCode: string) => void
): string {
  return turnstile.render(container, {
    sitekey: siteKey,
    appearance: "interaction-only",
    execution: "execute",
    callback: (token) => tokenRequestRef.current?.resolve(token),
    "error-callback": (errorCode) => {
      onVerificationError(errorCode);
      tokenRequestRef.current?.reject(new Error("Turnstile failed"));
    },
    "expired-callback": () =>
      tokenRequestRef.current?.reject(new Error("Turnstile expired")),
    "timeout-callback": () =>
      tokenRequestRef.current?.reject(new Error("Turnstile timed out")),
  });
}

/**
 * Start verification when the visitor submits the Form.
 * Reject after two minutes if Turnstile does not return a token.
 * @returns A new token for this submit attempt.
 */
function requestTurnstileToken(
  turnstile: Turnstile,
  container: HTMLElement,
  tokenRequestRef: React.MutableRefObject<TokenRequest | undefined>
): Promise<string> {
  let timeoutId: ReturnType<typeof setTimeout>;
  return new Promise<string>((resolve, reject) => {
    tokenRequestRef.current = { resolve, reject };
    timeoutId = setTimeout(
      () => reject(new Error("Turnstile timed out")),
      120_000
    );
    turnstile.execute(container);
  }).finally(() => clearTimeout(timeoutId));
}

/** Render the contact method choices as one form field. */
const ContactMethodField = ({
  label,
  required,
  contactMethod,
  onContactMethodChange,
  textColor,
}: {
  label: React.ReactNode;
  required: boolean;
  contactMethod: FormSectionProps["data"]["defaultContactMethod"];
  onContactMethodChange: (method: "PHONE" | "EMAIL") => void;
  textColor?: ThemeColor;
}): React.ReactElement => (
  <fieldset className="col-span-full mb-2">
    <legend
      className={themeManagerCn(
        "mb-4 font-body-fontFamily font-body-fontWeight",
        getTextColorClass(textColor)
      )}
      style={getTextColorStyle(textColor)}
    >
      {label}
      {required ? " *" : ""}
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
            onChange={() => onContactMethodChange(method)}
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
);

/**
 * Render one text input, message box, or dropdown with its label.
 * Keep the label marker separate from the input's required rule. Show a red
 * border only after the visitor changes the input and leaves it empty.
 */
const FormInputField = ({
  field,
  label,
  required,
  showRequiredMarker,
  name,
  id,
  locale,
  streamDocument,
}: {
  field: FormField;
  label: string;
  required: boolean;
  showRequiredMarker: boolean;
  name: string;
  id: string;
  locale: string;
  streamDocument: StreamDocument;
}): React.ReactElement => {
  const editedRef = React.useRef(false);
  const [showMissingValue, setShowMissingValue] = React.useState(false);
  const inputClass = themeManagerCn(
    inputClassName,
    showMissingValue && "border-red-600 focus-visible:outline-red-600"
  );
  const onChange = (): void => {
    editedRef.current = true;
    setShowMissingValue(false);
  };
  const onBlur = (
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    if (editedRef.current) {
      setShowMissingValue(required && !event.currentTarget.value.trim());
    }
  };

  return (
    <div
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
        {showRequiredMarker ? " *" : ""}
      </label>
      {field.type === "message" ? (
        <textarea
          id={id}
          name={name}
          placeholder={label}
          required={required}
          aria-invalid={showMissingValue || undefined}
          onChange={onChange}
          onBlur={onBlur}
          rows={7}
          className={inputClass}
        />
      ) : field.type === "dropdown" ? (
        <select
          id={id}
          name={name}
          required={required}
          aria-invalid={showMissingValue || undefined}
          onChange={onChange}
          onBlur={onBlur}
          defaultValue=""
          className={inputClass}
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
          placeholder={label}
          required={required}
          aria-invalid={showMissingValue || undefined}
          onChange={onChange}
          onBlur={onBlur}
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
          className={inputClass}
        />
      )}
    </div>
  );
};

/**
 * Render fields in their saved order and apply the Form's required rules.
 * First and last name are always required. The selected phone or email input
 * is required and gets a marker, even when its editor toggle is off.
 */
const FormFields = ({
  fields,
  contactMethod,
  onContactMethodChange,
  showPreferredContactMethod,
  preferredContactMethodTextColor,
  phoneOptInText,
  locale,
  streamDocument,
}: {
  fields: FormField[];
  contactMethod: FormSectionProps["data"]["defaultContactMethod"];
  onContactMethodChange: (method: "PHONE" | "EMAIL") => void;
  showPreferredContactMethod: boolean;
  preferredContactMethodTextColor?: ThemeColor;
  phoneOptInText: YextEntityField<TranslatableRichText>;
  locale: string;
  streamDocument: StreamDocument;
}): React.ReactElement => {
  const formId = React.useId();
  const renderField = (field: FormField, index: number): React.ReactNode => {
    const label = resolveComponentData(field.label, locale, streamDocument);
    const contactMethodRequiresField =
      (field.type === "phone" && contactMethod === "PHONE") ||
      (field.type === "email" && contactMethod === "EMAIL");
    const required =
      field.type === "firstName" ||
      field.type === "lastName" ||
      contactMethodRequiresField ||
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
      return showPreferredContactMethod ? (
        <ContactMethodField
          key={index}
          label={label}
          required={Boolean(field.required)}
          contactMethod={contactMethod}
          onContactMethodChange={onContactMethodChange}
          textColor={preferredContactMethodTextColor}
        />
      ) : null;
    }
    if (field.type === "phoneOptIn") {
      return contactMethod === "PHONE" ? (
        <div key={index} className="col-span-full">
          <EntityField
            displayName={pt("form.phoneOptIn", "Phone Opt-In")}
            fieldId={phoneOptInText.field}
            constantValueEnabled={phoneOptInText.constantValueEnabled}
          >
            <label className="flex items-start gap-3 font-body-fontFamily text-body-sm-fontSize">
              <input
                type="checkbox"
                name="relate_opt_in"
                required={field.required}
                className="mt-1 accent-palette-primary"
              />
              <div>
                {resolveComponentData(phoneOptInText, locale, streamDocument, {
                  variant: "sm",
                })}
                {field.required ? " *" : ""}
              </div>
            </label>
          </EntityField>
        </div>
      ) : null;
    }
    if (field.type === "checkboxGroup") {
      return (
        <fieldset key={index} className="col-span-full">
          <legend className="mb-2 font-body-fontFamily text-body-fontSize">
            {label}
            {field.required ? " *" : ""}
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
      <FormInputField
        key={index}
        field={field}
        label={label}
        required={required}
        showRequiredMarker={
          Boolean(field.required) || contactMethodRequiresField
        }
        name={name}
        id={id}
        locale={locale}
        streamDocument={streamDocument}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map(renderField)}
    </div>
  );
};

/** Show setup, success, and request errors next to the form. */
const FormFeedback = ({
  showConfigurationError,
  status,
  turnstileReady,
  isPreviewSimulation,
}: {
  showConfigurationError: boolean;
  status: "idle" | "pending" | "success" | "error";
  turnstileReady: boolean;
  isPreviewSimulation: boolean;
}): React.ReactElement => (
  <>
    {showConfigurationError && (
      <Body role="alert">
        {pt(
          "form.configurationError",
          "This form is not ready. Check its fields."
        )}
      </Body>
    )}
    {status === "success" && (
      <Body role="status">
        {isPreviewSimulation
          ? pt("form.previewSuccess", "Preview only. No message was sent.")
          : pt("form.success", "Your message was sent.")}
      </Body>
    )}
    {status === "error" && (
      <Body role="alert">
        {!turnstileReady
          ? pt(
              "form.verificationError",
              "Verification could not load. Reload the page and try again."
            )
          : pt("form.error", "Your message could not be sent. Try again.")}
      </Body>
    )}
  </>
);

/**
 * Show the Form section and handle each submit attempt.
 * 1. Check the saved fields and load Turnstile for live and interactive views.
 * 2. Render the fields, selected contact method, and site colors.
 * 3. Check entered values and get a new Turnstile token on submit.
 * 4. POST on live pages and in the local fake starter. Simulate other previews.
 * 5. Clear values on success or keep them on failure, then show the result.
 */
const FormSectionComponent: PuckComponent<FormSectionProps> = ({
  data,
  styles,
  ctaStyles,
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
  const [verificationUnavailable, setVerificationUnavailable] =
    React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const turnstileContainerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string>();
  const tokenRequestRef = React.useRef<TokenRequest>();

  const fields = data.fields ?? [];
  const invalidConfiguration = hasInvalidConfiguration(data, streamDocument);
  const isEditorPreview = Boolean(puck.metadata?.formPreview);
  const isLocalFakeStarter =
    Boolean(puck.metadata?.formPreview?.localDev) ||
    (isFakeStarterLocalDev() &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname));

  React.useEffect(() => {
    setContactMethod(data.defaultContactMethod);
  }, [data.defaultContactMethod]);

  React.useEffect(() => {
    if (
      puck.isEditing ||
      verificationUnavailable ||
      invalidConfiguration ||
      !turnstileContainerRef.current
    ) {
      return;
    }
    let active = true;
    const formDocument = turnstileContainerRef.current.ownerDocument;
    const widgetContainer = turnstileContainerRef.current
      .firstElementChild as HTMLElement | null;
    if (!widgetContainer) {
      setVerificationUnavailable(true);
      return;
    }
    if (isEditorPreview || isLocalFakeStarter) {
      widgetContainer.dataset.sitekey = turnstileTestSiteKey;
    }
    const siteKey = widgetContainer.dataset.sitekey?.trim();
    if (!siteKey || siteKey === turnstileSiteKeyMarker) {
      setVerificationUnavailable(true);
      return;
    }
    loadTurnstile(formDocument)
      .then((turnstile) => {
        if (!active) {
          return;
        }
        setStatus("idle");
        widgetIdRef.current = renderTurnstile(
          turnstile,
          widgetContainer,
          siteKey,
          tokenRequestRef,
          (errorCode) => {
            if (turnstileConfigurationErrors.has(errorCode)) {
              setVerificationUnavailable(true);
            } else if (!tokenRequestRef.current) {
              setStatus("error");
            }
          }
        );
        if (!widgetIdRef.current) {
          throw new Error("Turnstile did not render");
        }
        setTurnstileReady(true);
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Turnstile could not load or render", error);
          setVerificationUnavailable(true);
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
  }, [
    invalidConfiguration,
    puck.isEditing,
    verificationUnavailable,
    isEditorPreview,
    isLocalFakeStarter,
  ]);

  /** Check the form, get a fresh token, and send or simulate one submission. */
  const submit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const turnstile =
      turnstileContainerRef.current?.ownerDocument.defaultView?.turnstile;
    const widgetContainer = turnstileContainerRef.current
      ?.firstElementChild as HTMLElement | null;
    if (
      puck.isEditing ||
      status === "pending" ||
      invalidConfiguration ||
      !turnstileReady ||
      !turnstile ||
      !widgetIdRef.current ||
      !widgetContainer
    ) {
      return;
    }
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    const submissionData = prepareSubmissionData(
      new FormData(form),
      fields,
      contactMethod
    );
    if (!submissionData) {
      setStatus("error");
      return;
    }
    setStatus("pending");
    try {
      const token = await requestTurnstileToken(
        turnstile,
        widgetContainer,
        tokenRequestRef
      );
      if (!isEditorPreview || isLocalFakeStarter) {
        const response = await fetch("/forms/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity_id: String(streamDocument.id),
            token,
            type: data.formType,
            data: submissionData,
          }),
        });
        if (!response.ok) {
          throw new Error("Form submission failed");
        }
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

  const description = resolveComponentData(
    data.description,
    locale,
    streamDocument,
    { variant: "base" }
  );
  const isSubmitDisabled =
    !puck.isEditing &&
    (status === "pending" || invalidConfiguration || !turnstileReady);

  if (verificationUnavailable) {
    return <></>;
  }

  return (
    <PageSection
      background={styles.backgroundColor}
      className={getTextColorClass(styles.textColor)}
      style={getTextColorStyle(styles.textColor)}
    >
      <div className="space-y-5">
        <EntityField
          displayName={pt("form.heading", "Header")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <Heading level={2}>
            {resolveComponentData(data.heading, locale, streamDocument)}
          </Heading>
        </EntityField>
        <EntityField
          displayName={pt("form.description", "Description")}
          fieldId={data.description.field}
          constantValueEnabled={data.description.constantValueEnabled}
        >
          <div className="space-y-3">
            {typeof description === "string" ? (
              <Body className="whitespace-pre-line">{description}</Body>
            ) : (
              description
            )}
          </div>
        </EntityField>
        <form
          ref={formRef}
          onSubmit={submit}
          onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
            // Puck 0.22.2 misses Backspace and Delete inputs inside the preview iframe.
            if (event.key === "Backspace" || event.key === "Delete") {
              event.stopPropagation();
            }
          }}
          className="space-y-6"
        >
          <FormFields
            fields={fields}
            contactMethod={contactMethod}
            onContactMethodChange={setContactMethod}
            showPreferredContactMethod={data.showPreferredContactMethod}
            preferredContactMethodTextColor={
              styles.preferredContactMethodTextColor
            }
            phoneOptInText={data.phoneOptInText}
            locale={locale}
            streamDocument={streamDocument}
          />
          <div className="sr-only" aria-hidden="true">
            <input
              name="yext_wingspan_url"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          {!puck.isEditing && (
            <div
              ref={turnstileContainerRef}
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: turnstileMarkup }}
            />
          )}
          <FormFeedback
            showConfigurationError={invalidConfiguration}
            status={status}
            turnstileReady={turnstileReady}
            isPreviewSimulation={isEditorPreview && !isLocalFakeStarter}
          />
          <div className="flex justify-center">
            <EntityField
              displayName={pt("form.ctaLabel", "CTA Label")}
              fieldId={data.submitLabel.field}
              constantValueEnabled={data.submitLabel.constantValueEnabled}
            >
              <Button
                type="submit"
                variant={ctaStyles.buttonVariant}
                disabled={isSubmitDisabled}
                style={{
                  backgroundColor:
                    ctaStyles.buttonVariant === "primary"
                      ? getThemeColorCssValue(ctaStyles.color?.selectedColor)
                      : undefined,
                  borderColor:
                    ctaStyles.buttonVariant !== "link"
                      ? getThemeColorCssValue(ctaStyles.color?.selectedColor)
                      : undefined,
                  color: getThemeColorCssValue(
                    ctaStyles.labelColor?.selectedColor ??
                      (ctaStyles.buttonVariant === "primary"
                        ? ctaStyles.color?.contrastingColor
                        : ctaStyles.color?.selectedColor)
                  ),
                }}
              >
                {status === "pending"
                  ? pt("form.sending", "Sending...")
                  : resolveComponentData(
                      data.submitLabel,
                      locale,
                      streamDocument
                    )}
              </Button>
            </EntityField>
          </div>
          <p className="font-body-fontFamily text-body-sm-fontSize">
            * {pt("form.required", "Required")}
          </p>
        </form>
      </div>
    </PageSection>
  );
};

/** Keep the editor groups in sidebar order, with CTA styles after Form Fields. */
const formSectionFields: YextFields<FormSectionProps> = {
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
      textColor: {
        type: "basicSelector",
        label: msg("fields.textColor", "Text Color"),
        options: "SITE_COLOR",
      },
      preferredContactMethodTextColor: {
        type: "basicSelector",
        label: msg(
          "form.preferredContactMethodTextColor",
          "Preferred Contact Method Text Color"
        ),
        options: "SITE_COLOR",
      },
    },
  },
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
      heading: {
        type: "entityField",
        label: msg("form.heading", "Header"),
        filter: { types: ["type.string"] },
      },
      description: {
        type: "entityField",
        label: msg("form.description", "Description"),
        filter: { types: ["type.string", "type.rich_text_v2"] },
      },
      phoneOptInText: {
        type: "entityField",
        label: msg("form.phoneOptIn", "Phone Opt-In"),
        filter: { types: ["type.string", "type.rich_text_v2"] },
      },
      submitLabel: {
        type: "entityField",
        label: msg("form.ctaLabel", "CTA Label"),
        filter: { types: ["type.string"] },
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
  ctaStyles: {
    type: "object",
    label: msg("form.ctaStyles", "CTA Styles"),
    objectFields: {
      buttonVariant: {
        type: "radio",
        label: msg("form.buttonVariant", "Button Variant"),
        options: ThemeOptions.CTA_VARIANT,
      },
      color: {
        type: "basicSelector",
        label: msg("form.ctaColor", "CTA Color"),
        options: "SITE_COLOR",
      },
      labelColor: {
        type: "basicSelector",
        label: msg("form.ctaLabelColor", "CTA Label Color"),
        options: "SITE_COLOR",
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

/** Configure the Form editor fields, defaults, and live section. */
export const FormSection: YextComponentConfig<FormSectionProps> = {
  label: msg("components.form", "Form Section"),
  fields: formSectionFields,
  // Puck uses one array field map for all rows, so this hides Options only
  // when no row needs it.
  resolveFields: (data) =>
    setDeep(
      toPuckFields(formSectionFields),
      "data.objectFields.fields.arrayFields.options.visible",
      data.props.data.fields?.some(
        (field) => field.type === "dropdown" || field.type === "checkboxGroup"
      ) ?? false
    ),
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: { defaultValue: "Contact us" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue:
            "Please fill in all the mandatory fields.\n\nTo protect your privacy, we ask that you not send any confidential information through this contact form.",
        },
        constantValueEnabled: true,
      },
      phoneOptInText: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF("I consent to receive text messages."),
        },
        constantValueEnabled: true,
      },
      submitLabel: {
        field: "",
        constantValue: { defaultValue: "Send Message" },
        constantValueEnabled: true,
      },
      formType: "HS_CONTACT",
      showPreferredContactMethod: true,
      defaultContactMethod: "PHONE",
      fields: [
        {
          type: "preferredContactMethod",
          label: { defaultValue: "Preferred Communication Method" },
          required: true,
        },
        {
          type: "firstName",
          label: { defaultValue: "First name" },
          required: true,
        },
        {
          type: "lastName",
          label: { defaultValue: "Last name" },
          required: true,
        },
        { type: "phone", label: { defaultValue: "Phone" }, required: false },
        { type: "email", label: { defaultValue: "Email" }, required: false },
        {
          type: "message",
          label: { defaultValue: "Message" },
          required: false,
        },
        {
          type: "phoneOptIn",
          label: { defaultValue: "I consent to receive text messages." },
          required: false,
        },
      ],
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      preferredContactMethodTextColor: undefined,
    },
    ctaStyles: {
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
