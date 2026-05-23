# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Test the Parser

First, run the test script to see how it works:

```bash
cd compendio-quartz/quartz/parser
python test_parser.py
```

This will show you a before/after example of how the parser formats legal documents.

### 2. Try It on a Single File

Process one of your law files to see the results:

```bash
# From the parser directory
python legal_parser.py ../content/Leyes/2024/ley-001-24.md

# This creates: ley-001-24.formatted.md
```

### 3. Batch Process (When Ready)

Once you're happy with the results, process an entire directory:

```bash
# Process all 2024 laws
python legal_parser.py --directory ../content/Leyes/2024

# Or process everything
python legal_parser.py --directory ../content/Leyes
```

## 📋 Common Commands

```bash
# Single file with custom output
python legal_parser.py input.md output.md

# Auto-generate output name
python legal_parser.py input.md

# Process directory (creates .formatted.md files)
python legal_parser.py --directory ../content/Leyes/2024

# In-place editing (OVERWRITES originals - use with caution!)
python legal_parser.py input.md --in-place
```

## ✅ What Gets Formatted

| Original | Becomes | Level |
|----------|---------|-------|
| `TÍTULO I` | `# TÍTULO I` | H1 |
| `CAPÍTULO I` | `## CAPÍTULO I` | H2 |
| `SECCIÓN I` | `### SECCIÓN I` | H3 |
| `Artículo 1.-` | `#### Artículo 1.-` | H4 |
| `Parágrafo.` | `##### Parágrafo.` | H5 |

## 🔍 What Gets Fixed

- **OCR Errors**: `Artículo l0` → `Artículo 10`
- **Whitespace**: Multiple spaces reduced to single
- **Multi-line headings**: Automatically merged
- **Frontmatter**: YAML preserved intact

## 💡 Tips

1. **Always test first** - Try one file before batch processing
2. **Review the output** - The parser is smart but not perfect
3. **Keep backups** - Especially before using `--in-place`
4. **Check the logs** - The parser will tell you what it processed

## 🆘 Need Help?

See the full [README.md](README.md) for:
- Detailed documentation
- Troubleshooting guide
- Python module usage
- Advanced options

## 🎯 Typical Workflow

```bash
# 1. Test with one file
python legal_parser.py ../content/Leyes/2024/ley-001-24.md

# 2. Check the output
cat ../content/Leyes/2024/ley-001-24.formatted.md

# 3. If good, process the whole directory
python legal_parser.py --directory ../content/Leyes/2024

# 4. Review a few more files
# 5. If all looks good, replace originals:
#    mv *.formatted.md *.md (or use --in-place from the start)
```

## ⚙️ Customization

To modify what patterns are detected, edit `legal_parser.py`:

```python
# Around line 50
HEADING_PATTERNS = [
    # Add your custom patterns here
]
```

See the main README for pattern syntax and examples.
