# Legal Document Parser

A Python parser for Dominican Republic legal documents that converts unformatted Markdown files (extracted from PDFs) into properly structured documents with appropriate heading levels.

## Features

- 🏛️ **Legal Structure Recognition**: Automatically detects and formats:
  - Libro (Book) - H1
  - Título (Title) - H1
  - Capítulo (Chapter) - H2
  - Sección (Section) - H3
  - Artículo (Article) - H4
  - Parágrafo (Paragraph) - H5

- 🔧 **Smart Processing**:
  - Preserves YAML frontmatter
  - Handles OCR errors (e.g., `l0` → `10`)
  - Merges multi-line headings
  - Normalizes whitespace
  - Detects special legal patterns (Considerandos, etc.)

- 📁 **Flexible Usage**:
  - Process single files
  - Batch process entire directories
  - Recursive directory processing
  - In-place editing or create new files

## Installation

No external dependencies required! Just Python 3.7+

```bash
# Make the script executable (optional)
chmod +x legal_parser.py
```

## Usage

### Process a Single File

```bash
# Create a new formatted file
python legal_parser.py input.md output.md

# Auto-generate output filename (adds .formatted.md)
python legal_parser.py input.md

# Overwrite the original file
python legal_parser.py input.md --in-place
```

### Process Multiple Files

```bash
# Process all .md files in a directory (recursive by default)
python legal_parser.py --directory ../content/Leyes

# Process only files in a specific year
python legal_parser.py --directory ../content/Leyes/2024

# Non-recursive (only immediate directory)
python legal_parser.py --directory ../content/Leyes/2024 --no-recursive

# Custom output suffix
python legal_parser.py --directory ../content/Leyes --suffix .clean
```

### Advanced Options

```bash
# Process with custom file pattern
python legal_parser.py --directory ../content/Leyes --pattern "ley-*.md"

# In-place batch processing (CAUTION: overwrites originals)
python legal_parser.py --directory ../content/Leyes/2024 --in-place
```

## Examples

### Before Parsing

```compendio-quartz/quartz/parser/example_before.md#L1-30
EL CONGRESO NACIONAL 

En Nombre de la República 

Ley núm. 1-24 

Considerando primero: Que el artículo 261 de la Constitución...

CAPÍTULO I 

DEL OBJETO Y ÁMBITO DE APLICACIÓN 

Artículo 1.- Objeto. Esta ley tiene por objeto crear...

Artículo 2.- Ámbito de aplicación. Esta ley es de aplicación...

CAPÍTULO II 

DEL SISTEMA DE INTELIGENCIA 

Artículo 3.- Definición del sistema. El Sistema Nacional...
```

### After Parsing

```compendio-quartz/quartz/parser/example_after.md#L1-24
## EL CONGRESO NACIONAL

## En Nombre de la República

## Ley núm. 1-24

## Considerando primero: Que el artículo 261 de la Constitución...

## CAPÍTULO I DEL OBJETO Y ÁMBITO DE APLICACIÓN

#### Artículo 1.- Objeto

Esta ley tiene por objeto crear...

#### Artículo 2.- Ámbito de aplicación

Esta ley es de aplicación...

## CAPÍTULO II DEL SISTEMA DE INTELIGENCIA

#### Artículo 3.- Definición del sistema

El Sistema Nacional...
```

## Heading Hierarchy

The parser recognizes and formats the following legal document structure:

| Level | Element | Markdown | Example |
|-------|---------|----------|---------|
| H1 | Libro | `#` | `# LIBRO I` |
| H1 | Título | `#` | `# TÍTULO I DE LAS INVENCIONES` |
| H2 | Capítulo | `##` | `## CAPÍTULO I INVENCIONES` |
| H3 | Sección | `###` | `### SECCIÓN I PROTECCION` |
| H4 | Artículo | `####` | `#### Artículo 1. Definición` |
| H5 | Parágrafo | `#####` | `##### Parágrafo I` |

## Special Patterns

The parser also recognizes and formats these special legal patterns:

- **EL CONGRESO NACIONAL** → H2
- **En Nombre de la República** → H2  
- **HA DADO LA SIGUIENTE LEY** → H2
- **Considerandos** (primero, segundo, etc.) → H2

## OCR Error Corrections

Common OCR errors from PDF extraction are automatically corrected:

- `Artículo l0` → `Artículo 10`
- `Artículo 2l` → `Artículo 21`
- Multiple accented variations (`Artículo`, `Artìculo`, `Articulo`)
- Case variations (`CAPÍTULO`, `Capítulo`, `CAPITULO`)

## Use as a Python Module

You can also import and use the parser in your own scripts:

```python
from legal_parser import LegalDocumentParser
from pathlib import Path

# Create parser instance
parser = LegalDocumentParser()

# Parse a file
parser.parse_file(
    input_path=Path("input.md"),
    output_path=Path("output.md")
)

# Parse a directory
parser.parse_directory(
    directory_path=Path("../content/Leyes/2024"),
    output_suffix=".formatted",
    recursive=True
)

# Parse string content directly
content = "CAPÍTULO I\n\nArtículo 1.- Ejemplo..."
formatted = parser.parse(content)
print(formatted)
```

## Tips & Best Practices

1. **Test First**: Always test on a single file before batch processing
2. **Backup**: Keep backups before using `--in-place` mode
3. **Review Output**: The parser is smart but always review the output for edge cases
4. **Frontmatter**: YAML frontmatter is automatically preserved
5. **Customization**: Modify the `HEADING_PATTERNS` in the script for specific needs

## Troubleshooting

### Issue: Headings not detected

**Solution**: Check if the keyword is spelled correctly. The parser handles common variations but may miss unusual spellings. You can add custom patterns to `HEADING_PATTERNS`.

### Issue: Multi-line headings broken

**Solution**: The parser tries to merge headings that span multiple lines, but some edge cases might require manual review.

### Issue: Special characters garbled

**Solution**: Ensure your files are UTF-8 encoded. The parser reads and writes UTF-8 by default.

## Contributing

To add support for new patterns or improve detection:

1. Edit the `HEADING_PATTERNS` list in `legal_parser.py`
2. Add new regex patterns following the existing format
3. Test with sample documents

## License

This parser is part of the Compendio Quartz project.

## Support

For issues or questions, please check the main project documentation or create an issue in the repository.
