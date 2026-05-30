/**
 * Reduces three or more consecutive newlines (i.e. more than one blank line)
 * down to exactly two newlines (one blank line).
 *
 * Run this after removePageNumbers so that the gaps left by removed page
 * number lines get collapsed properly.
 */
export const normalizeNewlines = {
  name: "normalizeNewlines",
  description: "Reduces 3+ consecutive blank lines down to a single blank line",
  run: (text: string): string => text.replace(/\n{3,}/g, "\n\n"),
};
