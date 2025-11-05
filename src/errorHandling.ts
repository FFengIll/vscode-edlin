import * as vscode from 'vscode';

export class EdlinError extends Error {
    constructor(message: string, public readonly code?: string) {
        super(message);
        this.name = 'EdlinError';
    }
}

export class ValidationError extends EdlinError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}

export class EditorError extends EdlinError {
    constructor(message: string) {
        super(message, 'EDITOR_ERROR');
        this.name = 'EditorError';
    }
}

/**
 * Shows an error message to the user
 * @param message - The error message to display
 * @param error - Optional error object for logging
 */
export function showError(message: string, error?: Error): void {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    vscode.window.showErrorMessage(errorMessage);

    if (error) {
        console.error(`[Edlin] ${message}`, error);
    }
}

/**
 * Shows a warning message to the user
 * @param message - The warning message to display
 */
export function showWarning(message: string): void {
    vscode.window.showWarningMessage(message);
    console.warn(`[Edlin] ${message}`);
}

/**
 * Shows an informational message to the user
 * @param message - The info message to display
 */
export function showInfo(message: string): void {
    vscode.window.showInformationMessage(message);
    console.log(`[Edlin] ${message}`);
}

/**
 * Executes a function with error handling
 * @param operation - The operation to execute
 * @param errorMessage - Custom error message to show on failure
 * @returns Promise that resolves to the operation result or undefined on error
 */
export async function safeExecute<T>(
    operation: () => T | Promise<T>,
    errorMessage: string = 'Operation failed'
): Promise<T | undefined> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof ValidationError) {
            showError(error.message, error);
        } else if (error instanceof EditorError) {
            showError(error.message, error);
        } else if (error instanceof Error) {
            showError(errorMessage, error);
        } else {
            showError(`${errorMessage}: ${String(error)}`);
        }
        return undefined;
    }
}

/**
 * Validates that there's an active text editor
 * @param editor - The editor to validate
 * @throws EditorError if no editor is available
 */
export function validateEditor(editor?: vscode.TextEditor): vscode.TextEditor {
    if (!editor) {
        throw new EditorError('No active text editor found');
    }
    return editor;
}

/**
 * Validates that the editor has a selection
 * @param editor - The editor to check
 * @param requireNonEmpty - Whether the selection must be non-empty
 * @throws ValidationError if selection requirements aren't met
 */
export function validateSelection(
    editor: vscode.TextEditor,
    requireNonEmpty: boolean = false
): vscode.Selection[] {
    if (requireNonEmpty && editor.selections.every(sel => sel.isEmpty)) {
        throw new ValidationError('Please select some text first');
    }
    return [...editor.selections];
}

/**
 * Validates that a string is not empty or just whitespace
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @throws ValidationError if the value is invalid
 */
export function validateNonEmpty(value: string, fieldName: string): string {
    if (!value || value.trim().length === 0) {
        throw new ValidationError(`${fieldName} cannot be empty`);
    }
    return value;
}

/**
 * Validates that a string represents a valid number
 * @param value - The string to validate
 * @param fieldName - The name of the field for error messages
 * @param min - Optional minimum value
 * @param max - Optional maximum value
 * @throws ValidationError if the value is not a valid number
 */
export function validateNumber(
    value: string,
    fieldName: string,
    min?: number,
    max?: number
): number {
    const num = parseInt(value, 10);

    if (isNaN(num)) {
        throw new ValidationError(`${fieldName} must be a valid number`);
    }

    if (min !== undefined && num < min) {
        throw new ValidationError(`${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
        throw new ValidationError(`${fieldName} must be at most ${max}`);
    }

    return num;
}

/**
 * Creates a safe input box with validation
 * @param options - Input box options
 * @param validator - Optional validation function
 * @returns Promise that resolves to the input value or undefined if cancelled
 */
export async function showValidatedInputBox(
    options: vscode.InputBoxOptions,
    validator?: (value: string) => string | null
): Promise<string | undefined> {
    const validatedOptions: vscode.InputBoxOptions = {
        ...options,
        validateInput: validator || options.validateInput
    };

    return await vscode.window.showInputBox(validatedOptions);
}