# Edlin - Line Editing Extension for VSCode

A powerful VSCode extension for line-based text manipulation. Provides efficient tools for trimming, combining, splitting, indexing, and wrapping text selections.

![feature](https://github.com/FFengIll/vscode-edlin/blob/master/feature.png?raw=true)

## Features

### Core Operations
- **Trim**: Remove whitespace from both sides, left, or right of lines
- **Split**: Split lines using selected text as delimiter (keep or remove delimiter)
- **Combine**: Join multiple lines together (with custom separator)
- **Index**: Add numbered prefixes to lines (start from custom number)
- **Wrap**: Wrap lines using templates with `$1` placeholder
- **Remove Blank Lines**: Clean up empty lines from selections

### Cross-Platform Support
- Automatically handles different line endings: `\r\n` (Windows), `\n` (Unix), `\r` (Mac)
- Works seamlessly across all operating systems

## Usage

1. **Select text** in your editor
2. **Right-click** and choose an Edlin command from the context menu
3. **Or use Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for "Edlin"

### Quick Examples

**Wrap with template:**
```
Selected: hello, world
Template: console.log($1)
Result:
console.log(hello)
console.log(world)
```

**Combine lines:**
```
Selected:
hello
world
Separator: ", "
Result: hello, world
```

**Index lines:**
```
Selected:
item one
item two
Result:
1. item one
2. item two
```

## Requirements

- Visual Studio Code 1.74.0 or higher

## Installation

1. Open VSCode Extensions (`Ctrl+Shift+X`)
2. Search for "edlin"
3. Click Install

Or install from [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=FFengIll.edlin)

## Development

```bash
# Install dependencies
pnpm install

# Compile TypeScript
pnpm run compile

# Run tests
pnpm test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Inspired by the classic MS-DOS EDLIN editor
- Thanks to [上位者的怜悯](http://www.cnblogs.com/lianmin/p/5499266.html)

If you find this extension helpful, please ⭐ star the repository!
