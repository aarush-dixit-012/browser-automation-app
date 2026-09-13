import { z } from "zod"
import {
  navigateTo,
  resolveTemplates,
  urlParamSchema,
  type NodeRunner,
} from "./types"

const openUrlSchema = z.object({
  url: urlParamSchema,
})

export const run: NodeRunner = async (context, parameters) => {
  const parsed = openUrlSchema.safeParse(parameters)
  if (!parsed.success) {
    throw new Error(
      `Open URL node: invalid parameters — ${parsed.error.issues
        .map((issue) => issue.message)
        .join("; ")}`
    )
  }

  const url = resolveTemplates(parsed.data.url, context)

  await navigateTo(context, url)
  const finalUrl = await context.page.url()

  return {
    ...context,
    variables: {
      ...context.variables,
      currentUrl: finalUrl,
    },
    output: {
      ...context.output,
      lastOpenUrl: { url, finalUrl, at: new Date().toISOString() },
    },
  }
}

export const schema = openUrlSchema
