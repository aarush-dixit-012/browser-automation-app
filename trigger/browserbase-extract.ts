import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { closeStagehand, createStagehand } from "../lib/stagehand";

const extractPageSchema = z.object({
  url: z
    .string()
    .url()
    .describe("the URL to navigate to with the Browserbase cloud browser"),
  instruction: z
    .string()
    .min(1)
    .describe(
      "natural-language instruction telling Stagehand what to extract from the page",
    ),
  fields: z
    .record(z.string(), z.string())
    .describe(
      'map of field name -> description, defining the structured output schema. e.g. { title: "the page title", price: "the numeric price" }',
    ),
});

export const extractPage = schemaTask({
  id: "browserbase-extract-page",
  schema: extractPageSchema,
  retry: { maxAttempts: 2 },
  run: async ({ url, instruction, fields }) => {
    const { stagehand, browser } = await createStagehand();

    try {
      const page = await stagehand.browser.context.activePage();
      if (!page) throw new Error("Stagehand initialized without an active page");
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const shape = z.object(
        Object.fromEntries(
          Object.entries(fields).map(([name, description]) => [
            name,
            z.string().describe(description),
          ]),
        ),
      );

      const { data, metadata } = await stagehand.extract(instruction, shape);

      const sessionId = browser.sessionId ?? null;
      const sessionUrl = sessionId
        ? `https://www.browserbase.com/sessions/${sessionId}`
        : null;

      return {
        data: data as Record<string, unknown>,
        cacheStatus: metadata.cache.status,
        sessionId,
        sessionUrl,
      };
    } finally {
      await closeStagehand({ stagehand, browser });
    }
  },
});