import { z } from "zod"
import {
  instructionParamSchema,
  resolveTemplates,
  type NodeRunner,
} from "./types"

const actSchema = z.object({
  instruction: instructionParamSchema,
})

export const run: NodeRunner = async (context, parameters) => {
  const parsed = actSchema.safeParse(parameters)
  if (!parsed.success) {
    throw new Error(
      `Act node: invalid parameters — ${parsed.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    )
  }

  const { instruction } = parsed.data
  const resolvedInstruction = resolveTemplates(instruction, context)

  await context.handle.stagehand.act(resolvedInstruction)

  const url = await context.page.url()

  return {
    ...context,
    output: {
      ...context.output,
      lastAct: {
        instruction: resolvedInstruction,
        url,
        at: new Date().toISOString(),
      },
    },
  }
}

export const schema = actSchema
