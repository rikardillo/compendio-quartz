/**
 * Removes dot-dash sequences (e.g. .-) from the text.
 */
export const removeDotDash = {
  name: "removeDotDash",
  description: "Removes dot-dash sequences (e.g. .-) from the text",
  run: (text: string): string => text.replace(/\.-/g, "."),
}
