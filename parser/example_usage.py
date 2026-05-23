#!/usr/bin/env python3
"""
Example Usage of Legal Document Parser
======================================

This file demonstrates various ways to use the parser programmatically.
"""

from pathlib import Path

from legal_parser import LegalDocumentParser


def example_1_parse_single_file():
    """Example 1: Parse a single file and save to a new location."""
    print("Example 1: Parse a single file")
    print("-" * 50)

    parser = LegalDocumentParser()

    # Parse a file
    input_file = Path("../content/Leyes/2024/ley-001-24.md")
    output_file = Path("../content/Leyes/2024/ley-001-24.formatted.md")

    if input_file.exists():
        parser.parse_file(input_file, output_file)
        print(f"✓ File parsed successfully!")
    else:
        print(f"✗ File not found: {input_file}")

    print()


def example_2_parse_string():
    """Example 2: Parse a string of legal text directly."""
    print("Example 2: Parse string content")
    print("-" * 50)

    parser = LegalDocumentParser()

    # Sample legal text
    legal_text = """
CAPÍTULO I

DEL OBJETO

Artículo 1.- Objeto. Esta ley regula...

Artículo 2.- Ámbito. Se aplica en todo el territorio...
"""

    formatted = parser.parse(legal_text)
    print("Original:")
    print(legal_text)
    print("\nFormatted:")
    print(formatted)
    print()


def example_3_custom_processing():
    """Example 3: Process files with custom logic."""
    print("Example 3: Custom processing workflow")
    print("-" * 50)

    parser = LegalDocumentParser()

    # Find all laws from 2024
    laws_dir = Path("../content/Leyes/2024")

    if not laws_dir.exists():
        print(f"✗ Directory not found: {laws_dir}")
        return

    # Get all markdown files
    law_files = list(laws_dir.glob("ley-*.md"))

    # Filter out already formatted files
    law_files = [f for f in law_files if ".formatted" not in f.name]

    print(f"Found {len(law_files)} law files")

    # Process each file
    processed = 0
    for law_file in law_files[:3]:  # Just process first 3 as example
        try:
            output_file = law_file.parent / f"{law_file.stem}.formatted.md"
            parser.parse_file(law_file, output_file)
            processed += 1
        except Exception as e:
            print(f"✗ Error processing {law_file.name}: {e}")

    print(f"✓ Successfully processed {processed} files")
    print()


def example_4_batch_with_stats():
    """Example 4: Batch process and gather statistics."""
    print("Example 4: Batch processing with statistics")
    print("-" * 50)

    parser = LegalDocumentParser()

    laws_dir = Path("../content/Leyes/2024")

    if not laws_dir.exists():
        print(f"✗ Directory not found: {laws_dir}")
        return

    law_files = list(laws_dir.glob("ley-*.md"))
    law_files = [f for f in law_files if ".formatted" not in f.name]

    total_articles = 0
    total_chapters = 0
    total_titles = 0

    for law_file in law_files[:5]:  # Process first 5 as example
        try:
            content = law_file.read_text(encoding="utf-8")
            formatted = parser.parse(content)

            # Count headings
            lines = formatted.split("\n")
            total_titles += sum(
                1
                for line in lines
                if line.startswith("# ") and not line.startswith("## ")
            )
            total_chapters += sum(
                1
                for line in lines
                if line.startswith("## ") and not line.startswith("### ")
            )
            total_articles += sum(1 for line in lines if line.startswith("#### "))

        except Exception as e:
            print(f"✗ Error: {e}")

    print(f"Statistics for {len(law_files[:5])} laws:")
    print(f"  - Total Títulos: {total_titles}")
    print(f"  - Total Capítulos: {total_chapters}")
    print(f"  - Total Artículos: {total_articles}")
    print()


def example_5_conditional_formatting():
    """Example 5: Apply formatting only if certain conditions are met."""
    print("Example 5: Conditional formatting")
    print("-" * 50)

    parser = LegalDocumentParser()

    # Sample text that we'll only format if it contains certain keywords
    sample_text = """
Artículo 1.- Ejemplo.

CAPÍTULO I

DEL OBJETO
"""

    # Check if text contains "Artículo" before processing
    if "Artículo" in sample_text or "CAPÍTULO" in sample_text:
        formatted = parser.parse(sample_text)
        print("✓ Text contains legal keywords, formatting applied:")
        print(formatted)
    else:
        print("✗ Text does not contain legal keywords, skipping formatting")

    print()


def main():
    """Run all examples."""
    print("=" * 60)
    print("LEGAL PARSER - USAGE EXAMPLES")
    print("=" * 60)
    print()

    # Run examples
    # example_1_parse_single_file()  # Uncomment to run
    example_2_parse_string()
    # example_3_custom_processing()  # Uncomment to run
    # example_4_batch_with_stats()   # Uncomment to run
    example_5_conditional_formatting()

    print("=" * 60)
    print("For more examples, see README.md")
    print("=" * 60)


if __name__ == "__main__":
    main()
