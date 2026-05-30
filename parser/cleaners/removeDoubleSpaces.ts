/**
 * Collapses two or more consecutive spaces (only spaces, not tabs or newlines)
 * into a single space.
 *
 * A single replace with / {2,}/g handles runs of any length in one pass —
 * no loop needed.
 */
export const removeDoubleSpaces = {
  name: "removeDoubleSpaces",
  description: "Collapses 2+ consecutive spaces into a single space",
  run: (text: string): string => text.replace(/ {2,}/g, " "),
};
