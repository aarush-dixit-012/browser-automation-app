import { browserbase, Stagehand } from "@browserbasehq/stagehand";

export type StagehandHandle = {
  stagehand: Awaited<ReturnType<typeof Stagehand.create>>;
  browser: Awaited<ReturnType<typeof browserbase.launch>>;
};

export async function createStagehand(): Promise<StagehandHandle> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  if (!apiKey) {
    throw new Error("BROWSERBASE_API_KEY is not set");
  }

  const browser = await browserbase.launch({ apiKey });
  const stagehand = await Stagehand.create({ browser, cache: true });

  return { stagehand, browser };
}

export async function closeStagehand(handle: StagehandHandle): Promise<void> {
  await handle.stagehand.close();
  await handle.browser.close();
}