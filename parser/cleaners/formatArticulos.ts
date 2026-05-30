/**
 * Formats Artículo lines into markdown headings, splitting any inline body
 * text into its own paragraph.
 *
 * Always runs removeDotDash internally so the regex is predictable —
 * "Artículo 1.-" is normalised to "Artículo 1." before matching.
 *
 * Two modes:
 *
 *   withTitle  — captures keyword + number + words up to the next period
 *                as the full heading, then inserts two newlines before any
 *                inline body text.
 *
 *     Input : Artículo 1.- Objeto. Esta ley tiene por objeto…
 *     Output: ##### Artículo 1. Objeto.
 *
 *             Esta ley tiene por objeto…
 *
 *   noTitle    — heading is keyword + number + period only; body text is
 *                moved to a new paragraph.
 *
 *     Input : Artículo 5.- Esta ley es de aplicación…
 *     Output: ##### Artículo 5.
 *
 *             Esta ley es de aplicación…
 */

import { removeDotDash } from "./removeDotDash"

function makeFormatArticulos(withTitle: boolean) {
  return {
    name: withTitle ? "formatArticulosWithTitle" : "formatArticulosNoTitle",
    description: withTitle
      ? "Formats Artículo X. Title. headings — title is words up to the next period"
      : "Formats Artículo X. headings without a title",
    perFileAlternatives: [
      withTitle ? "formatArticulosNoTitle" : "formatArticulosWithTitle",
    ],
    run: (text: string): string => {
      // Run removeDotDash first so "Artículo 1.-" becomes "Artículo 1."
      let result = removeDotDash.run(text)

      if (withTitle) {
        // Match: <keyword> <number>. <Title words>. [body text]
        //  ↳ group 1: "Artículo 1"
        //  ↳ group 2: "Objeto"        (everything between the two periods)
        //  ↳ group 3: remainder of the line (may be empty)
        result = result.replace(
          /^(art[íi]culo\s+\d+)\.\s+([^.]+)\.\s*(.*)/gim,
          (_, keyword, title, body) => {
            const heading = `##### ${keyword}. ${title}.`
            const trimmedBody = body.trim()
            return trimmedBody ? `${heading}\n\n${trimmedBody}` : heading
          },
        )
      } else {
        // Match: <keyword> <number>. [body text]
        //  ↳ group 1: "Artículo 5"
        //  ↳ group 2: remainder of the line (may be empty)
        result = result.replace(
          /^(art[íi]culo\s+\d+)\.\s*(.*)/gim,
          (_, keyword, body) => {
            const heading = `##### ${keyword}.`
            const trimmedBody = body.trim()
            return trimmedBody ? `${heading}\n\n${trimmedBody}` : heading
          },
        )
      }

      return result
    },
  }
}

export const formatArticulosWithTitle = makeFormatArticulos(true)
export const formatArticulosNoTitle = makeFormatArticulos(false)
