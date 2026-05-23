# Legal Document Parser - Documentation Index

Welcome to the Legal Document Parser for Dominican Republic laws! This tool helps you convert unformatted legal documents into properly structured Markdown with correct heading hierarchies.

## 🎯 Start Here

Choose your path based on your needs:

### 🚀 Quick Start (5 minutes)
**→ [QUICKSTART.md](QUICKSTART.md)**
- Get up and running immediately
- Test the parser
- Process your first file

### 📖 Complete Guide
**→ [README.md](README.md)**
- Full documentation
- All features explained
- Troubleshooting guide
- Advanced usage

### 🗺️ Overview
**→ [OVERVIEW.md](OVERVIEW.md)**
- What is this parser?
- Architecture and design
- Use cases and benefits
- Best practices

### 💻 Code Examples
**→ [example_usage.py](example_usage.py)**
- Python library usage
- Integration examples
- Custom workflows

## 📂 All Files

| File | Purpose | Who Should Read |
|------|---------|-----------------|
| **QUICKSTART.md** | Get started fast | Everyone (start here!) |
| **README.md** | Complete documentation | Users needing details |
| **OVERVIEW.md** | Big picture view | Decision makers, architects |
| **legal_parser.py** | Main parser script | Everyone (this is the tool) |
| **test_parser.py** | Test examples | Everyone (run this first) |
| **example_usage.py** | Library usage | Developers |
| **requirements.txt** | Dependencies | System admins |
| **INDEX.md** | This file | Starting point |

## 🎓 Learning Path

### Level 1: Beginner
1. Read this INDEX.md (you are here!)
2. Read [QUICKSTART.md](QUICKSTART.md)
3. Run: `python3 test_parser.py`
4. Try: `python3 legal_parser.py your-file.md`

### Level 2: Regular User
1. Complete Level 1
2. Read [README.md](README.md)
3. Try batch processing: `python3 legal_parser.py --directory ../content/Leyes/2024`
4. Review output and iterate

### Level 3: Power User
1. Complete Levels 1-2
2. Read [OVERVIEW.md](OVERVIEW.md)
3. Study [example_usage.py](example_usage.py)
4. Customize patterns in `legal_parser.py`

### Level 4: Developer
1. Complete Levels 1-3
2. Read `legal_parser.py` source code
3. Build custom integrations
4. Extend functionality

## 🛠️ Common Tasks

### Task: Format a single law file
```bash
python3 legal_parser.py ../content/Leyes/2024/ley-001-24.md
```
📚 **Learn more**: [QUICKSTART.md](QUICKSTART.md) → "Try It on a Single File"

### Task: Format all laws in a directory
```bash
python3 legal_parser.py --directory ../content/Leyes/2024
```
📚 **Learn more**: [QUICKSTART.md](QUICKSTART.md) → "Batch Process"

### Task: Use parser in Python script
```python
from legal_parser import LegalDocumentParser
parser = LegalDocumentParser()
parser.parse_file("input.md", "output.md")
```
📚 **Learn more**: [example_usage.py](example_usage.py)

### Task: Add custom legal patterns
Edit `legal_parser.py` around line 50
📚 **Learn more**: [README.md](README.md) → "Contributing"

### Task: Fix specific OCR errors
Edit `normalize_article_number()` in `legal_parser.py`
📚 **Learn more**: [README.md](README.md) → "OCR Error Corrections"

## 📊 What Gets Formatted

The parser recognizes and formats:

- **Libro** (Book) → H1 `#`
- **Título** (Title) → H1 `#`
- **Capítulo** (Chapter) → H2 `##`
- **Sección** (Section) → H3 `###`
- **Artículo** (Article) → H4 `####`
- **Parágrafo** (Paragraph) → H5 `#####`

Plus special patterns:
- "EL CONGRESO NACIONAL"
- "En Nombre de la República"
- "Considerandos"
- "HA DADO LA SIGUIENTE LEY"

## 🎯 Typical Workflow

```
┌─────────────────────┐
│ 1. Extract from PDF │
│    (unformatted.md) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Run test_parser  │
│    (verify it works)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Process 1 file   │
│    (check output)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Batch process    │
│    (all files)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. Review & iterate │
│    (adjust as needed)│
└─────────────────────┘
```

## 🚦 Quick Reference

### Command Line Options

```bash
# Basic usage
python3 legal_parser.py input.md [output.md]

# Directory processing
python3 legal_parser.py --directory <path>

# Options
--recursive          # Process subdirectories (default)
--no-recursive       # Don't process subdirectories
--pattern "*.md"     # File pattern to match
--suffix ".formatted"# Output file suffix
--in-place          # Overwrite originals (careful!)
```

### Python API

```python
from legal_parser import LegalDocumentParser

parser = LegalDocumentParser()

# Parse file
parser.parse_file(input_path, output_path)

# Parse directory
parser.parse_directory(dir_path, recursive=True)

# Parse string
formatted = parser.parse(content_string)
```

## 🆘 Need Help?

### Issue: Not sure where to start
**→** Read [QUICKSTART.md](QUICKSTART.md)

### Issue: Parser not detecting patterns
**→** See [README.md](README.md) → "Troubleshooting"

### Issue: Want to customize behavior
**→** See [README.md](README.md) → "Contributing"

### Issue: Need code examples
**→** Run [example_usage.py](example_usage.py)

### Issue: Understanding architecture
**→** Read [OVERVIEW.md](OVERVIEW.md)

## 📈 Success Checklist

After using the parser, you should have:

- ✅ Consistent heading hierarchy across all documents
- ✅ Proper Markdown formatting
- ✅ Fixed OCR errors (e.g., `l0` → `10`)
- ✅ Preserved legal content integrity
- ✅ Time saved on manual formatting
- ✅ Professional-looking law documents

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| [QUICKSTART.md](QUICKSTART.md) | Start here - 5 min guide |
| [README.md](README.md) | Full documentation |
| [OVERVIEW.md](OVERVIEW.md) | Architecture & design |
| [test_parser.py](test_parser.py) | Run this first |
| [example_usage.py](example_usage.py) | Code examples |
| [legal_parser.py](legal_parser.py) | The tool itself |

## 📝 Summary

This parser helps you:
1. **Save time**: Hours → minutes
2. **Ensure consistency**: Uniform formatting
3. **Fix errors**: OCR corrections
4. **Maintain quality**: Legal content preserved
5. **Scale easily**: Process hundreds of files

**Ready?** → Go to [QUICKSTART.md](QUICKSTART.md) now!

---

*Last updated: May 2024*
*Part of the Compendio Quartz project*
