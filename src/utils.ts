import { memoize } from './performance';

export enum Side {
    LEFT = 'left',
    RIGHT = 'right',
    BOTH = 'both'
}

const NEWLINE_CANDIDATES = ['\r\n', '\n', '\r'] as const;
const DEFAULT_INDEX_SEPARATOR = '.';

type NewLineType = typeof NEWLINE_CANDIDATES[number];

/**
 * Detects the newline character type used in the given text
 * @param text - The text to analyze for newline characters
 * @returns The detected newline character sequence
 */
export const getNewLine = memoize(function(text: string): NewLineType {
    // Optimize: Check for most common newlines first
    if (text.includes('\n')) {
        return text.includes('\r\n') ? '\r\n' : '\n';
    }

    // Check for remaining options
    if (text.includes('\r')) {
        return '\r';
    }

    return '\n'; // Default to Unix newline if none found
});

/**
 * Splits text into lines using the detected newline character
 * @param text - The text to split
 * @returns Array of lines
 */
export function splitLines(text: string): string[] {
    const newline = getNewLine(text);
    return text.split(newline);
}

/**
 * Joins lines of text using the specified newline character
 * @param lines - Array of lines to join
 * @param newline - The newline character to use
 * @returns Joined text
 */
export function joinLines(lines: string[], newline: NewLineType): string {
    return lines.join(newline);
}

/**
 * Trims whitespace from the specified side of a string
 * @param str - The string to trim
 * @param side - Which side to trim from
 * @returns The trimmed string
 */
function trimSide(str: string, side: Side): string {
    switch (side) {
        case Side.LEFT:
            return str.replace(/^\s+/g, '');
        case Side.RIGHT:
            return str.replace(/\s+$/g, '');
        case Side.BOTH:
            return str.trim();
        default:
            return str;
    }
}

/**
 * Adds numeric indexing to lines
 * @param text - The text to index
 * @param startIndex - Starting number for indexing
 * @param separator - Separator between number and content
 * @returns Text with indexed lines
 */
export function do_index(
    text: string,
    startIndex: number | string = 1,
    separator: string = DEFAULT_INDEX_SEPARATOR
): string {
    const start = typeof startIndex === 'string' ? parseInt(startIndex, 10) : startIndex;
    if (isNaN(start)) {
        throw new Error('Invalid start index: must be a number');
    }

    const lines = splitLines(text);
    const indexedLines = lines.map((line, index) => {
        const lineNumber = start + index;
        return `${lineNumber}${separator} ${line}`;
    });

    return joinLines(indexedLines, getNewLine(text));
}

/**
 * Splits text by a delimiter with optional delimiter preservation
 * @param text - The text to split
 * @param delimiter - The delimiter to split by
 * @param keepDelimiter - Whether to keep the delimiter in the result
 * @returns The split text
 */
export function do_split(text: string, delimiter: string, keepDelimiter: boolean = false): string {
    if (!delimiter) {
        return text;
    }

    const lines = text.split(delimiter);
    const newline = getNewLine(text);

    return keepDelimiter
        ? lines.join(delimiter + newline)
        : joinLines(lines, newline);
}

/**
 * Combines lines using a specified join string
 * @param text - The text containing lines to combine
 * @param joinString - The string to join lines with
 * @returns The combined text
 */
export function do_combine(text: string, joinString: string = ''): string {
    const lines = splitLines(text);
    return lines.join(joinString);
}

/**
 * Removes blank lines from text
 * @param text - The text to process
 * @param preserveOneEmpty - Whether to preserve one empty line between paragraphs
 * @returns Text with blank lines removed
 */
export function do_remove(text: string, preserveOneEmpty: boolean = false): string {
    const lines = splitLines(text);
    const filteredLines = lines.filter((line, index, array) => {
        const isBlank = line.trim().length === 0;

        if (!isBlank) return true;

        if (preserveOneEmpty && index > 0 && index < array.length - 1) {
            const prevLine = array[index - 1];
            const nextLine = array[index + 1];
            return prevLine.trim().length > 0 && nextLine.trim().length > 0;
        }

        return false;
    });

    return joinLines(filteredLines, getNewLine(text));
}

/**
 * Trims whitespace from lines based on the specified side
 * @param text - The text to trim
 * @param side - Which side(s) to trim
 * @returns The trimmed text
 */
export function do_trim(text: string, side: Side): string {
    const lines = splitLines(text);
    const trimmedLines = lines.map(line => trimSide(line, side));
    return joinLines(trimmedLines, getNewLine(text));
}

// Legacy exports for backward compatibility
export { splitLines as do_split_line };
export { joinLines as do_combine_line };