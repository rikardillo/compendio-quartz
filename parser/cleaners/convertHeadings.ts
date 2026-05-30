/**
 * Converts structural keyword lines into markdown headings.
 *
 * Handles:
 *   - Any casing:        CAPÍTULO, Capítulo, capítulo
 *   - Missing accents:   Capitulo, Titulo, Seccion, Articulo
 *   - Art. abbreviation: Art. 1, ART. 25, art. 3
 *
 * Heading hierarchy:
 *   #     libro
 *   ##    título
 *   ###   capítulo
 *   ####  sección
 *   ##### artículo / art.
 *
 * The original line text is preserved as-is — only the heading prefix is added.
 */

const HEADING_MAP: { pattern: RegExp; level: string }[] = [
  { pattern: /^(libro\b.*)/gim, level: "#" },
  { pattern: /^(t[íi]tulo\b.*)/gim, level: "##" },
  { pattern: /^(cap[íi]tulo\b.*)/gim, level: "###" },
  { pattern: /^(secci[oó]n\b.*)/gim, level: "####" },
  { pattern: /^(art[íi]culo\b.*)/gim, level: "#####" },
  { pattern: /^(art\..*)/gim, level: "#####" },
]

export const convertHeadings = {
  name: "convertHeadings",
  description:
    "Converts LIBRO / TÍTULO / CAPÍTULO / SECCIÓN / ARTÍCULO / ART. lines to markdown headings",
  run: (text: string): string => {
    let result = text
    for (const { pattern, level } of HEADING_MAP) {
      result = result.replace(pattern, `${level} $1`)
    }
    return result
  },
}
