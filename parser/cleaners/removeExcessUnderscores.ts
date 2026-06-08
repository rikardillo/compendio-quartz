/**
 * Removes runs of 4 or more consecutive underscores from the text.
 * Runs of exactly 3 underscores (___) are left untouched.
 */
export const removeExcessUnderscores = {
  name: "removeExcessUnderscores",
  description: "Removes runs of 4+ consecutive underscores, preserving ___",
  run: (text: string): string => text.replace(/_{4,}/g, ""),
}
