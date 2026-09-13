import type { Page, Stagehand } from "@browserbasehq/stagehand"
import { z } from "zod"

export type StagehandHandle = {
  stagehand: Stagehand
  browser: {
    sessionId?: string | null
  }
}

export type NodeContext = {
  handle: StagehandHandle
  page: Page
  sessionId: string | null
  sessionUrl: string | null
  variables: Record<string, unknown>
  output: Record<string, unknown>
}

export type NodeParameters = Record<string, string>

export type NodeRunner = (
  context: NodeContext,
  parameters: NodeParameters
) => Promise<NodeContext>

export const urlParamSchema = z
  .string({ message: "'url' is required" })
  .trim()
  .min(1, "'url' cannot be empty")
  .url("'url' must be a valid URL (e.g. https://example.com)")

export const instructionParamSchema = z
  .string({ message: "'instruction' is required" })
  .trim()
  .min(1, "'instruction' cannot be empty")

export async function navigateTo(
  context: NodeContext,
  url: string
): Promise<void> {
  await context.page.goto(url, { waitUntil: "domcontentloaded" })
}

const TEMPLATE_PATTERN = /\{\{\s*([^}]+?)\s*\}\}/g

function lookupPath(
  root: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split(".").map((part) => part.trim())
  let current: unknown = root
  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function resolveTemplates(
  value: string,
  context: NodeContext
): string {
  if (!value.includes("{{")) return value
  return value.replace(TEMPLATE_PATTERN, (match, key: string) => {
    const resolved = lookupPath(context.variables, key.trim())
    if (resolved === undefined || resolved === null) return match
    if (typeof resolved === "object") return JSON.stringify(resolved)
    return String(resolved)
  })
}