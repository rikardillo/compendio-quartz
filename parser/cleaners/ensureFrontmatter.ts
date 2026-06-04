import { splitFrontmatter } from "../utils"

/**
 * Describes a single key that must be present in the frontmatter.
 * If the key is absent, it is injected with `defaultValue` (already serialised
 * as valid YAML, e.g. `'""'` or `'[]'`).
 *
 * To require additional keys, add an entry to REQUIRED_FIELDS below.
 */
export interface FrontmatterField {
  key: string
  defaultValue: string
}

// ─── Required fields ──────────────────────────────────────────────────────────
// Add / remove entries here to control which keys are guaranteed to exist.

const REQUIRED_FIELDS: FrontmatterField[] = [
  { key: "title", defaultValue: '""' },
  { key: "tags", defaultValue: "[]" },
]

// ─── Cleaner ──────────────────────────────────────────────────────────────────

/**
 * Ensures every markdown file has a frontmatter block containing at minimum
 * the keys listed in REQUIRED_FIELDS.
 *
 * Behaviour:
 *   - No frontmatter at all → a new block is prepended with all required keys.
 *   - Frontmatter exists but is missing one or more keys → the missing keys are
 *     appended just before the closing `---`.
 *   - All required keys already present → file is left untouched.
 *
 * This cleaner uses `runFull` so it receives the entire file content
 * (frontmatter + body) instead of the body alone.  `run` is a no-op kept
 * only to satisfy the Cleaner interface when this cleaner is not invoked
 * through `runFull`.
 */
export const ensureFrontmatter = {
  name: "ensureFrontmatter",
  description: "Adds a frontmatter block (title, tags) when absent; injects missing keys into existing frontmatter",

  // No-op — this cleaner always runs via runFull.
  run: (text: string): string => text,

  runFull: (content: string): string => {
    const { frontmatter, body } = splitFrontmatter(content)

    // ── No frontmatter at all ────────────────────────────────────────────────
    if (!frontmatter) {
      const fields = REQUIRED_FIELDS.map((f) => `${f.key}: ${f.defaultValue}`).join("\n")
      return `---\n${fields}\n---\n${body}`
    }

    // ── Frontmatter exists — find and inject only missing keys ───────────────
    const missingFields = REQUIRED_FIELDS.filter((f) => {
      // Match "key:" at the start of any line inside the frontmatter block.
      const keyPattern = new RegExp(`^${f.key}\\s*:`, "m")
      return !keyPattern.test(frontmatter)
    })

    if (missingFields.length === 0) return content

    // Insert the missing lines just before the closing `\n---`.
    const closingIdx = frontmatter.lastIndexOf("\n---")
    const injected = missingFields.map((f) => `${f.key}: ${f.defaultValue}`).join("\n")
    const updatedFrontmatter =
      frontmatter.slice(0, closingIdx) + "\n" + injected + frontmatter.slice(closingIdx)

    return updatedFrontmatter + body
  },
}
