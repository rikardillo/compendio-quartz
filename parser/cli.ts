#!/usr/bin/env node
/**
 * compendio parser — CLI entry point
 *
 * Interactive mode (no flags):
 *   npx tsx parser/cli.ts
 *
 * Direct mode:
 *   npx tsx parser/cli.ts --list
 *   npx tsx parser/cli.ts --cleaner removePageNumbers --samples --dry-run
 *   npx tsx parser/cli.ts --pipeline pdf-import --file parser/samples/sample-mixed.md
 *   npx tsx parser/cli.ts --pipeline pdf-import --dir content/Leyes/2024 --dry-run
 *   npx tsx parser/cli.ts --pipeline full --all
 */

import * as p from "@clack/prompts"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { dirname, resolve, relative } from "path"
import { fileURLToPath } from "url"
import { globby } from "globby"
import { cleaners, pipelines } from "./registry"
import { splitFrontmatter, countChangedLines } from "./utils"

// Project root — one level up from parser/
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")

// ─── Core processing ──────────────────────────────────────────────────────────

function applyCleaners(content: string, cleanerNames: string[]): string {
  let { frontmatter, body } = splitFrontmatter(content)
  let cleaned = body
  for (const name of cleanerNames) {
    const cleaner = cleaners[name]
    if (!cleaner) throw new Error(`Unknown cleaner: "${name}"`)
    if (cleaner.runFull) {
      // Full-document cleaners receive (and return) the entire file content so
      // they can read and modify frontmatter.  Re-split after each such step so
      // subsequent cleaners still see a correct frontmatter / body split.
      const result = splitFrontmatter(cleaner.runFull(frontmatter + cleaned))
      frontmatter = result.frontmatter
      cleaned = result.body
    } else {
      cleaned = cleaner.run(cleaned)
    }
  }
  return frontmatter + cleaned
}

async function resolveFiles(target: {
  file?: string
  dir?: string
  all?: boolean
  samples?: boolean
}): Promise<string[]> {
  if (target.file) {
    const abs = resolve(ROOT, target.file)
    if (!existsSync(abs)) throw new Error(`File not found: ${target.file}`)
    return [abs]
  }
  if (target.samples) {
    return globby("parser/samples/**/*.md", { cwd: ROOT, absolute: true })
  }
  if (target.dir) {
    return globby(`${target.dir}/**/*.md`, { cwd: ROOT, absolute: true })
  }
  if (target.all) {
    return globby("content/**/*.md", { cwd: ROOT, absolute: true })
  }
  return []
}

type FileResult = { path: string; changed: boolean; linesDelta: number; skipped?: boolean }

function processFiles(files: string[], cleanerNames: string[], dryRun: boolean): FileResult[] {
  return files.map((filePath) => {
    const original = readFileSync(filePath, "utf8")
    const cleaned = applyCleaners(original, cleanerNames)
    const changed = original !== cleaned
    const linesDelta = countChangedLines(original, cleaned)

    if (changed && !dryRun) {
      writeFileSync(filePath, cleaned, "utf8")
    }

    return { path: filePath, changed, linesDelta }
  })
}

// ─── Per-file interactive processing ────────────────────────────────────────

/**
 * Walks through files one by one and asks the user what to do with each.
 *
 * When the selected cleaner declares `perFileAlternatives`, those variants
 * are offered alongside the default so the user can switch mode per file
 * (e.g. withTitle vs noTitle) without restarting the session.
 */
async function processFilesPerFile(
  files: string[],
  defaultCleanerNames: string[],
  dryRun: boolean,
): Promise<FileResult[]> {
  const results: FileResult[] = []

  // Alternatives only make sense for a single-cleaner selection.
  const alternatives =
    defaultCleanerNames.length === 1
      ? (cleaners[defaultCleanerNames[0]]?.perFileAlternatives ?? [])
      : []

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const rel = relative(ROOT, filePath)

    const actionOptions: Array<{ value: string; label: string; hint?: string }> = [
      {
        value: "main",
        label: "Apply",
        hint: defaultCleanerNames.join(" → "),
      },
      ...alternatives.map((altName) => ({
        value: altName,
        label: `Apply: ${cleaners[altName]?.description ?? altName}`,
      })),
      { value: "skip", label: "Skip" },
    ]

    const action = await p.select({
      message: `[${i + 1}/${files.length}]  ${rel}`,
      options: actionOptions,
    })

    if (p.isCancel(action)) {
      p.cancel("Cancelled.")
      process.exit(0)
    }

    if (action === "skip") {
      results.push({ path: filePath, changed: false, linesDelta: 0, skipped: true })
      p.log.warn(`skipped  ${rel}`)
      continue
    }

    const selectedCleanerNames = action === "main" ? defaultCleanerNames : [action as string]

    const [result] = processFiles([filePath], selectedCleanerNames, dryRun)
    results.push(result)

    const verb = dryRun ? "would change" : "updated"
    if (result.changed) {
      p.log.success(
        `${rel}  (${result.linesDelta} line${result.linesDelta === 1 ? "" : "s"} ${verb})`,
      )
    } else {
      p.log.info(`${rel}  — no changes`)
    }
  }

  return results
}

// ─── Output helpers ───────────────────────────────────────────────────────────

function printResults(results: FileResult[], dryRun: boolean) {
  const changed = results.filter((r) => r.changed)
  const skipped = results.filter((r) => r.skipped)
  const unchanged = results.filter((r) => !r.changed && !r.skipped)

  // In per-file mode results are logged live; only log for bulk mode
  // (i.e. when none have already been individually reported).
  if (!results.some((r) => r.skipped)) {
    for (const r of changed) {
      const rel = relative(ROOT, r.path)
      const action = dryRun ? "would change" : "updated"
      p.log.success(`${rel}  (${r.linesDelta} line${r.linesDelta === 1 ? "" : "s"} ${action})`)
    }
    for (const r of unchanged) {
      const rel = relative(ROOT, r.path)
      p.log.info(`${rel}  — no changes`)
    }
  }

  const verb = dryRun ? "would be modified" : "updated"
  const skipNote = skipped.length ? `  ${skipped.length} skipped.` : ""
  p.outro(
    `${changed.length} of ${results.length} file(s) ${verb}.${skipNote}` +
      (dryRun ? "  (dry run — nothing was written)" : ""),
  )
}

function printList() {
  console.log("\nCLEANERS\n")
  for (const c of Object.values(cleaners)) {
    console.log(`  ${c.name.padEnd(26)}${c.description}`)
  }
  console.log("\nPIPELINES\n")
  for (const pl of Object.values(pipelines)) {
    console.log(`  ${pl.name.padEnd(26)}${pl.description}`)
    console.log(`  ${"".padEnd(26)}steps: ${pl.steps.join(" → ")}\n`)
  }
}

// ─── Interactive mode ──────────────────────────────────────────────────────────

async function runInteractive() {
  p.intro("✦ compendio parser")

  const mode = await p.select({
    message: "What would you like to do?",
    options: [
      { value: "pipeline", label: "Run a pipeline", hint: "multiple cleaners in sequence" },
      { value: "cleaner", label: "Run a single cleaner" },
      { value: "list", label: "List all cleaners and pipelines" },
    ],
  })
  if (p.isCancel(mode)) return p.cancel("Cancelled.")

  if (mode === "list") {
    printList()
    return
  }

  let cleanerNames: string[] = []

  if (mode === "pipeline") {
    const choice = await p.select({
      message: "Select a pipeline:",
      options: Object.values(pipelines).map((pl) => ({
        value: pl.name,
        label: pl.name,
        hint: `${pl.description}  [${pl.steps.join(" → ")}]`,
      })),
    })
    if (p.isCancel(choice)) return p.cancel("Cancelled.")
    cleanerNames = pipelines[choice as string].steps
  } else {
    const choice = await p.select({
      message: "Select a cleaner:",
      options: Object.values(cleaners).map((c) => ({
        value: c.name,
        label: c.name,
        hint: c.description,
      })),
    })
    if (p.isCancel(choice)) return p.cancel("Cancelled.")
    cleanerNames = [choice as string]
  }

  const targetMode = await p.select({
    message: "Target files:",
    options: [
      { value: "samples", label: "Sample files", hint: "parser/samples/*.md" },
      { value: "file", label: "A single file" },
      { value: "dir", label: "A directory", hint: "all .md files, recursive" },
      { value: "all", label: "All content files", hint: "content/**/*.md" },
    ],
  })
  if (p.isCancel(targetMode)) return p.cancel("Cancelled.")

  const target: Parameters<typeof resolveFiles>[0] = {}

  if (targetMode === "file") {
    const filePath = await p.text({
      message: "File path (relative to project root):",
      placeholder: "parser/samples/sample-mixed.md",
      validate: (v) => (v.trim() === "" ? "Path required" : undefined),
    })
    if (p.isCancel(filePath)) return p.cancel("Cancelled.")
    target.file = filePath as string
  } else if (targetMode === "dir") {
    const dirPath = await p.text({
      message: "Directory path (relative to project root):",
      placeholder: "content/Leyes/2024",
      validate: (v) => (v.trim() === "" ? "Path required" : undefined),
    })
    if (p.isCancel(dirPath)) return p.cancel("Cancelled.")
    target.dir = dirPath as string
  } else if (targetMode === "all") {
    target.all = true
  } else {
    target.samples = true
  }

  const dryRun = await p.confirm({
    message: "Dry run? (preview changes without writing to disk)",
    initialValue: true,
  })
  if (p.isCancel(dryRun)) return p.cancel("Cancelled.")

  const files = await resolveFiles(target)
  if (files.length === 0) {
    p.log.warn("No .md files found at the specified target.")
    return
  }

  // ── Per-file mode ─────────────────────────────────────────────────────────
  // Offered whenever more than one file is in scope so the user can decide
  // what to do with each file individually (e.g. choose between withTitle /
  // noTitle artículo formatting on a file-by-file basis).
  if (files.length > 1) {
    const perFile = await p.confirm({
      message: `Process ${files.length} files individually?`,
      active: "Yes, file by file",
      inactive: "No, apply to all",
      initialValue: false,
    })
    if (p.isCancel(perFile)) return p.cancel("Cancelled.")

    if (perFile) {
      const results = await processFilesPerFile(files, cleanerNames, dryRun as boolean)
      printResults(results, dryRun as boolean)
      return
    }
  }

  // ── Bulk mode (original behaviour) ────────────────────────────────────────
  const s = p.spinner()
  s.start(`Processing ${files.length} file(s)…`)
  const results = processFiles(files, cleanerNames, dryRun as boolean)
  s.stop(`Processed ${files.length} file(s)`)

  printResults(results, dryRun as boolean)
}

// ─── Direct CLI mode ───────────────────────────────────────────────────────────

async function runDirect(argv: {
  cleaner?: string
  pipeline?: string
  file?: string
  dir?: string
  all?: boolean
  samples?: boolean
  dryRun?: boolean
  list?: boolean
}) {
  p.intro("✦ compendio parser")

  if (argv.list) {
    printList()
    return
  }

  let cleanerNames: string[] = []

  if (argv.pipeline) {
    const pl = pipelines[argv.pipeline]
    if (!pl) {
      p.log.error(`Unknown pipeline: "${argv.pipeline}". Run --list to see options.`)
      process.exit(1)
    }
    cleanerNames = pl.steps
    p.log.info(`Pipeline: ${pl.name}  [${pl.steps.join(" → ")}]`)
  } else if (argv.cleaner) {
    if (!cleaners[argv.cleaner]) {
      p.log.error(`Unknown cleaner: "${argv.cleaner}". Run --list to see options.`)
      process.exit(1)
    }
    cleanerNames = [argv.cleaner]
    p.log.info(`Cleaner: ${argv.cleaner}`)
  } else {
    p.log.error("Provide --cleaner or --pipeline (or run without args for interactive mode).")
    process.exit(1)
  }

  const target = {
    file: argv.file,
    dir: argv.dir,
    all: argv.all,
    samples: argv.samples,
  }

  const files = await resolveFiles(target)
  if (files.length === 0) {
    p.log.warn("No .md files found at the specified target.")
    return
  }

  const dryRun = argv.dryRun ?? false
  if (dryRun) p.log.warn("Dry run — no files will be written.")

  const s = p.spinner()
  s.start(`Processing ${files.length} file(s)…`)
  const results = processFiles(files, cleanerNames, dryRun)
  s.stop(`Processed ${files.length} file(s)`)

  printResults(results, dryRun)
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const argv = await yargs(hideBin(process.argv))
  .scriptName("parser")
  .usage("$0 [options]  — run without options for interactive mode")
  .option("cleaner", { alias: "c", type: "string", description: "Run a single cleaner by name" })
  .option("pipeline", { alias: "p", type: "string", description: "Run a named pipeline" })
  .option("file", { alias: "f", type: "string", description: "Target a single file" })
  .option("dir", {
    alias: "d",
    type: "string",
    description: "Target all .md files in a directory (recursive)",
  })
  .option("all", { type: "boolean", description: "Target all files under content/" })
  .option("samples", {
    alias: "s",
    type: "boolean",
    description: "Target sample files in parser/samples/",
  })
  .option("dry-run", { type: "boolean", description: "Preview changes without writing to disk" })
  .option("list", { alias: "l", type: "boolean", description: "List all cleaners and pipelines" })
  .help()
  .parseAsync()

const hasDirectArgs = !!(argv.cleaner || argv.pipeline || argv.list)

if (hasDirectArgs) {
  await runDirect({
    cleaner: argv.cleaner,
    pipeline: argv.pipeline,
    file: argv.file,
    dir: argv.dir,
    all: argv.all,
    samples: argv.samples,
    dryRun: argv["dry-run"],
    list: argv.list,
  })
} else {
  await runInteractive()
}
