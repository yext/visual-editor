import { type Config, type Data, type FieldTransforms } from "@puckeditor/core";
import { renderToStaticMarkup } from "react-dom/server";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";
import { VisualEditorRender } from "./VisualEditorRender.tsx";

describe("VisualEditorRender", () => {
  it("applies AI field transforms when rendering a component", () => {
    const config = {
      components: {
        GeneratedText: {
          fields: { title: { type: "testEntityField" } },
          render: ({ title }: { title: string }) => <span>{title}</span>,
        },
      },
    } as unknown as Config;
    const data = {
      root: { props: {} },
      content: [
        {
          type: "GeneratedText",
          props: { id: "generated-1", title: { constantValue: "Hello" } },
        },
      ],
    } as Data;
    const fieldTransforms = {
      testEntityField: ({ value }: { value: { constantValue: string } }) =>
        value.constantValue,
    } as unknown as FieldTransforms<Config>;

    expect(
      renderToStaticMarkup(
        <ErrorProvider>
          <VisualEditorRender
            config={config}
            data={data}
            fieldTransforms={fieldTransforms}
          />
        </ErrorProvider>
      )
    ).toContain("<span>Hello</span>");
  });
});
