import type { Data } from "@puckeditor/core";
import { vi } from "vitest";
import { clone, type Content } from "../shared/authoredValues.ts";
import { creationCatalog } from "./creationFixtures.ts";
import { preserveSectionEditResolution } from "../workflows/edits/applyEditsToLayout.ts";
import { applyRegenerationStep } from "../workflows/fullPageRegeneration/applyRegenerationStep.ts";
import type { RegenerationStep } from "../workflows/fullPageRegeneration/contracts.ts";
import { RegenerationSession } from "../workflows/fullPageRegeneration/RegenerationSession.ts";

export const savedHeading = (id: string) => ({
  type: "Heading",
  props: { id, text: id },
  readOnly: { unused: true },
});
export const newHeading = (id: string) => ({
  type: "Heading",
  props: { id, text: id },
});
export const regenerationLayout = (): Data => ({
  root: { props: { title: "Untouched root" } },
  zones: {},
  content: [
    savedHeading("header"),
    {
      type: "MainContent",
      props: {
        id: "main",
        content: [
          savedHeading("hero"),
          savedHeading("services"),
          savedHeading("testimonials"),
        ],
      },
    },
    savedHeading("footer"),
  ],
});
export const regenerationResponse = (
  steps: unknown[],
  translationMode = "defaultOnly"
) => ({
  translationMode,
  result: { action: "regenerate", steps },
  text: "Page regenerated.",
});
export const bodySections = (data: Content) =>
  data.content.find((item) => item.type === "MainContent")!.props
    .content as Content["content"];
export const regenerationSessionFixture = () => {
  const catalog = creationCatalog();
  let data = regenerationLayout();
  const commit = vi.fn((next: Data, _baseline: Data) => {
    data = next;
  });
  const preview = vi.fn((next: Data) => {
    data = next;
  });
  const adapter = {
    read: () => data,
    resolve: vi.fn(async (candidate: Data) => candidate),
    validate: vi.fn(),
    preview,
    commit,
    materializeRegeneration: (baseline: Data, step: RegenerationStep) =>
      applyRegenerationStep(catalog, baseline as Content, step) as Data,
    preserveSectionResolution: (resolved: Data, candidate: Data) =>
      preserveSectionEditResolution(
        catalog,
        resolved as Content,
        candidate as Content
      ) as Data,
  };
  const session = new RegenerationSession(adapter, clone(data));
  return { catalog, session, adapter, commit, preview, data: () => data };
};
