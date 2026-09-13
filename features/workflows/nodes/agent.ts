import { z } from "zod"
import Browserbase from "@browserbasehq/sdk"
import type { NodeRunner } from "./types"

const agentSchema = z.object({
  task: z
    .string({ message: "'task' is required" })
    .trim()
    .min(1, "'task' cannot be empty"),
  maxSteps: z.coerce.number().int().min(1).max(50).default(10),
})

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "FAILED",
  "STOPPED",
  "TIMED_OUT",
])

export const run: NodeRunner = async (context, parameters) => {
  const parsed = agentSchema.safeParse(parameters)
  if (!parsed.success) {
    throw new Error(
      `Agent node: invalid parameters — ${parsed.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    )
  }

  const { task, maxSteps } = parsed.data

  const apiKey = process.env.BROWSERBASE_API_KEY
  if (!apiKey) {
    throw new Error("BROWSERBASE_API_KEY is not set")
  }

  const bb = new Browserbase({ apiKey })

  const { runId } = await bb.agents.runs.create({ task })

  const start = Date.now()
  let current
  while (Date.now() - start < maxSteps * 30_000) {
    current = await bb.agents.runs.retrieve(runId)
    if (TERMINAL_STATUSES.has(current.status)) break
    await new Promise((resolve) => setTimeout(resolve, 3_000))
  }

  if (!current) {
    throw new Error(`Agent node: run '${runId}' produced no status`)
  }

  if (current.status !== "COMPLETED") {
    const cause = current.cause
      ? ` (${current.cause.code}${current.cause.message ? ` — ${current.cause.message}` : ""})`
      : ""
    throw new Error(
      `Agent node: run '${runId}' ended with status '${current.status}'${cause}`
    )
  }

  const result = current.result ?? null
  const sessionId = current.sessionId ?? null
  const sessionUrl = sessionId
    ? `https://www.browserbase.com/sessions/${sessionId}`
    : null

  return {
    ...context,
    sessionId,
    sessionUrl,
    variables: {
      ...context.variables,
      lastAgent: result,
    },
    output: {
      ...context.output,
      lastAgent: {
        task,
        runId,
        status: current.status,
        result,
        sessionId,
        at: new Date().toISOString(),
      },
    },
  }
}

export const schema = agentSchema
