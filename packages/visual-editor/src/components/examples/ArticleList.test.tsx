import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TemplatePropsContext } from "../../hooks/useDocument.tsx";
import { ArticleList } from "./ArticleList.tsx";

describe("ArticleList", () => {
  it("renders linked items from the selected item source", () => {
    render(
      <TemplatePropsContext.Provider
        value={{
          document: {
            locale: "en",
            c_articles: [
              {
                name: "Article one",
                summary: { html: "<p>Summary one</p>" },
              },
            ],
          },
        }}
      >
        {ArticleList.render?.({
          itemSource: {
            field: "c_articles",
            constantValueEnabled: false,
            constantValue: [],
          },
          itemMappings: {
            title: {
              field: "name",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
            description: {
              field: "summary",
              constantValueEnabled: false,
              constantValue: { defaultValue: { html: "" } },
            },
            image: {
              field: "",
              constantValueEnabled: false,
              constantValue: { url: "", width: 1, height: 1 },
            },
          },
          heading: {
            text: "Featured Articles",
          },
          styles: {
            showHeading: true,
            columns: 3,
          },
          id: "article-list",
          puck: {
            isEditing: false,
            metadata: {},
            dragRef: null,
            renderDropZone: () => null,
          },
        })}
      </TemplatePropsContext.Provider>
    );

    expect(screen.getByText("Featured Articles")).toBeDefined();
    expect(screen.getByText("Article one")).toBeDefined();
    expect(screen.getByText("Summary one")).toBeDefined();
  });
});
