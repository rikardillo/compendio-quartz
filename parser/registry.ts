/**
 * Central registry of all cleaners and pipelines.
 *
 * To add a new cleaner:
 *   1. Create parser/cleaners/myNewCleaner.ts
 *   2. Import it below and add it to `cleaners`
 *   3. Optionally add it to a pipeline in `pipelines`
 */

import { removePageNumbers } from "./cleaners/removePageNumbers"
import { removeDoubleSpaces } from "./cleaners/removeDoubleSpaces"
import { normalizeNewlines } from "./cleaners/normalizeNewlines"
import { convertHeadings } from "./cleaners/convertHeadings"
import { removeDotDash } from "./cleaners/removeDotDash"
import { formatArticulosWithTitle, formatArticulosNoTitle } from "./cleaners/formatArticulos"
import { ensureFrontmatter } from "./cleaners/ensureFrontmatter"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Cleaner = {
  name: string
  description: string
  run: (text: string) => string
  /**
   * Optional hook for cleaners that need to read or modify frontmatter.
   * When present, `applyCleaners` passes the entire file content (frontmatter
   * + body) and re-splits the result.  Use this instead of `run` whenever the
   * cleaner must operate on the document as a whole.
   */
  runFull?: (content: string) => string
  /**
   * Names of related cleaners to offer as alternatives in per-file
   * interactive mode.  Used by the CLI to let the user pick a variant
   * file-by-file without restarting the session.
   */
  perFileAlternatives?: string[]
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
  removeDotDash,
  formatArticulosWithTitle,
  formatArticulosNoTitle,
  ensureFrontmatter,
}

// ─── Pipelines ────────────────────────────────────────────────────────────────

export const pipelines: Record<string, Pipeline> = {
  "pdf-import": {
    name: "pdf-import",
    description: "Full cleanup sequence for text pasted from a PDF",
    // Order matters: remove page numbers first so the blank lines they leave
    // behind get caught by normalizeNewlines in the next step.
    steps: [
      "removePageNumbers",
      "removeDoubleSpaces",
      "normalizeNewlines",
      "convertHeadings",
      "removeDotDash",
    ],
  },
  "pdf-import-titled": {
    name: "pdf-import-titled",
    description: "PDF import for laws where Artículos carry a title (e.g. Artículo 1. Objeto.)",
    // formatArticulosWithTitle runs removeDotDash internally and must come
    // before convertHeadings so artículo lines are already prefixed with #####
    // when convertHeadings processes the rest of the structural keywords.
    steps: [
      "removePageNumbers",
      "removeDoubleSpaces",
      "normalizeNewlines",
      "formatArticulosWithTitle",
      "convertHeadings",
    ],
  },
  "pdf-import-no-title": {
    name: "pdf-import-no-title",
    description: "PDF import for laws where Artículos have no title (e.g. Artículo 5. Body…)",
    steps: [
      "removePageNumbers",
      "removeDoubleSpaces",
      "normalizeNewlines",
      "formatArticulosNoTitle",
      "convertHeadings",
    ],
  },
  light: {
    name: "light",
    description: "Light pass — whitespace and newlines only (no page number removal)",
    steps: ["removeDoubleSpaces", "normalizeNewlines"],
  },
}
