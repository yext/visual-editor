import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/generationCatalog.ts";

export const creationCatalog = () =>
  createPuckGenerationCatalog({
    MainContent: {
      generation: { props: z.object({ content: z.array(z.unknown()) }) },
      fields: { content: { type: "slot", allow: ["Heading"] } },
      defaultProps: { content: [] },
    },
    Heading: {
      generation: { props: z.object({ text: z.string().min(1) }) },
      fields: { text: { type: "text" } },
    },
  });
export const heading = (text: string) => ({ type: "Heading", props: { text } });
export const creation = (
  content = [heading('Hello "世界" \\ \n'), heading("Second")]
) => ({
  text: "Created page.",
  translationMode: "defaultOnly",
  result: {
    action: "create",
    content: [{ type: "MainContent", props: { content } }],
  },
});
