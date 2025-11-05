# Change Log

All notable changes to the "edlin" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-05

### Added
- **Major Code Refactor**: Complete modernization of the codebase
- **Performance Tracking**: Added performance monitoring and metrics
- **Enhanced Error Handling**: Comprehensive validation and user-friendly error messages
- **Input Validation**: Real-time validation for all user inputs
- **Operation Feedback**: Success messages showing operation counts and details
- **Type Safety**: Strict TypeScript configuration for better reliability

### Changed
- **Modern TypeScript**: Upgraded from ES6 to ES2020 target with strict mode
- **Updated Dependencies**: Modern versions of TypeScript and VSCode APIs
- **Improved UI**: Better placeholders, validation messages, and user feedback
- **Optimized Performance**: Memoization for frequently called functions
- **Code Organization**: Better separation of concerns and cleaner architecture
- **Error Messages**: More descriptive and actionable error feedback

### Fixed
- **Memory Leaks**: Fixed potential memory issues with proper cleanup
- **Edge Cases**: Better handling of empty selections and invalid inputs
- **Performance**: Optimized newline detection algorithm
- **Type Safety**: Fixed various TypeScript type issues

### Technical Improvements
- Added comprehensive error handling with custom error types
- Implemented performance tracking with decorators
- Added memoization for utility functions
- Enhanced input validation with real-time feedback
- Improved code documentation and comments
- Added debounced operations to prevent UI blocking


## [0.5.0] - 2024-XX-XX

### Added
- **Wrap Feature**: Add wrap command using template with `$1` placeholder
- **Template System**: Support for custom wrap templates (e.g., `console.log($1)`, `alert($1)`)

## [0.4.0] - 2023-XX-XX

### Added
- **Index From**: Start indexing from a custom number
- **Combine With**: Join lines using a custom separator
- **Wrap Feature**: Wrap lines using templates with `$1` placeholder

### Changed
- Improved command organization and categories
- Better user input handling for custom parameters

## [0.3.0] - 2023-XX-XX

### Added
- **Basic Index**: Add numbered prefixes to lines
- **Command Categories**: Organized commands under "Edlin" category
- **Better Menu Integration**: Improved context menu organization

## [0.2.0] - 2023-XX-XX

### Added
- **Cross-Platform Support**: Automatic handling of Windows (\r\n), Unix (\n), and Mac (\r) line endings
- **Improved Trim Functions**: Better handling of different whitespace characters

### Fixed
- **MacOS Compatibility**: Fixed trim function not working with '\r' line endings
- **Line Ending Detection**: Better detection and handling of different newline formats

## [0.1.0] - 2017-09-01

### Fixed
- **MacOS Trim Issue**: Fixed trim function not working under MacOS for '\r' characters

## [0.0.6] - 2017-04-27

### Fixed
- **Plugin Grouping**: Organized commands into specific groups in the context menu

### Added
- **Combine Lines**: Added functionality to combine multiple lines into one line

## [0.0.3] - 2017-03-31

### Fixed
- **Blank Line Removal**: Fixed issue with removing blank lines in files using LF (\n) instead of CRLF (\r\n)

### Changed
- **Default Separator**: Now uses default tab separator (\t) when no delimiter is selected

## [0.0.2] - 2017-03-29

### Changed
- **Command Naming**: Updated trim command names from "*trim" to "Trim *" for better clarity

## [0.0.1] - 2017-03-29

### Added
- **Trim Commands**: Commands to remove whitespace from head or tail (left or right) of selected lines
- **Remove Blank Lines**: Command to remove empty lines from selection
- **Context Menu Integration**: All commands available in the right-click context menu

## [0.0.0] - 2017-03-28

### Added
- **Initial Release**: Basic functionality for line editing operations