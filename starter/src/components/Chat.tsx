import * as React from "react";
import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const Chat = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Helper: set layout data and capture console errors
  async function trySetLayoutData(
    jsonString: string
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    const originalError = window.console.error;
    window.console.error = (...args: any[]) => {
      errors.push(args.join(" "));
      originalError.apply(window.console, args);
    };
    let success = false;
    try {
      // Simulate clicking the Set Layout Data button and entering the JSON
      const btn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "Set Layout Data"
      );
      if (!btn) throw new Error("Set Layout Data button not found");
      // Monkey-patch prompt to auto-fill the chat's JSON
      const originalPrompt = window.prompt;
      window.prompt = () => jsonString;
      btn.click();
      window.prompt = originalPrompt;
      // Wait a tick for errors to be logged
      await new Promise((res) => setTimeout(res, 500));
      success = errors.length === 0;
    } catch (_e: unknown) {
      let msg = "JSON parse error";
      if (_e && typeof _e === "object" && "message" in _e) {
        msg += ": " + (_e as any).message;
      }
      errors.push(msg);
    }
    window.console.error = originalError;
    return { success, errors };
  }

  // Gemini API key from env (Vite convention: VITE_GEMINI_API_KEY)
  // Vite typing for import.meta.env
  // @ts-ignore
  const GEMINI_API_KEY =
    import.meta.env.VITE_GEMINI_API_KEY ||
    "AIzaSyAyWIJq_UDPUdRGUetPBjTzCM73bkiRa4M";
  const ai = React.useMemo(
    () => new GoogleGenAI({ apiKey: GEMINI_API_KEY }),
    [GEMINI_API_KEY]
  );

  // System prompt for Gemini
  const systemPrompt = `

You are an assistant for a visual editor. When a user sends a URL, your job is to analyze the webpage and generate a configuration using only the following components and their props. Here is the explicit list of allowed props for each component:

BannerSection:
  - styles: { backgroundColor?: BackgroundStyle; textAlignment: "left" | "right" | "center"; }
  - data: { text: YextEntityField<TranslatableRichText>; }
  - liveVisibility: boolean

BreadcrumbsSection:
  - data: { directoryRoot: TranslatableString; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

CoreInfoSection:
  - data: { heading: YextEntityField<TranslatableString>; items: YextEntityField<CoreInfoSectionItem[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

EventSection:
  - data: { heading: YextEntityField<TranslatableString>; events: YextEntityField<EventSectionType>; }
  - styles: { backgroundColor?: BackgroundStyle; heading: { level: HeadingLevel; align: "left" | "center" | "right"; }; cards: { headingLevel: HeadingLevel; backgroundColor?: BackgroundStyle; ctaVariant: CTAProps["variant"]; }; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

FAQSection:
  - data: { heading: YextEntityField<TranslatableString>; faqs: YextEntityField<FAQSectionType[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

HeroSection:
  - data: { heading: YextEntityField<TranslatableString>; subheading: YextEntityField<TranslatableString>; image: YextEntityField<string>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

InsightSection:
  - data: { heading: YextEntityField<TranslatableString>; insights: YextEntityField<InsightSectionType[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

NearbyLocationsSection:
  - data: { heading: YextEntityField<TranslatableString>; locations: YextEntityField<NearbyLocationType[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

PhotoGallerySection:
  - data: { heading: YextEntityField<TranslatableString>; images: YextEntityField<string[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

ProductSection:
  - data: { heading: YextEntityField<TranslatableString>; products: YextEntityField<ProductSectionType[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

PromoSection:
  - data: { heading: YextEntityField<TranslatableString>; promos: YextEntityField<PromoSectionType[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

ReviewsSection:
  - backgroundColor: BackgroundStyle;
  - analytics?: { scope?: string; }

StaticMapSection:
  - data: { apiKey: string; }
  - liveVisibility: boolean

TeamSection:
  - data: { heading: YextEntityField<TranslatableString>; members: YextEntityField<TeamSectionType[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

TestimonialSection:
  - data: { heading: YextEntityField<TranslatableString>; testimonials: YextEntityField<TestimonialSectionType[]>; }
  - styles: { backgroundColor?: BackgroundStyle; }
  - analytics?: { scope?: string; }
  - liveVisibility: boolean

ExpandedHeader:
  - data: { primaryHeader: { logo: string; links: TranslatableCTA[]; primaryCTA?: TranslatableCTA; showPrimaryCTA: boolean; secondaryCTA?: TranslatableCTA; showSecondaryCTA: boolean; }; secondaryHeader: { show: boolean; showLanguageDropdown: boolean; secondaryLinks: TranslatableCTA[]; }; }
  - styles: { primaryHeader: { logo: ImageStylingProps; backgroundColor?: BackgroundStyle; primaryCtaVariant: CTAProps["variant"]; secondaryCtaVariant: CTAProps["variant"]; }; secondaryHeader: { backgroundColor?: BackgroundStyle; }; }
  - analytics?: { scope?: string; }

ExpandedFooter:
  - data: { primaryFooter: { logo: string; facebookLink: string; instagramLink: string; linkedInLink: string; pinterestLink: string; tiktokLink: string; youtubeLink: string; xLink: string; utilityImages: { url: string; linkTarget?: string }[]; expandedFooter: boolean; footerLinks: TranslatableCTA[]; expandedFooterLinks: { label: TranslatableString; links: TranslatableCTA[]; }[]; }; secondaryFooter: { show: boolean; copyrightMessage: TranslatableString; secondaryFooterLinks: TranslatableCTA[]; }; }
  - styles: { primaryFooter: { backgroundColor?: BackgroundStyle; linksAlignment: "left" | "right"; logo: ImageStylingProps; utilityImages: ImageStylingProps; }; secondaryFooter: { backgroundColor?: BackgroundStyle; linksAlignment: "left" | "right"; }; }
  - analytics?: { scope?: string; }

You can find the prop information for the above components in this library:
https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/components/_componentCategories.ts
and in the Puck documentation: https://puckeditor.com/v/0.18.3/docs

STRICT RULES (read carefully):
- DO NOT MAKE UP ANY PROPS NOT LISTED ABOVE.
- You MUST read the actual code in the file:
  https://github.com/yext/visual-editor/blob/main/packages/visual-editor/src/components/_componentCategories.ts
  and ONLY use the props that are defined for each component in that file. Do not invent, guess, or add any props that are not present in the code. If a prop is not present in the code for a component, DO NOT include it. If a prop is present, you MUST include it if it is required.
- **ALL required props must be present and valid for each component.**
- **If a prop is a nested object (such as 'ui', 'itemSelector', etc.), you MUST include it and all of its required subfields.**
- **NEVER omit, leave undefined, or guess any required or nested prop.**
- If you are unsure, refer to the prop types and documentation linked above. Double-check the example and the docs before returning your answer.
- If a component requires a 'ui' or 'itemSelector' prop, ALWAYS include it and all required subfields. Do not leave them undefined or missing.
- Validate your output against the prop types and the example before returning. If you are not certain, err on the side of including more required/nested props.

// COMMON ERROR: If you omit a required nested prop (like 'ui' or 'itemSelector'), the configuration will fail with an error such as "Cannot destructure property 'itemSelector' of 'ui' as it is undefined". Double-check that all required nested props are present and valid for every component that needs them. This is the most common mistake and must be avoided.
- For each section of the website, choose the best matching component and set its props to match the content and style of the site as closely as possible.

---
IMPORTANT: Your output MUST be valid JSON (not a code block, not JavaScript, no comments, no trailing commas). Only output the JSON object, nothing else. If you are unsure, validate your output as JSON before returning.

Here is a full working example layout. **You MUST use this as a template for your output.**
Copy the structure, nesting, and all required fields exactly. Only change the content to match the user's request or the target website. Do not remove or rename any keys. Do not omit any nested objects or required fields. If a field is present in the example, it must be present in your output (unless the component is not used).

EXAMPLE:
{"root":{"props":{"title":{"field":"name","constantValue":"","constantValueEnabled":false},"version":7,"description":{"field":"description","constantValue":"","constantValueEnabled":false}}},"zones":{},"content":[{"type":"ExpandedHeader","props":{"data":{"primaryHeader":{"logo":"https://placehold.co/100","links":[{"linkType":"URL","label":{"en":"Main Header Link","hasLocalizedValue":"true"},"link":"#"},{"linkType":"URL","label":{"en":"Main Header Link","hasLocalizedValue":"true"},"link":"#"},{"linkType":"URL","label":{"en":"Main Header Link","hasLocalizedValue":"true"},"link":"#"},{"linkType":"URL","label":{"en":"Main Header Link","hasLocalizedValue":"true"},"link":"#"}],"primaryCTA":{"label":{"en":"Call to Action","hasLocalizedValue":"true"},"link":"#","linkType":"URL"},"secondaryCTA":{"label":{"en":"Call to Action","hasLocalizedValue":"true"},"link":"#","linkType":"URL"}},"secondaryHeader":{"show":false,"showLanguageDropdown":false,"secondaryLinks":[{"linkType":"URL","label":{"en":"Secondary Header Link","hasLocalizedValue":"true"},"link":"#"},{"linkType":"URL","label":{"en":"Secondary Header Link","hasLocalizedValue":"true"},"link":"#"},{"linkType":"URL","label":{"en":"Secondary Header Link","hasLocalizedValue":"true"},"link":"#"},{"linkType":"URL","label":{"en":"Secondary Header Link","hasLocalizedValue":"true"},"link":"#"},{"linkType":"URL","label":{"en":"Secondary Header Link","hasLocalizedValue":"true"},"link":"#"}]}},"styles":{"primaryHeader":{"logo":{"aspectRatio":2},"backgroundColor":{"bgColor":"bg-white","textColor":"text-black"},"primaryCtaVariant":"primary","secondaryCtaVariant":"secondary"},"secondaryHeader":{"backgroundColor":{"bgColor":"bg-palette-primary-light","textColor":"text-black"}}},"analytics":{"scope":"expandedHeader"},"id":"ExpandedHeader-56e40bdd-30f2-45a8-aa97-62ee679b56d6"}},{"type":"BannerSection","props":{"id":"BannerSection-dd6a3db2-0bd2-498a-87a8-717a49577f24","data":{"text":{"field":"","constantValue":{"en":"Banner Text","hasLocalizedValue":"true"},"constantValueEnabled":true}},"styles":{"textAlignment":"center","backgroundColor":{"bgColor":"bg-palette-primary-dark","textColor":"text-white"}},"liveVisibility":true}},{"type":"BreadcrumbsSection","props":{"id":"BreadcrumbsSection-16e56d01-021b-4882-9f40-d3861490d278","data":{"directoryRoot":{"en":"Directory Root","hasLocalizedValue":"true"}},"analytics":{"scope":"breadcrumbs"},"liveVisibility":true}}]}

---
CHECKLIST before returning your answer:
- [ ] Does your output match the structure and nesting of the example exactly?
- [ ] Are all required and nested props (like 'ui', 'itemSelector', etc.) present and valid?
- [ ] Are all keys and objects from the example present in your output for each used component?
- [ ] Did you double-check the docs and prop types?
- [ ] Is your output valid JSON (no comments, no trailing commas, no code block markers)?

**WARNING:** If you miss any required or nested prop (such as 'ui', 'itemSelector', etc.), the configuration will fail. Double-check your output for completeness and validity before returning.
`;

  // Feedback loop: try, retry with error feedback if needed
  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "You", text: input }]);
    setLoading(true);
    setInput("");
    let prompt = systemPrompt + "\n" + input;
    let maxTries = 3;
    for (let attempt = 1; attempt <= maxTries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        let reply =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response.";
        // Remove code block markers if present
        reply = reply
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();
        setMessages((msgs) => [...msgs, { sender: "AI", text: reply }]);

        // Try to parse JSON first
        let parseError = "";
        let updatedReply;
        try {
          updatedReply = JSON.parse(reply);
          if (!("ui" in updatedReply)) {
            updatedReply = { ...updatedReply, ui: {} };
          }
        } catch (err: any) {
          parseError = err?.message || "Invalid JSON";
        }
        if (parseError) {
          // Show parse error in chat UI for user visibility
          setMessages((msgs) => [
            ...msgs,
            {
              sender: "System",
              text: `Error: AI output is not valid JSON. Parse error: ${parseError}`,
            },
          ]);
          // If invalid JSON, send error feedback to Gemini immediately
          prompt =
            systemPrompt +
            `\nThe previous configuration was not valid JSON. Error: ${parseError}\nPlease fix the issues and return a new valid configuration in the required format.` +
            "\nUser request: " +
            input;
          continue;
        }

        // Try to set layout data and check for errors
        const { success, errors } = await trySetLayoutData(
          JSON.stringify(updatedReply)
        );
        if (success) break;
        // If failed, send error feedback to Gemini
        prompt =
          systemPrompt +
          "\nThe previous configuration failed to render. Here are the errors: " +
          errors.join("; ") +
          "\nPlease fix the issues and return a new valid configuration in the required format." +
          "\nUser request: " +
          input;
      } catch (_e) {
        setMessages((msgs) => [
          ...msgs,
          { sender: "AI", text: "Error: Could not get response." },
        ]);
        break;
      }
    }
    setLoading(false);
  };

  // Drawer and button UI
  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          fontSize: 28,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          cursor: "pointer",
        }}
        aria-label="Open chat"
      >
        💬
      </button>

      {/* Drawer Overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 1001,
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: open ? 0 : -420,
          width: 400,
          height: "100vh",
          background: "#fff",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
          zIndex: 1002,
          transition: "right 0.3s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
        }}
        aria-hidden={!open}
      >
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 18 }}>Chat</span>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
            }}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}

          {loading && (
            <div>
              <em>AI is typing...</em>
            </div>
          )}
        </div>
        <div
          style={{
            padding: 16,
            borderTop: "1px solid #eee",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            style={{
              width: "80%",
              marginRight: 8,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            style={{
              width: "20%",
              padding: 8,
              borderRadius: 4,
              background: "#2563eb",
              color: "#fff",
              border: "none",
            }}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default Chat;
