import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { FormSection, FormSectionProps } from "./FormSection.tsx";

const renderForm = (
  props: FormSectionProps,
  isEditing = false,
  container?: HTMLElement
) =>
  render(
    <VisualEditorProvider
      templateProps={{ document: { id: "location-1", locale: "en" } }}
    >
      {FormSection.render?.({
        ...props,
        id: "FormSection-test",
        puck: { isEditing },
      } as Parameters<NonNullable<typeof FormSection.render>>[0])}
    </VisualEditorProvider>,
    { container }
  );

const getProps = (): FormSectionProps =>
  structuredClone(FormSection.defaultProps as FormSectionProps);

describe("FormSection", () => {
  let turnstileOptions: {
    callback: (token: string) => void;
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
    props.data.turnstileSiteKey = "test-site-key";
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
    fireEvent.change(screen.getByLabelText(/Phone \*/), {
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
    props.data.turnstileSiteKey = "test-site-key";
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
    fireEvent.change(screen.getByLabelText(/Email \*/), {
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
    props.data.turnstileSiteKey = "test-site-key";
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
    props.data.turnstileSiteKey = "test-site-key";
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
    props.data.turnstileSiteKey = "test-site-key";
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
    fireEvent.change(screen.getByLabelText(/Phone \*/), {
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
    props.data.turnstileSiteKey = "test-site-key";
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
    props.data.turnstileSiteKey = "test-site-key";
    const { getByRole, getByLabelText, unmount } = renderForm(
      props,
      false,
      container
    );
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
    fireEvent.change(getByLabelText(/Phone \*/), {
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

  it("when Turnstile cannot load, then the form shows a verification error", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    delete window.turnstile;
    const props = getProps();
    props.data.turnstileSiteKey = "test-site-key";
    renderForm(props);
    document
      .querySelector<HTMLScriptElement>(
        'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]'
      )!
      .dispatchEvent(new Event("error"));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Verification could not load"
      )
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Send Message",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(logError).toHaveBeenCalled();
    logError.mockRestore();
  });

  it("keeps Backspace and Delete in form text fields from reaching Puck", () => {
    renderForm(getProps());
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
    props.data.turnstileSiteKey = "test-site-key";
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
    fireEvent.change(screen.getByLabelText(/Phone \*/), {
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
      props.data.turnstileSiteKey = "test-site-key";
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
      fireEvent.change(screen.getByLabelText(/Phone \*/), {
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
    props.data.turnstileSiteKey = "test-site-key";
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
    fireEvent.change(screen.getByLabelText(/Phone \*/), {
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
});
