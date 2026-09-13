import { z } from "zod"
import {
  instructionParamSchema,
  resolveTemplates,
  type NodeRunner,
} from "./types"

const observeSchema = z.object({
  instruction: instructionParamSchema,
})

export const run: NodeRunner = async (context, parameters) => {
  const parsed = observeSchema.safeParse(parameters)
  if (!parsed.success) {
    throw new Error(
      `Observe node: invalid parameters — ${parsed.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    )
  }

  const { instruction } = parsed.data
  const resolvedInstruction = resolveTemplates(instruction, context)

  const { data } = await context.handle.stagehand.observe(resolvedInstruction)
  const url = await context.page.url()

  return {
    ...context,
    variables: {
      ...context.variables,
      lastObserve: data,
    },
    output: {
      ...context.output,
      lastObserve: {
        count: Array.isArray(data) ? data.length : 0,
        url,
        at: new Date().toISOString(),
      },
    },
  }
}

export const schema = observeSchema
