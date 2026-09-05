import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    orgId: text("org_id").notNull(),
    graph: jsonb("graph").$type<WorkflowGraph>().notNull().default({
      nodes: [],
      edges: [],
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("workflows_org_id_idx").on(table.orgId)]
)

export type WorkflowGraph = {
  nodes: Array<Record<string, unknown>>
  edges: Array<Record<string, unknown>>
  jsonl?: string
}

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert