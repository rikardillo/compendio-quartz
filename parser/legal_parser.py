#!/usr/bin/env python3
"""
Legal Document Parser for Dominican Republic Laws
==================================================

This parser converts unformatted legal documents (extracted from PDFs) into
properly formatted Markdown files with appropriate heading levels.

Hierarchy:
- TÍTULO/Título → # (H1)
- CAPÍTULO/Capítulo → ## (H2)
- SECCIÓN/Sección → ### (H3)
- Artículo → #### (H4)
- Libro/LIBRO → # (H1)

Usage:
    python legal_parser.py <input_file> [output_file]
    python legal_parser.py --directory <directory_path>
"""

import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple


@dataclass
class HeadingPattern:
    """Represents a heading pattern with its corresponding Markdown level."""

    pattern: re.Pattern
    level: int
    name: str


class LegalDocumentParser:
    """
    Parser for Dominican Republic legal documents.

    Converts unformatted legal text into properly structured Markdown
    while preserving all legal content integrity.
    """

    # Define heading patterns in order of hierarchy (highest to lowest)
    HEADING_PATTERNS = [
        # LIBRO/Libro (H1)
        HeadingPattern(
            pattern=re.compile(r"^(LIBRO|Libro)\s+([IVXLCDM]+|[0-9]+)", re.IGNORECASE),
            level=1,
            name="Libro",
        ),
        # TÍTULO/Título (H1)
        HeadingPattern(
            pattern=re.compile(
                r"^(TÍTULO|Título|TITULO|Titulo)\s+([IVXLCDM]+|[0-9]+)", re.IGNORECASE
            ),
            level=1,
            name="Título",
        ),
        # CAPÍTULO/Capítulo (H2)
        HeadingPattern(
            pattern=re.compile(
                r"^(CAPÍTULO|Capítulo|CAPITULO|Capitulo|CAPÌTULO|Capìtulo)\s+([IVXLCDM]+|[0-9]+|\w+)",
                re.IGNORECASE,
            ),
            level=2,
            name="Capítulo",
        ),
        # SECCIÓN/Sección (H3)
        HeadingPattern(
            pattern=re.compile(
                r"^(SECCIÓN|Sección|SECCION|Seccion|SECCIÒN|Secciòn)\s+([IVXLCDM]+|[0-9]+)",
                re.IGNORECASE,
            ),
            level=3,
            name="Sección",
        ),
        # Artículo (H4)
        HeadingPattern(
            pattern=re.compile(
                r"^(Artículo|Artìculo|Articulo|ARTÍCULO|ARTICULO|ARTÌCULO)\s+([0-9]+|[lI]?[0-9]+|[IVXLCDM]+)",
                re.IGNORECASE,
            ),
            level=4,
            name="Artículo",
        ),
        # Parágrafo (H5)
        HeadingPattern(
            pattern=re.compile(
                r"^(Parágrafo|Paragrafo|PARÁGRAFO|PARAGRAFO)", re.IGNORECASE
            ),
            level=5,
            name="Parágrafo",
        ),
    ]

    # Special patterns that should be treated as headings
    SPECIAL_PATTERNS = [
        # Considerandos
        re.compile(
            r"^(Considerando)\s+(primero|segundo|tercero|cuarto|quinto|sexto|séptimo|octavo|noveno|décimo):",
            re.IGNORECASE,
        ),
        # EL CONGRESO NACIONAL
        re.compile(r"^(EL CONGRESO NACIONAL)\s*$", re.IGNORECASE),
        # En Nombre de la República
        re.compile(r"^(En Nombre de la República)\s*$", re.IGNORECASE),
        # HA DADO LA SIGUIENTE LEY
        re.compile(r"^(HA DADO LA SIGUIENTE LEY):?", re.IGNORECASE),
    ]

    # Patterns for section titles without numbers
    SECTION_TITLE_PATTERNS = [
        re.compile(r"^(DEL?|DE LA|DE LOS|DE LAS)\s+[A-ZÁÉÍÓÚÑ]", re.IGNORECASE),
    ]

    def __init__(self, preserve_frontmatter: bool = True):
        """
        Initialize the parser.

        Args:
            preserve_frontmatter: Whether to preserve YAML frontmatter at the beginning
        """
        self.preserve_frontmatter = preserve_frontmatter

    def is_frontmatter_line(
        self, line: str, in_frontmatter: bool, frontmatter_started: bool
    ) -> Tuple[bool, bool]:
        """
        Check if a line is part of YAML frontmatter.

        Args:
            line: The line to check
            in_frontmatter: Whether we're currently in frontmatter
            frontmatter_started: Whether frontmatter has been encountered

        Returns:
            Tuple of (is_frontmatter, in_frontmatter_state)
        """
        if line.strip() == "---":
            if not frontmatter_started:
                return True, True
            elif in_frontmatter:
                return True, False
        elif in_frontmatter:
            return True, True

        return False, False

    def detect_heading(self, line: str) -> Optional[Tuple[int, str]]:
        """
        Detect if a line should be converted to a heading.

        Args:
            line: The line to analyze

        Returns:
            Tuple of (heading_level, formatted_line) or None if not a heading
        """
        stripped = line.strip()

        if not stripped:
            return None

        # Check main heading patterns
        for pattern_info in self.HEADING_PATTERNS:
            match = pattern_info.pattern.match(stripped)
            if match:
                return (pattern_info.level, stripped)

        # Check special patterns (usually H2)
        for pattern in self.SPECIAL_PATTERNS:
            if pattern.match(stripped):
                return (2, stripped)

        return None

    def normalize_article_number(self, text: str) -> str:
        """
        Normalize article numbers (e.g., convert 'l0' to '10', handle typos).

        Args:
            text: The text containing the article number

        Returns:
            Normalized text
        """
        # Fix common OCR errors: lowercase 'l' instead of '1'
        text = re.sub(r"\bl([0-9])", r"1\1", text)
        text = re.sub(r"([0-9])l\b", r"\g<1>1", text)

        return text

    def format_heading(self, level: int, text: str) -> str:
        """
        Format a line as a Markdown heading.

        Args:
            level: Heading level (1-6)
            text: The heading text

        Returns:
            Formatted Markdown heading
        """
        # Normalize text
        text = self.normalize_article_number(text)

        # Remove trailing periods and colons from headings
        text = text.rstrip(".:")

        # Create heading with appropriate number of #
        heading_marks = "#" * level
        return f"{heading_marks} {text}"

    def should_merge_with_next(self, line: str, next_line: Optional[str]) -> bool:
        """
        Determine if a heading should be merged with the next line.

        Some headings span multiple lines in the original format.

        Args:
            line: Current line
            next_line: Next line

        Returns:
            True if lines should be merged
        """
        if not next_line:
            return False

        # If current line ends with a structural keyword and next line continues
        for pattern_info in self.HEADING_PATTERNS:
            if pattern_info.pattern.match(line.strip()):
                # Check if next line is all caps or starts with DE/DEL
                next_stripped = next_line.strip()
                if next_stripped and not self.detect_heading(next_stripped):
                    # If next line looks like a title continuation
                    if next_stripped.isupper() or any(
                        p.match(next_stripped) for p in self.SECTION_TITLE_PATTERNS
                    ):
                        return True

        return False

    def clean_text_line(self, line: str) -> str:
        """
        Clean a regular text line (non-heading).

        Args:
            line: The line to clean

        Returns:
            Cleaned line
        """
        # Normalize article numbers in text
        line = self.normalize_article_number(line)

        # Remove excessive whitespace
        line = " ".join(line.split())

        return line

    def parse(self, content: str) -> str:
        """
        Parse legal document content and convert to formatted Markdown.

        Args:
            content: Raw content of the legal document

        Returns:
            Formatted Markdown content
        """
        lines = content.split("\n")
        result = []

        in_frontmatter = False
        frontmatter_started = False
        i = 0

        while i < len(lines):
            line = lines[i]

            # Handle frontmatter
            if self.preserve_frontmatter:
                is_fm, in_fm_state = self.is_frontmatter_line(
                    line, in_frontmatter, frontmatter_started
                )
                if is_fm:
                    result.append(line)
                    in_frontmatter = in_fm_state
                    if not frontmatter_started:
                        frontmatter_started = True
                    i += 1
                    continue

            # Skip if still in frontmatter
            if in_frontmatter:
                result.append(line)
                i += 1
                continue

            # Check if this line is a heading
            heading_info = self.detect_heading(line)

            if heading_info:
                level, text = heading_info

                # Check if we should merge with next line
                if i + 1 < len(lines) and self.should_merge_with_next(
                    line, lines[i + 1]
                ):
                    text = f"{text} {lines[i + 1].strip()}"
                    i += 1  # Skip next line

                # Format and add the heading
                result.append(self.format_heading(level, text))
            else:
                # Regular line - clean and preserve
                cleaned = self.clean_text_line(line)
                if cleaned or not line.strip():  # Preserve empty lines
                    result.append(cleaned if cleaned else "")

            i += 1

        # Join lines and clean up excessive blank lines
        output = "\n".join(result)

        # Reduce multiple consecutive blank lines to maximum 2
        output = re.sub(r"\n{4,}", "\n\n\n", output)

        return output

    def parse_file(self, input_path: Path, output_path: Optional[Path] = None) -> None:
        """
        Parse a legal document file.

        Args:
            input_path: Path to input file
            output_path: Path to output file (defaults to input_path with .formatted.md)
        """
        if not input_path.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")

        # Read input
        with open(input_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse
        formatted_content = self.parse(content)

        # Determine output path
        if output_path is None:
            output_path = input_path.parent / f"{input_path.stem}.formatted.md"

        # Write output
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(formatted_content)

        print(f"✓ Parsed: {input_path}")
        print(f"  Output: {output_path}")

    def parse_directory(
        self,
        directory_path: Path,
        pattern: str = "*.md",
        output_suffix: str = ".formatted",
        recursive: bool = True,
    ) -> None:
        """
        Parse all matching files in a directory.

        Args:
            directory_path: Directory containing files to parse
            pattern: Glob pattern for files to process
            output_suffix: Suffix to add to output files (before .md)
            recursive: Whether to process subdirectories
        """
        if not directory_path.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")

        # Find matching files
        if recursive:
            files = list(directory_path.rglob(pattern))
        else:
            files = list(directory_path.glob(pattern))

        # Filter out already formatted files
        files = [f for f in files if output_suffix not in f.stem]

        print(f"Found {len(files)} files to process in {directory_path}")
        print()

        # Process each file
        for file_path in files:
            try:
                output_path = file_path.parent / f"{file_path.stem}{output_suffix}.md"
                self.parse_file(file_path, output_path)
            except Exception as e:
                print(f"✗ Error parsing {file_path}: {e}")

        print()
        print(f"Completed processing {len(files)} files")


def main():
    """Main entry point for CLI usage."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Parse and format Dominican Republic legal documents",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Parse a single file
  python legal_parser.py input.md output.md

  # Parse a single file (auto-generate output name)
  python legal_parser.py input.md

  # Parse all .md files in a directory
  python legal_parser.py --directory ./Leyes

  # Parse all .md files in a specific year
  python legal_parser.py --directory ./Leyes/2024
        """,
    )

    parser.add_argument("input_file", nargs="?", help="Input markdown file")
    parser.add_argument(
        "output_file", nargs="?", help="Output markdown file (optional)"
    )
    parser.add_argument("-d", "--directory", help="Process all .md files in directory")
    parser.add_argument(
        "-r",
        "--recursive",
        action="store_true",
        default=True,
        help="Process directories recursively (default: True)",
    )
    parser.add_argument(
        "--no-recursive",
        dest="recursive",
        action="store_false",
        help="Do not process directories recursively",
    )
    parser.add_argument(
        "--pattern", default="*.md", help="File pattern to match (default: *.md)"
    )
    parser.add_argument(
        "--suffix",
        default=".formatted",
        help="Suffix for output files (default: .formatted)",
    )
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="Modify files in-place (overwrite original)",
    )

    args = parser.parse_args()

    # Create parser instance
    legal_parser = LegalDocumentParser()

    try:
        if args.directory:
            # Directory mode
            dir_path = Path(args.directory)
            if args.in_place:
                # In-place mode: overwrite originals
                print("WARNING: In-place mode will overwrite original files!")
                response = input("Continue? (yes/no): ")
                if response.lower() != "yes":
                    print("Aborted.")
                    return

                if args.recursive:
                    files = list(dir_path.rglob(args.pattern))
                else:
                    files = list(dir_path.glob(args.pattern))

                for file_path in files:
                    content = file_path.read_text(encoding="utf-8")
                    formatted = legal_parser.parse(content)
                    file_path.write_text(formatted, encoding="utf-8")
                    print(f"✓ Updated: {file_path}")
            else:
                legal_parser.parse_directory(
                    dir_path,
                    pattern=args.pattern,
                    output_suffix=args.suffix,
                    recursive=args.recursive,
                )
        elif args.input_file:
            # Single file mode
            input_path = Path(args.input_file)
            output_path = Path(args.output_file) if args.output_file else None

            if args.in_place:
                output_path = input_path

            legal_parser.parse_file(input_path, output_path)
        else:
            parser.print_help()
            sys.exit(1)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
