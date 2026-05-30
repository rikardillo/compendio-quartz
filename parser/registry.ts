/**
 * Central registry of all cleaners and pipelines.
 *
 * To add a new cleaner:
 *   1. Create parser/cleaners/myNewCleaner.ts
 *   2. Import it below and add it to `cleaners`
 *   3. Optionally add it to a pipeline in `pipelines`
 */

import { removePageNumbers } from "./cleaners/removePageNumbers.ts"
import { removeDoubleSpaces } from "./cleaners/removeDoubleSpaces.ts"
import { normalizeNewlines } from "./cleaners/normalizeNewlines.ts"
import { convertHeadings } from "./cleaners/convertHeadings.ts"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Cleaner = {
  name: string
  description: string
  run: (text: string) => string
}

export type Pipeline = {
  name: string
  description: string
  /** Cleaner names in the order they will be applied. */
  steps: string[]
}

// ─── Cleaners ─────────────────────────────────────────────────────────────────

export const cleaners: Record<string, Cleaner> = {
  removePageNumbers,
  removeDoubleSpaces,
  normalizeNewlines,
  convertHeadings,
}

// ─── Pipelines ────────────────────────────────────────────────────────────────

export const pipelines: Record<string, Pipeline> = {
  "pdf-import": {
    name: "pdf-import",
    description: "Full cleanup sequence for text pasted from a PDF",
    // Order matters: remove page numbers first so the blank lines they leave
    // behind get caught by normalizeNewlines in the next step.
    steps: ["removePageNumbers", "removeDoubleSpaces", "normalizeNewlines", "convertHeadings"],
  },
  light: {
    name: "light",
    description: "Light pass — whitespace and newlines only (no page number removal)",
    steps: ["removeDoubleSpaces", "normalizeNewlines"],
  },
}
