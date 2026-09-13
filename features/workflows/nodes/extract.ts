import { z } from "zod"
import {
  instructionParamSchema,
  resolveTemplates,
  type NodeRunner,
} from "./types"

const fieldsSchema = z.preprocess(
  (raw) => {
    if (typeof raw !== "string" || !raw.trim()) return {}
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  },
  z
    .record(z.string(), z.string())
    .or(z.string())
    .transform((val) => {
      if (typeof val === "string") {
        throw new Error("'fields' must be valid JSON")
      }
      if (Object.keys(val).length === 0) {
        throw new Error("'fields' must contain at least one field")
      }
      return val
    })
)

const extractSchema = z.object({
  instruction: instructionParamSchema,
  fields: fieldsSchema,
})

export const run: NodeRunner = async (context, parameters) => {
  const parsed = extractSchema.safeParse(parameters)
  if (!parsed.success) {
    throw new Error(
      `Extract node: invalid parameters — ${parsed.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    )
  }

  const { instruction, fields } = parsed.data
  const resolvedInstruction = resolveTemplates(instruction, context)

  const shape = z.object(
    Object.fromEntries(
      Object.entries(fields).map(([name, description]) => [
        name,
        z.string().describe(description),
      ])
    )
  )

  const { data, metadata } = await context.handle.stagehand.extract(
    resolvedInstruction,
    shape
  )
  const url = await context.page.url()

  return {
    ...context,
    variables: {
      ...context.variables,
      lastExtract: data,
    },
    output: {
      ...context.output,
      lastExtract: {
        data,
        url,
        cacheStatus: metadata.cache.status,
        at: new Date().toISOString(),
      },
    },
  }
}

export const schema = extractSchema
