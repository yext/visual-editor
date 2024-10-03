import { test, assert } from "vitest";
import { resolveVisualEditorData } from "./resolveVisualEditorData.ts";

const defaultData = JSON.stringify({
  root: {},
  content: [],
  zones: {},
});

const puckData = JSON.stringify({
  root: {},
  content: [
    {
      potato: "potato",
    },
    {
      tomato: "tomato",
    },
  ],
  zones: {},
});

const parsePageSet = (data: any): string => {
  return JSON.stringify(data?.["document"]?.["visualTemplate"]);
};

test("resolveVisualEditorData returns value from entity visual configuration", async () => {
  assert.equal(
    parsePageSet(
      resolveVisualEditorData(
        {
          document: {
            visualConfigurations: [
              {
                pageSet: "location",
                data: puckData,
              },
            ],
          },
        },
        "location"
      )
    ),
    puckData
  );
});

test("resolveVisualEditorData returns value from pagesLayouts", async () => {
  assert.equal(
    parsePageSet(
      resolveVisualEditorData(
        {
          document: {
            pageLayouts: [
              {
                visualConfiguration: {
                  pageSet: "location",
                  data: puckData,
                },
              },
            ],
          },
        },
        "location"
      )
    ),
    puckData
  );
});

test("resolveVisualEditorData returns value from _site defaultLayouts", async () => {
  assert.equal(
    parsePageSet(
      resolveVisualEditorData(
        {
          document: {
            _site: {
              defaultLayouts: [
                {
                  visualConfiguration: {
                    pageSet: "location",
                    data: puckData,
                  },
                },
              ],
            },
          },
        },
        "location"
      )
    ),
    puckData
  );
});

test("resolveVisualEditorData returns fallback data if page set not found", async () => {
  assert.equal(
    parsePageSet(
      resolveVisualEditorData(
        {
          document: {
            _site: {
              defaultLayouts: [
                {
                  visualConfiguration: {
                    pageSet: "financialProfessional",
                    data: puckData,
                  },
                },
              ],
            },
          },
        },
        "location"
      )
    ),
    defaultData
  );
});
