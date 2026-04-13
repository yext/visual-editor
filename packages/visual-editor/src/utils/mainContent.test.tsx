import * as React from "react";
import { describe, expect, it } from "vitest";
import { render as reactRender, screen } from "@testing-library/react";
import { Config, Render } from "@puckeditor/core";
import { MainContent } from "../components/structure/MainContent.tsx";

const TestBody = {
  label: "Test Body",
  fields: {},
  defaultProps: {},
  render: () => <div>Body content</div>,
};

const config: Config = {
  components: {
    MainContent,
    TestBody,
  },
  root: {
    render: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
};

describe("MainContent", () => {
  it("renders slot content inside a native main landmark", () => {
    const { container } = reactRender(
      <Render
        config={config}
        data={{
          root: { props: {} },
          content: [
            {
              type: "MainContent",
              props: {
                id: "MainContent-test",
                content: [
                  {
                    type: "TestBody",
                    props: {
                      id: "TestBody-1",
                    },
                  },
                ],
              },
            },
          ],
          zones: {},
        }}
      />
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getByRole("main").getAttribute("id")).toBe("main-content");
    expect(screen.queryByText("Body content")).not.toBeNull();
  });
});
