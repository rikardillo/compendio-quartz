# REGEX Filters

The following list of regular expressions can be used to filter content inside the laws in order to make more efficient the cleaning process.

## Suggested editors

The suggested editors are:
- VS Code
- Obsidian

### VS Code

Has the most robust regex support out of the box.

## REGEX

### Filter PDF page Numbers

```regex
^\n-\s\d+\s+-\s\n
```

Replace with: **empty**


### Filter double newlines with space

Filter these first and then double newlines without any content to avoid missing any instances

```regex
^\n\s
```

Replace with: **empty**

### Filter double newlines

```regex
^\n
```

Replace with: **empty**
