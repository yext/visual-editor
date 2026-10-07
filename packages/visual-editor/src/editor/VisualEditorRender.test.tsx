import React from "react";
import { Puck, type Config, type Data } from "@puckeditor/core";
import { Render as ServerRender } from "@puckeditor/core/rsc";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { MaybeRTF } from "../components/helpers/maybeRTF.tsx";
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
              asset: {
                defaultValue: {
                  url: "/asset.jpg",
                  alternateText: { defaultValue: "Asset", es: "Foto [[name]]" },
                },
              },
              categories: {
                selections: [
                  { value: "menu" },
                  { value: 0 },
                  { value: undefined },
                ],
              },
              seats: 0,
              primaryCta: {
                field: "orderCta",
                selectedType: "textAndLink",
                constantValue: { label: "", link: "" },
              },
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
              asset: { type: "image", transform: true },
              categories: {
                type: "multiSelector",
                transform: true,
                label: "Categories",
                dropdownLabel: "Category",
                options: [],
              },
              seats: {
                type: "optionalNumber",
                transform: true,
                showNumberFieldRadioLabel: "Show",
                hideNumberFieldRadioLabel: "Hide",
                defaultCustomValue: 1,
              },
              primaryCta: { type: "ctaSelector", transform: true },
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
              asset,
              categories,
              seats,
              primaryCta,
            }) => (
              <section>
                <h1>{title}</h1>
                <MaybeRTF data={description} />
                <img src={image.url} alt={image.alternateText} />
                <img src={asset.url} alt={asset.alternateText} />
                <span>{categories.join(",")}</span>
                <span data-testid="seats">{seats}</span>
                <a href={primaryCta.link}>{primaryCta.label}</a>
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
        orderCta: {
          label: { defaultValue: "Order", es: "Pedir [[name]]" },
          link: { defaultValue: "/en", es: "/es" },
        },
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
      expect(screen.getByAltText("Restaurant image").getAttribute("src")).toBe(
        "/hero.jpg"
      );
      expect(screen.getByAltText("Restaurant image").getAttribute("alt")).toBe(
        "Restaurant image"
      );
      expect(screen.getByText("Hola Restaurant")).toBeTruthy();
      expect(screen.getByText("Fila")).toBeTruthy();
      expect(screen.getByText("Original")).toBeTruthy();
      expect(screen.getByAltText("Foto Restaurant").getAttribute("src")).toBe(
        "/asset.jpg"
      );
      expect(screen.getByText("menu,0")).toBeTruthy();
      expect(screen.getByTestId("seats").textContent).toBe("0");
      expect(screen.getByText("Pedir Restaurant").getAttribute("href")).toBe(
        "/es"
      );
      expect(data).toEqual(authoredData);
    }
  );
});
