/**
 * Removes PDF page number artifacts.
 *
 * Matches lines that look like:  - 12 -
 * including any trailing whitespace and the following newline.
 *
 * Run this before normalizeNewlines so the leftover blank lines
 * get collapsed in a subsequent pass.
 */
export const removePageNumbers = {
  name: "removePageNumbers",
  description: 'Strips PDF page number lines such as "- 12 -"',
  run: (text: string): string =>
    text.replace(/^-[ \t]+\d+[ \t]+-[ \t]*\n?/gm, ""),
};
