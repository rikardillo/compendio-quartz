/**
 * Splits a markdown file's content into its YAML frontmatter block and body.
 * Cleaners only run on the body, so frontmatter is never accidentally mutated.
 */
export function splitFrontmatter(content: string): {
  frontmatter: string;
  body: string;
} {
  if (!content.startsWith("---")) {
    return { frontmatter: "", body: content };
  }
  // Find the closing --- (must be on its own line after the opening one)
  const closing = content.indexOf("\n---", 3);
  if (closing === -1) {
    return { frontmatter: "", body: content };
  }
  const end = closing + 4; // advance past the \n---
  return {
    frontmatter: content.slice(0, end),
    body: content.slice(end),
  };
}

/**
 * Counts the number of lines that differ between two strings.
 * Used by the dry-run display to give a quick sense of impact.
 */
export function countChangedLines(original: string, cleaned: string): number {
  const a = original.split("\n");
  const b = cleaned.split("\n");
  const len = Math.max(a.length, b.length);
  let count = 0;
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) count++;
  }
  return count;
}
