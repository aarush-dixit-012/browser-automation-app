import type { NodeRunner } from "./types"

export const run: NodeRunner = async (context) => {
  return {
    ...context,
    output: {
      ...context.output,
      endedAt: new Date().toISOString(),
    },
  }
}