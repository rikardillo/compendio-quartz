/**
 * Removes every non-breaking space (U+00A0) from the text.
 *
 * PDFs and word processors commonly emit \u00A0 instead of plain spaces,
 * which breaks word-wrapping, regex word boundaries, and downstream text
 * matching. A single global replace is sufficient.
 */
export const removeNonBreakingSpaces = {
  name: "removeNonBreakingSpaces",
  description: "Removes non-breaking spaces (\\u00A0)",
  run: (text: string): string => text.replace(/\u00A0/g, ""),
}
