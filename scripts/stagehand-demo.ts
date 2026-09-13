import { z } from "zod";
import { closeStagehand, createStagehand } from "../lib/stagehand";

const pageSchema = z.object({
  title: z.string().describe("the page <title> shown in the browser tab"),
  heading: z.string().describe("the main h1 heading text on the page"),
  domainText: z
    .string()
    .describe("the literal domain text shown on the page (e.g. example.com)"),
});

async function main(): Promise<void> {
  const { stagehand, browser } = await createStagehand();
  try {
    const page = await stagehand.browser.context.activePage();
    if (!page) throw new Error("Stagehand initialized without an active page");
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    const { data, metadata } = await stagehand.extract(
      "extract the page title, the main heading, and the literal domain text shown on the page",
      pageSchema,
    );

    console.log("Extracted:", data);
    console.log("Cache:", metadata.cache.status);
    console.log(
      "Session:",
      browser.sessionId ? `https://www.browserbase.com/sessions/${browser.sessionId}` : "(no session id)",
    );
  } finally {
    await closeStagehand({ stagehand, browser });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});