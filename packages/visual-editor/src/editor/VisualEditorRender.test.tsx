import React from "react";
import { Puck, type Config, type Data } from "@puckeditor/core";
import { Render as ServerRender } from "@puckeditor/core/rsc";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { MaybeRTF as RichTextRenderer } from "../components/helpers/maybeRTF.tsx";
import { createYextFieldTransforms } from "../fields/fieldTransforms.tsx";
import { toPuckFields } from "../fields/fields.ts";
import { VisualEditorRender } from "./VisualEditorRender.tsx";

vi.mock("react-i18next", async () => ({
  ...(await vi.importActual("react-i18next")),
  useTranslation: () => ({ i18n: { language: "es" } }),
}));

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("native Puck field transforms", () => {
  it.each(["live page", "server render", "editor preview"])(
    "when fields opt in then the %s receives resolved props and keeps authored data",
    async (mode) => {
      const data: Data = {
        root: { props: {} },
        content: [
          {
            type: "Hero",
            props: {
              id: "hero",
              title: { field: "name", constantValue: "" },
              description: { field: "description", constantValue: "" },
              image: { field: "photo", constantValue: {} },
              nested: {
                label: { defaultValue: "Welcome", es: "Hola [[name]]" },
              },
              rows: [{ label: { defaultValue: "List", es: "Fila" } }],
              untouched: { field: "name", constantValue: "Original" },
            },
          },
        ],
      };
      const authoredData = structuredClone(data);
      const config: Config = {
        components: {
          Hero: {
            fields: toPuckFields({
              title: {
                type: "entityField",
                transform: true,
                filter: { types: ["type.string"] },
              },
              description: {
                type: "entityField",
                transform: true,
                filter: { types: ["type.rich_text_v2"] },
              },
              image: {
                type: "entityField",
                transform: true,
                filter: { types: ["type.image"] },
              },
              nested: {
                type: "object",
                objectFields: {
                  label: { type: "translatableString", transform: true },
                },
              },
              rows: {
                type: "array",
                arrayFields: {
                  label: { type: "translatableString", transform: true },
                },
              },
              untouched: {
                type: "entityField",
                filter: { types: ["type.string"] },
              },
            }),
            render: ({
              title,
              description,
              image,
              nested,
              rows,
              untouched,
            }) => (
              <section>
                <h1>{title}</h1>
                <RichTextRenderer data={description} />
                <img src={image.url} alt={image.alternateText} />
                <span>{nested.label}</span>
                <span>{rows[0].label}</span>
                <span>{untouched.constantValue}</span>
              </section>
            ),
          },
        },
      };
      const streamDocument = {
        locale: "es",
        name: "Restaurant",
        description: { html: "<p>Shared rich text</p>", json: "{}" },
        photo: {
          url: "/hero.jpg",
          alternateText: { defaultValue: "Image", es: "Restaurant image" },
        },
      };
      const fieldTransforms = createYextFieldTransforms(streamDocument, "es");
      render(
        <ErrorProvider>
          <TemplatePropsContext.Provider value={{ document: streamDocument }}>
            {mode === "live page" ? (
              <VisualEditorRender config={config} data={data} />
            ) : mode === "server render" ? (
              <ServerRender
                config={config}
                data={data}
                fieldTransforms={fieldTransforms}
              />
            ) : (
              <Puck
                config={config}
                data={data}
                fieldTransforms={fieldTransforms}
                iframe={{ enabled: false }}
              >
                <Puck.Preview />
              </Puck>
            )}
          </TemplatePropsContext.Provider>
        </ErrorProvider>
      );
      // JSDOM does not measure Puck's layout, so query the preview's content directly.
      expect((await screen.findByText("Restaurant")).tagName).toBe("H1");
      expect(screen.getByText("Shared rich text")).toBeTruthy();
      expect(
        screen.getByRole("img", { hidden: true }).getAttribute("src")
      ).toBe("/hero.jpg");
      expect(
        screen.getByRole("img", { hidden: true }).getAttribute("alt")
      ).toBe("Restaurant image");
      expect(screen.getByText("Hola Restaurant")).toBeTruthy();
      expect(screen.getByText("Fila")).toBeTruthy();
      expect(screen.getByText("Original")).toBeTruthy();
      expect(data).toEqual(authoredData);
    }
  );
});
