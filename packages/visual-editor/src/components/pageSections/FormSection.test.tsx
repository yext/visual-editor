import * as React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  type RenderResult,
} from "@testing-library/react";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { FormSection, FormSectionProps } from "./FormSection.tsx";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";
import { type StreamDocument } from "../../utils/types/StreamDocument.ts";

const renderForm = (
  props: FormSectionProps,
  isEditing = false,
  container?: HTMLElement,
  streamDocument: StreamDocument = { id: "location-1", locale: "en" },
  siteKey = "test-site-key",
  formPreview?: { localDev: boolean }
): RenderResult => {
  const form = (
    <VisualEditorProvider templateProps={{ document: streamDocument }}>
      {FormSection.render?.({
        ...props,
        id: "FormSection-test",
        puck: {
          isEditing,
          metadata: { formPreview },
          renderDropZone: (): null => null,
          dragRef: null,
        },
      } as Parameters<NonNullable<typeof FormSection.render>>[0])}
    </VisualEditorProvider>
  );
  if (isEditing || formPreview) {
    return render(form, { container });
  }
  const renderContainer =
    container ?? document.body.appendChild(document.createElement("div"));
  renderContainer.innerHTML = renderToString(form).replaceAll(
    "<YEXT_TURNSTILE_SITE_KEY>",
    siteKey
  );
  return render(form, { container: renderContainer, hydrate: true });
};

const getProps = (): FormSectionProps =>
  structuredClone(FormSection.defaultProps as FormSectionProps);

describe("FormSection", () => {
  let turnstileOptions: {
    sitekey: string;
    appearance: string;
    execution: string;
    callback: (token: string) => void;
    "error-callback": (errorCode: string) => void;
    "timeout-callback": () => void;
  };
  let tokenNumber: number;
  const execute = vi.fn();
  const reset = vi.fn();
  const remove = vi.fn();

  beforeEach(() => {
    tokenNumber = 0;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    window.turnstile = {
      render: vi.fn((_container, options) => {
        turnstileOptions = options;
        return "widget-1";
      }),
      execute: execute.mockImplementation(() =>
        turnstileOptions.callback(`test-token-${++tokenNumber}`)
      ),
      reset,
      remove,
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.turnstile;
    vi.clearAllMocks();
  });

  it("sends a contact form with API field names and custom data", async () => {
    const props = getProps();
    props.data.fields.push({
      type: "checkboxGroup",
      label: "Reasons",
      key: "reason",
      required: true,
      options: [
        { label: "Buying a home", value: "home" },
        { label: "Building savings", value: "savings" },
      ],
    });
    renderForm(props);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );

    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.click(
      screen.getByLabelText("I consent to receive text messages.")
    );
    fireEvent.click(screen.getByLabelText("Buying a home"));
    fireEvent.click(screen.getByLabelText("Building savings"));
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        "Your message was sent."
      )
    );
    expect(fetch).toHaveBeenCalledWith("/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity_id: "location-1",
        token: "test-token-1",
        type: "HS_CONTACT",
        data: {
          first_name: "Ada",
          last_name: "Lovelace",
          preferred_contact_method: "PHONE",
          phone: "5555555555",
          relate_opt_in: true,
          custom_data: {
            yext_wingspan_url: "",
            reason: ["home", "savings"],
          },
        },
      }),
    });
    expect(reset).toHaveBeenCalledWith("widget-1");
    expect(
      (screen.getByLabelText(/First name/) as HTMLInputElement).value
    ).toBe("");
  });

  it("sends an event form with email when the method selector is hidden", async () => {
    const props = getProps();
    props.data.formType = "HS_EVENT";
    props.data.showPreferredContactMethod = false;
    props.data.defaultContactMethod = "EMAIL";
    props.data.fields.push({
      type: "dropdown",
      label: "Preferred time",
      key: "preferred_time",
      options: [{ label: "Morning", value: "morning" }],
    });
    renderForm(props);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );

    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Preferred time"), {
      target: { value: "morning" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.type).toBe("HS_EVENT");
    expect(body.data).toEqual({
      first_name: "Ada",
      last_name: "Lovelace",
      preferred_contact_method: "EMAIL",
      email: "ada@example.com",
      custom_data: {
        yext_wingspan_url: "",
        preferred_time: "morning",
      },
    });
    expect(
      screen.queryByLabelText("I consent to receive text messages.")
    ).toBeNull();
  });

  it("blocks submission when a required contact field is missing", async () => {
    const props = getProps();
    renderForm(props);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(fetch).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it("rejects a visible honeypot custom key", () => {
    const props = getProps();
    props.data.fields.push({
      type: "text",
      label: "Website",
      key: "yext_wingspan_url",
    });
    renderForm(props);
    expect(screen.getByRole("alert").textContent).toContain(
      "This form is not ready"
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Send Message",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(window.turnstile?.render).not.toHaveBeenCalled();
  });

  it("keeps values after a failed request and gets a new token for retry", async () => {
    const props = getProps();
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);
    renderForm(props);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );

    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "could not be sent"
      )
    );
    expect(
      (screen.getByLabelText(/First name/) as HTMLInputElement).value
    ).toBe("Ada");

    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        "Your message was sent."
      )
    );
    expect(
      JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string).token
    ).toBe("test-token-1");
    expect(
      JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string).token
    ).toBe("test-token-2");
    expect(reset).toHaveBeenCalledTimes(2);
  });

  it("keeps the editor preview inert without a Turnstile key", () => {
    renderForm(getProps(), true);
    expect(screen.getByRole("heading", { name: "Contact us" })).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(window.turnstile?.render).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks a setup without an email field when both methods are offered", () => {
    const props = getProps();
    props.data.fields = props.data.fields.filter(
      (field) => field.type !== "email"
    );
    renderForm(props);
    expect(screen.getByRole("alert").textContent).toContain(
      "This form is not ready"
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Send Message",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(window.turnstile?.render).not.toHaveBeenCalled();
  });

  it("when the preview uses an iframe, then Turnstile loads there", async () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    const formDocument = frame.contentDocument!;
    const container = formDocument.createElement("div");
    formDocument.body.appendChild(container);
    const props = getProps();
    const { getByRole, getByLabelText, getByPlaceholderText, unmount } =
      renderForm(props, false, container);
    const script = formDocument.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]'
    );
    expect(script).not.toBeNull();
    expect(window.turnstile?.render).not.toHaveBeenCalled();

    let onToken: (token: string) => void = () => {};
    const frameTurnstile: NonNullable<Window["turnstile"]> = {
      render: vi.fn((_container, options) => {
        onToken = options.callback;
        return "frame-widget";
      }),
      execute: vi.fn(() => onToken("iframe-token")),
      reset: vi.fn(),
      remove: vi.fn(),
    };
    formDocument.defaultView!.turnstile = frameTurnstile;
    script!.dispatchEvent(new Event("load"));
    await waitFor(() =>
      expect(
        (getByRole("button", { name: "Send Message" }) as HTMLButtonElement)
          .disabled
      ).toBe(false)
    );
    expect(frameTurnstile.render).toHaveBeenCalled();
    fireEvent.change(getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.click(getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(frameTurnstile.execute).toHaveBeenCalled();
    expect(
      JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string).token
    ).toBe("iframe-token");
    expect(frameTurnstile.reset).toHaveBeenCalledWith("frame-widget");
    unmount();
    expect(frameTurnstile.remove).toHaveBeenCalledWith("frame-widget");
    frame.remove();
  });

  it("when Turnstile cannot load, then the live form is hidden", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    delete window.turnstile;
    const props = getProps();
    renderForm(props);
    document
      .querySelector<HTMLScriptElement>(
        'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]'
      )!
      .dispatchEvent(new Event("error"));
    await waitFor(() => expect(screen.queryByRole("heading")).toBeNull());
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: "Send Message" })).toBeNull();
    expect(logError).toHaveBeenCalled();
    logError.mockRestore();
  });

  it("keeps Backspace and Delete in form text fields from reaching Puck", async () => {
    const props = getProps();
    renderForm(props);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );
    const onKeyDown = vi.fn();
    document.addEventListener("keydown", onKeyDown);

    for (const target of [
      screen.getByLabelText(/First name/),
      screen.getByLabelText("Message"),
    ]) {
      for (const key of ["Backspace", "Delete"]) {
        const event = new KeyboardEvent("keydown", {
          key,
          code: key,
          bubbles: true,
          cancelable: true,
        });
        target.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
      }
    }
    expect(onKeyDown).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByLabelText(/First name/), {
      key: "a",
      code: "KeyA",
    });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    document.removeEventListener("keydown", onKeyDown);
  });

  it("when Turnstile does not return a token, then the form exits pending state", async () => {
    const props = getProps();
    execute.mockImplementation(() => {});
    renderForm(props);
    const button = screen.getByRole("button", {
      name: "Send Message",
    }) as HTMLButtonElement;
    await waitFor(() => expect(button.disabled).toBe(false));

    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.click(button);
    turnstileOptions["timeout-callback"]();
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "could not be sent"
      )
    );
    expect(button.disabled).toBe(false);
    expect(reset).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    try {
      fireEvent.click(button);
      expect(button.disabled).toBe(true);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(120_000);
      });
      expect(screen.getByRole("alert").textContent).toContain(
        "could not be sent"
      );
      expect(button.disabled).toBe(false);
      expect(reset).toHaveBeenCalledTimes(2);
      expect(fetch).not.toHaveBeenCalled();
      expect(
        (screen.getByLabelText(/First name/) as HTMLInputElement).value
      ).toBe("Ada");
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    { type: "text" as const, label: "Goals", fieldLabel: "Goals *" },
    { type: "message" as const, label: "Message", fieldLabel: "Message *" },
  ])(
    "when required $type contains only spaces, then submission stops",
    async ({ type, label, fieldLabel }) => {
      const props = getProps();
      if (type === "text") {
        props.data.fields.push({
          type,
          label,
          key: "goals",
          required: true,
        });
      } else {
        props.data.fields.find((field) => field.type === "message")!.required =
          true;
      }
      renderForm(props);
      const button = screen.getByRole("button", { name: "Send Message" });
      await waitFor(() =>
        expect((button as HTMLButtonElement).disabled).toBe(false)
      );

      fireEvent.change(screen.getByLabelText(/First name/), {
        target: { value: "Ada" },
      });
      fireEvent.change(screen.getByLabelText(/Last name/), {
        target: { value: "Lovelace" },
      });
      fireEvent.change(screen.getByPlaceholderText("Phone"), {
        target: { value: "5555555555" },
      });
      fireEvent.change(screen.getByLabelText(fieldLabel), {
        target: { value: "   " },
      });
      fireEvent.click(button);

      expect(execute).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    }
  );

  it("sends the hidden honeypot value in custom data", async () => {
    const props = getProps();
    const { container } = renderForm(props);
    const button = screen.getByRole("button", { name: "Send Message" });
    await waitFor(() =>
      expect((button as HTMLButtonElement).disabled).toBe(false)
    );

    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.change(
      container.querySelector<HTMLInputElement>(
        'input[name="yext_wingspan_url"]'
      )!,
      { target: { value: "https://spam.example" } }
    );
    fireEvent.click(button);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(
      JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string).data
        .custom_data.yext_wingspan_url
    ).toBe("https://spam.example");
  });

  it("uses the theme page section width", () => {
    const { container } = renderForm(getProps(), true);

    expect(container.querySelector("section")?.className).toContain(
      "max-w-pageSection-contentWidth"
    );
    expect(container.querySelector(".max-w-xl")).toBeNull();
  });

  it("when the contact method changes, then field order and required inputs stay correct", () => {
    const props = getProps();
    props.data.fields.reverse();
    const { container } = renderForm(props, true);
    const fieldGrid = container.querySelector("form .grid")!;
    const fieldNames = Array.from(
      fieldGrid.querySelectorAll("input, textarea, select"),
      (field) => field.getAttribute("name")
    );

    expect(fieldNames).toEqual([
      "relate_opt_in",
      "message",
      "email",
      "phone",
      "last_name",
      "first_name",
      "preferred_contact_method",
      "preferred_contact_method",
    ]);
    const firstName = fieldGrid.querySelector<HTMLInputElement>(
      'input[name="first_name"]'
    )!;
    const lastName = fieldGrid.querySelector<HTMLInputElement>(
      'input[name="last_name"]'
    )!;
    const phone = fieldGrid.querySelector<HTMLInputElement>(
      'input[name="phone"]'
    )!;
    const email = fieldGrid.querySelector<HTMLInputElement>(
      'input[name="email"]'
    )!;
    expect(firstName.required).toBe(true);
    expect(lastName.required).toBe(true);
    expect(phone.required).toBe(true);
    expect(email.required).toBe(false);

    fireEvent.click(screen.getByRole("radio", { name: "Email" }));

    expect(phone.required).toBe(false);
    expect(email.required).toBe(true);
    expect(
      screen.queryByLabelText("I consent to receive text messages.")
    ).toBeNull();
  });

  it("when the site key marker is not replaced, then the live form is hidden", async () => {
    const { container } = renderForm(
      getProps(),
      false,
      undefined,
      undefined,
      "<YEXT_TURNSTILE_SITE_KEY>"
    );

    await waitFor(() => expect(container.querySelector("section")).toBeNull());
    expect(screen.queryByRole("heading", { name: "Contact us" })).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(window.turnstile?.render).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("when Turnstile rejects the site key, then the live form is hidden", async () => {
    const props = getProps();
    renderForm(props, false, undefined, undefined, "invalid-site-key");
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());

    act(() => turnstileOptions["error-callback"]("110100"));

    expect(screen.queryByRole("heading", { name: "Contact us" })).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(remove).toHaveBeenCalledWith("widget-1");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("when Turnstile has a retryable error, then the form shows an inline error", async () => {
    const props = getProps();
    execute.mockImplementation(() =>
      turnstileOptions["error-callback"]("200500")
    );
    renderForm(props);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );
    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Your message could not be sent"
      )
    );
    expect(
      (screen.getByLabelText(/First name/) as HTMLInputElement).value
    ).toBe("Ada");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("when a Form section is new, then each field has a required setting", () => {
    expect(
      getProps().data.fields.map((field) => [field.type, field.required])
    ).toEqual([
      ["preferredContactMethod", true],
      ["firstName", true],
      ["lastName", true],
      ["phone", false],
      ["email", false],
      ["message", false],
      ["phoneOptIn", false],
    ]);
  });

  it.each([
    ["no choice fields", undefined, false],
    ["a dropdown field", "dropdown", true],
    ["a checkbox group field", "checkboxGroup", true],
  ] as const)(
    "when the form has %s, then options follow the visibility rule",
    async (_caseName, choiceType, visible) => {
      const props = getProps();
      if (choiceType) {
        props.data.fields.push({
          type: choiceType,
          label: "Choice",
          key: "choice",
          required: false,
          options: [{ label: "One", value: "one" }],
        });
      }

      const fields = await FormSection.resolveFields?.(
        { props } as Parameters<
          NonNullable<typeof FormSection.resolveFields>
        >[0],
        {} as Parameters<NonNullable<typeof FormSection.resolveFields>>[1]
      );

      expect(fields).toMatchObject({
        data: {
          objectFields: {
            fields: { arrayFields: { options: { visible } } },
          },
        },
      });
    }
  );

  it("when the background is dark, then the contact method label uses the section text color", () => {
    const props = getProps();
    props.styles.backgroundColor = backgroundColors.background6.value;
    const { container } = renderForm(props, true);
    const legend = screen.getByText(/Preferred Communication Method/);

    expect(
      container.querySelector("section")?.parentElement?.className
    ).toContain("text-white");
    expect(legend.className).not.toContain("text-palette-primary-dark");
    expect(legend.getAttribute("style")).toBeNull();
  });

  it("when a contact method text color is set, then only its label uses that color", () => {
    const props = getProps();
    props.styles.preferredContactMethodTextColor = {
      selectedColor: "palette-primary",
      contrastingColor: "palette-primary-contrast",
    };
    renderForm(props, true);

    expect(
      screen.getByText(/Preferred Communication Method/).className
    ).toContain("text-palette-primary");
    expect(screen.getByText("Contact us").className).not.toContain(
      "text-palette-primary"
    );
  });

  it("when editing the Form styles, then the contact method label has a site color control", () => {
    expect(FormSection.fields).toMatchObject({
      styles: {
        objectFields: {
          preferredContactMethodTextColor: {
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
    });
  });

  it("when editing Heading and Description, then both have entity field toggles", () => {
    expect(FormSection.fields).toMatchObject({
      data: {
        objectFields: {
          heading: {
            type: "entityField",
            filter: { types: ["type.string"] },
          },
          description: {
            type: "entityField",
            filter: { types: ["type.string", "type.rich_text_v2"] },
          },
        },
      },
    });
  });

  it("when Heading and Description use entity fields, then the Form shows entity text", () => {
    const props = getProps();
    props.data.heading.field = "formHeading";
    props.data.heading.constantValueEnabled = false;
    props.data.description.field = "formDescription";
    props.data.description.constantValueEnabled = false;
    renderForm(props, true, undefined, {
      id: "location-1",
      locale: "en",
      formHeading: "Get in touch",
      formDescription: "Description from the entity",
    });

    expect(screen.getByRole("heading", { name: "Get in touch" })).toBeTruthy();
    expect(screen.getByText("Description from the entity")).toBeTruthy();
    expect(screen.queryByText("Contact us")).toBeNull();
  });

  it("when phone opt-in text has a link, then the link appears beside the consent checkbox", () => {
    const props = getProps();
    props.data.phoneOptInText.constantValue = {
      defaultValue: {
        html: '<p>I consent to be contacted. See the <a href="/terms">terms of service</a>.</p>',
      },
    };
    renderForm(props, true);

    const checkbox = screen.getByRole("checkbox", {
      name: /I consent to be contacted/,
    }) as HTMLInputElement;
    const link = screen.getByRole("link", { name: "terms of service" });
    expect(link.getAttribute("href")).toBe("/terms");
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(checkbox.checked).toBe(false);
    expect(FormSection.fields).toMatchObject({
      data: {
        objectFields: { phoneOptInText: { type: "entityField" } },
      },
    });
  });

  it("when text fields render, then their placeholders follow the configured labels", () => {
    const props = getProps();
    props.data.fields.push({
      type: "text",
      label: { defaultValue: "Reference number" },
      key: "reference_number",
      required: false,
    });
    const { container } = renderForm(props, true);

    for (const [name, placeholder] of [
      ["first_name", "First name"],
      ["last_name", "Last name"],
      ["phone", "Phone"],
      ["email", "Email"],
      ["message", "Message"],
      ["custom_7", "Reference number"],
    ]) {
      expect(
        (
          container.querySelector(`[name="${name}"]`) as
            | HTMLInputElement
            | HTMLTextAreaElement
        ).placeholder
      ).toBe(placeholder);
    }
  });

  it("when the form renders, then it shows the required-field marker before the translated label", () => {
    const { container } = renderForm(getProps(), true);

    expect(screen.getByText("* Required")).toBeTruthy();
    expect(container.querySelector("form")?.lastElementChild?.textContent).toBe(
      "* Required"
    );
  });

  it("when the page renders on the server, then it contains the raw site-key marker", () => {
    const markup = renderToString(
      <VisualEditorProvider
        templateProps={{ document: { id: "location-1", locale: "en" } }}
      >
        {FormSection.render?.({
          ...getProps(),
          id: "FormSection-test",
          puck: {
            isEditing: false,
            metadata: {},
            renderDropZone: (): null => null,
            dragRef: null,
          },
        } as Parameters<NonNullable<typeof FormSection.render>>[0])}
      </VisualEditorProvider>
    );

    expect(markup).toContain('data-sitekey="<YEXT_TURNSTILE_SITE_KEY>"');
    expect(markup).toContain('data-execution="execute"');
    expect(markup).not.toContain("cf-turnstile");
  });

  it("when the server replaces the marker, then Turnstile uses the injected key", async () => {
    const { container } = renderForm(
      getProps(),
      false,
      undefined,
      undefined,
      "injected-site-key"
    );

    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());
    const widget = container.querySelector<HTMLElement>("[data-sitekey]");
    expect(widget?.dataset.sitekey).toBe("injected-site-key");
    expect(window.turnstile?.render).toHaveBeenCalledWith(
      widget,
      expect.anything()
    );
    expect(turnstileOptions).toMatchObject({
      sitekey: "injected-site-key",
      appearance: "interaction-only",
      execution: "execute",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("when an editor preview submits, then it uses a test token without a POST", async () => {
    renderForm(getProps(), false, undefined, undefined, undefined, {
      localDev: false,
    });
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );
    expect(turnstileOptions.sitekey).toBe("1x00000000000000000000AA");
    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        "Preview only. No message was sent."
      )
    );
    expect(execute).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("when the local editor preview submits, then it sends the fake POST", async () => {
    renderForm(getProps(), false, undefined, undefined, undefined, {
      localDev: true,
    });
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Send Message",
          }) as HTMLButtonElement
        ).disabled
      ).toBe(false)
    );
    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last name/), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/forms/submit");
    expect(turnstileOptions.sitekey).toBe("1x00000000000000000000AA");
  });

  it("when the local fake page renders, then it uses the test key and sends the POST", async () => {
    const originalPath = window.location.pathname;
    window.history.replaceState({}, "", "/dev-location/test");
    try {
      renderForm(
        getProps(),
        false,
        undefined,
        undefined,
        "<YEXT_TURNSTILE_SITE_KEY>"
      );
      await waitFor(() =>
        expect(
          (
            screen.getByRole("button", {
              name: "Send Message",
            }) as HTMLButtonElement
          ).disabled
        ).toBe(false)
      );
      expect(turnstileOptions.sitekey).toBe("1x00000000000000000000AA");
      fireEvent.change(screen.getByLabelText(/First name/), {
        target: { value: "Ada" },
      });
      fireEvent.change(screen.getByLabelText(/Last name/), {
        target: { value: "Lovelace" },
      });
      fireEvent.change(screen.getByPlaceholderText("Phone"), {
        target: { value: "5555555555" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
      expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/forms/submit");
    } finally {
      window.history.replaceState({}, "", originalPath);
    }
  });

  it("when a required field changes and is left empty, then it gets a red border", () => {
    renderForm(getProps(), true);
    const firstName = screen.getByLabelText(/First name/) as HTMLInputElement;

    expect(firstName.className).not.toContain("border-red-600");
    fireEvent.blur(firstName);
    expect(firstName.className).not.toContain("border-red-600");
    fireEvent.change(firstName, { target: { value: "Ada" } });
    fireEvent.change(firstName, { target: { value: "" } });
    fireEvent.blur(firstName);
    expect(firstName.className).toContain("border-red-600");
    fireEvent.change(firstName, { target: { value: "Ada" } });
    expect(firstName.className).not.toContain("border-red-600");
  });

  it("when Required is off, then the field label has no required marker", () => {
    const props = getProps();
    props.data.fields[1].required = false;
    renderForm(props, true);

    expect(screen.getByText("First name").textContent).toBe("First name");
    expect(screen.getByLabelText("First name")).toHaveProperty(
      "required",
      true
    );
  });

  it("when CTA styles are set, then the button uses site colors", () => {
    const props = getProps();
    props.ctaStyles.color = {
      selectedColor: "palette-secondary",
      contrastingColor: "palette-secondary-contrast",
    };
    props.ctaStyles.labelColor = {
      selectedColor: "white",
      contrastingColor: "black",
    };
    renderForm(props, true);

    const button = screen.getByRole("button", { name: "Send Message" });
    expect(button.getAttribute("style")).toContain(
      "--colors-palette-secondary"
    );
    expect(button.getAttribute("style")).toContain("color: white");
    expect(FormSection.fields).toMatchObject({
      ctaStyles: {
        objectFields: {
          color: { options: "SITE_COLOR" },
          labelColor: { options: "SITE_COLOR" },
        },
      },
    });
  });

  it("when CTA and opt-in labels use entity fields, then the Form shows entity text", () => {
    const props = getProps();
    props.data.submitLabel.field = "formButtonLabel";
    props.data.submitLabel.constantValueEnabled = false;
    props.data.phoneOptInText.field = "formConsent";
    props.data.phoneOptInText.constantValueEnabled = false;
    renderForm(props, true, undefined, {
      id: "location-1",
      locale: "en",
      formButtonLabel: "Send request",
      formConsent: "I agree to receive text messages.",
    });

    expect(screen.getByRole("button", { name: "Send request" })).toBeTruthy();
    expect(screen.getByText("I agree to receive text messages.")).toBeTruthy();
  });

  it("when form text color is set, then the section uses it and the field groups stay ordered", () => {
    const props = getProps();
    props.styles.textColor = {
      selectedColor: "palette-secondary",
      contrastingColor: "palette-secondary-contrast",
    };
    const { container } = renderForm(props, true);

    expect(container.querySelector("section")?.className).toContain(
      "text-palette-secondary"
    );
    expect(Object.keys(FormSection.fields ?? {})).toEqual([
      "styles",
      "data",
      "ctaStyles",
      "liveVisibility",
    ]);
  });

  it("when the preferred contact method changes, then the required marker moves to its input", () => {
    renderForm(getProps(), true);
    const phone = screen.getByPlaceholderText("Phone") as HTMLInputElement;
    const email = screen.getByPlaceholderText("Email") as HTMLInputElement;

    expect(phone.required).toBe(true);
    expect(phone.labels?.[0]?.textContent).toBe("Phone *");
    expect(email.required).toBe(false);
    expect(email.labels?.[0]?.textContent).toBe("Email");

    fireEvent.click(screen.getByRole("radio", { name: "Email" }));

    expect(phone.required).toBe(false);
    expect(phone.labels?.[0]?.textContent).toBe("Phone");
    expect(email.required).toBe(true);
    expect(email.labels?.[0]?.textContent).toBe("Email *");
  });
});
