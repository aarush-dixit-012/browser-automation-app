# Zest

Browser automation platform. Build visual workflows from seven node types that drive a real Chrome browser in the cloud (via [Browserbase](https://www.browserbase.com) + [Stagehand](https://docs.stagehand.dev)).

Each node is made of two parts:

- **UI definition** — `components/shared/workflow/nodes.tsx` (name, icon, accent, and the parameter fields shown in the properties panel).
- **Runtime logic** — `features/workflows/nodes/*.ts` (a `run(context, parameters)` function that drives the browser, plus a Zod `schema` that validates its parameters).

## Nodes

### Start

- **Kind:** trigger
- **What it does:** entry point of the workflow. It sets the run's `startedAt` timestamp and passes execution along. A workflow must have exactly one Start node, and no other node should point into it.
- **Parameters:** none.

### End

- **Kind:** step
- **What it does:** terminal node. It sets the run's `endedAt` timestamp and finalizes the workflow. Steps after an End node are not required, but the workflow is considered complete when this node runs.
- **Parameters:** none.

### Open URL

- **Kind:** step
- **What it does:** navigates the shared browser page to the given `url`. Every subsequent Act/Observe/Extract node runs against the page opened here — you no longer pass a `url` to those nodes. Place an Open URL node first in a chain to set the target page.
- **Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `url` | yes | The page to load. Must be a valid absolute URL (e.g. `https://example.com`). Supports `{{variable}}` templates. |

- **Runtime output:** stores the active URL in `context.variables.currentUrl` and adds `context.output.lastOpenUrl = { url, finalUrl, at }` (`finalUrl` reflects any redirects).
- **Zod validation:** `url` is trimmed, non-empty, and must be a valid URL. On failure it throws `Open URL node: invalid parameters — …`.

### Act

- **Kind:** step
- **What it does:** performs a natural-language action on the current page (the one opened by an Open URL node) — click a button, type into a field, submit a form, etc. — using Stagehand's `act()`.
- **Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instruction` | `string` | yes | The natural-language action to perform, e.g. `click the "Sign in" button`. Keep it atomic and specific for reliable results. Supports `{{variable}}` templates. |

- **Runtime output:** adds `context.output.lastAct = { instruction, url, at }` (`url` is the page it acted on).
- **Zod validation:** `instruction` is trimmed and non-empty. On failure it throws `Act node: invalid parameters — …`.

### Observe

- **Kind:** step
- **What it does:** asks Stagehand's `observe()` what executable actions are available on the current page (opened by an Open URL node) for the given intent. Useful for discovering elements/interactions before scripting them into an Act node.
- **Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instruction` | `string` | yes | What you intend to do on the page, e.g. `find the login form`. Stagehand returns the matching actions and elements. Supports `{{variable}}` templates. |

- **Runtime output:** stores the discovered actions in `context.variables.lastObserve` and adds `context.output.lastObserve = { count, url, at }` (count of actions found).
- **Zod validation:** `instruction` is trimmed and non-empty. On failure it throws `Observe node: invalid parameters — …`.

### Extract

- **Kind:** step
- **What it does:** extracts structured data from the current page (opened by an Open URL node) via Stagehand's `extract()`. The `fields` parameter defines the output shape: each key is a field name, each value is a plain-English description of what to pull.
- **Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instruction` | `string` | yes | What to extract, e.g. `extract the product name and price from this listing`. Supports `{{variable}}` templates. |
| `fields` | `json` | yes | A JSON object mapping field names to descriptions, e.g. `{"name": "the product title", "price": "the displayed price including currency"}`. Must parse to a non-empty object; each value must be a non-empty string. |

- **Runtime output:** stores the extracted data in `context.variables.lastExtract` and adds `context.output.lastExtract = { data, url, cacheStatus, at }`. `cacheStatus` is `HIT`/`MISS`/`DISABLED` from Stagehand's server-side cache.
- **Zod validation:** `instruction` is trimmed and non-empty; `fields` must be valid JSON that parses to a non-empty object of string → string. On failure it throws `Extract node: invalid parameters — …`.

### Agent

- **Kind:** step
- **What it does:** hands a natural-language `task` to Browserbase's managed autonomous agent. You give it a goal and it figures out the steps itself — searching the web, navigating pages, and combining Stagehand's act/observe/extract to reach the goal — then returns a result. Unlike Act/Observe/Extract, the node is not pointed at a specific `url`; the agent decides where to go.
- **Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task` | `string` | yes | The goal for the agent, e.g. `go to Hacker News and return the top 3 stories with their titles and URLs`. |
| `maxSteps` | `number` | no | Caps how long the node waits for the run (default `10`). The run itself manages its own step/timeout limits server-side; this bounds the client-side poll. |

- **Runtime output:** stores the agent's result in `context.variables.lastAgent` and adds `context.output.lastAgent = { task, runId, status, result, sessionId, at }`. It also updates `context.sessionId`/`context.sessionUrl` to the agent's own browser session.
- **Runtime detail:** the run is **asynchronous** — the node creates the run with `agents.runs.create({ task })`, polls `agents.runs.retrieve(runId)` until a terminal status, and throws if the run fails/times out/stops.
- **Zod validation:** `task` must be a non-empty string; optional `maxSteps` coerced to an integer 1–50 (default 10). On failure it throws `Agent node: invalid parameters — …` or an error describing the run's terminal status.
- **Plan note:** Agent runs bill through **Model Gateway** on the same `BROWSERBASE_API_KEY`; verify the Agents API is available on your plan before relying on it in production.

## Shared parameter rules

- `url` — only on the **Open URL** node. It sets the shared page; Act/Observe/Extract then run against that page, so they no longer take a `url`.
- `instruction` / `task` — natural-language; keep them atomic and specific.
- Start, End, and Agent take no `url`: Start/End are control nodes, and the Agent resolves its own destination autonomously.

## Data passing

A shared `context` flows through every node in topological order:

- **The live page.** An Open URL node navigates the single shared browser page. Everything after it acts/observes/extracts on that same page, so navigation persists between nodes.
- **Variables.** Nodes publish named results to `context.variables` (`lastExtract`, `lastObserve`, `lastAgent`, `currentUrl`). Any later node can read them via `{{variable}}` **templates** in its string parameters.
- **Data passer algorithm.** Before a node runs, the executor resolves `{{key}}` placeholders in each parameter against `context.variables` (`resolveTemplates` in `features/workflows/nodes/types.ts`). `key` may be `lastExtract`, `lastObserve`, `currentUrl`, etc. Unresolvable placeholders are left as-is, and object values are JSON-stringified.
- **Outputs.** Each node also appends to `context.output`, which becomes the final `ExecutionResult.output`.
- **Example.** `Open URL (https://example.com)` → `Extract ({ "heading": "the h1 text" })` → an `Act` node with instruction like `click the link whose text is "{{lastExtract.heading}}"`.

## Architecture

```
app/(dashboard)/workflows/[id]/page.tsx   →  WorkflowEditor (Run button)
        ↓ POST /api/workflows/[id]/run
features/workflows/execute.ts             →  loads graph, topological-order run
        ↓
features/workflows/nodes/{start,end,open-url,act,observe,extract,agent}.ts
        ↓
lib/stagehand.ts                          →  browserbase.launch + Stagehand.create
```

## Environment

| Variable | Required | Notes |
|----------|----------|-------|
| `BROWSERBASE_API_KEY` | yes | Browserbase API key. The API key alone resolves the project — no project id needed. |

LLM calls (act/observe/extract) route through **Model Gateway** using the Browserbase key by default; you don't need a separate `OPENAI_API_KEY`. The free plan includes a capped amount of Model Gateway tokens and excludes proxies/verified sessions (so favor non-bot-protected target sites on Free).
