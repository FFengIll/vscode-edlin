import * as vscode from 'vscode';
import * as utils from './utils';
import {
    EdlinError,
    ValidationError,
    EditorError,
    showError,
    showWarning,
    showInfo,
    safeExecute,
    validateEditor,
    validateSelection,
    validateNonEmpty,
    validateNumber,
    showValidatedInputBox
} from './errorHandling';
import { performanceTracker, trackPerformance } from './performance';

const COMMAND_PREFIX = 'edlin';

type CommandHandler = () => void | Promise<void>;

class EdlinExtension {
    private readonly context: vscode.ExtensionContext;
    private readonly commands: Map<string, CommandHandler> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeCommands();
        this.registerCommands();
    }

    private initializeCommands(): void {
        this.commands.set('wrap', () => safeExecute(this.handleWrap.bind(this), 'Failed to wrap lines'));
        this.commands.set('index', () => safeExecute(this.handleIndex.bind(this), 'Failed to index lines'));
        this.commands.set('indexFrom', () => safeExecute(this.handleIndexFrom.bind(this), 'Failed to index lines from custom start'));
        this.commands.set('trim', () => safeExecute(() => this.handleTrim(utils.Side.BOTH), 'Failed to trim lines'));
        this.commands.set('ltrim', () => safeExecute(() => this.handleTrim(utils.Side.LEFT), 'Failed to trim left side'));
        this.commands.set('rtrim', () => safeExecute(() => this.handleTrim(utils.Side.RIGHT), 'Failed to trim right side'));
        this.commands.set('removeBlankLine', () => safeExecute(this.handleRemoveBlankLines.bind(this), 'Failed to remove blank lines'));
        this.commands.set('split', () => safeExecute(() => this.handleSplit(false), 'Failed to split lines'));
        this.commands.set('splitAndKeep', () => safeExecute(() => this.handleSplit(true), 'Failed to split lines (keep delimiter)'));
        this.commands.set('combine', () => safeExecute(this.handleCombine.bind(this), 'Failed to combine lines'));
        this.commands.set('combineWith', () => safeExecute(this.handleCombineWith.bind(this), 'Failed to combine lines with custom separator'));
    }

    private registerCommands(): void {
        for (const [commandName, handler] of this.commands) {
            const fullName = `${COMMAND_PREFIX}.${commandName}`;
            const disposable = vscode.commands.registerCommand(fullName, handler);
            this.context.subscriptions.push(disposable);
        }
    }

    private getActiveEditor(): vscode.TextEditor | undefined {
        return vscode.window.activeTextEditor;
    }

    @trackPerformance('wrap')
    private async handleWrap(): Promise<void> {
        const editor = validateEditor(this.getActiveEditor());
        validateSelection(editor, true);

        const wrapTemplate = await showValidatedInputBox({
            prompt: 'Input the wrapper template',
            placeHolder: 'Example: console.log($1)',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'Template cannot be empty';
                }
                if (!value.includes('$1')) {
                    return 'Warning: Template without "$1" will replace selected text!';
                }
                return null;
            }
        });

        if (!wrapTemplate) return;

        const selections = editor.selections;
        await editor.edit((editBuilder) => {
            for (const selection of selections) {
                const text = editor.document.getText(selection);
                const processedText = this.wrapLines(text, wrapTemplate);
                editBuilder.replace(selection, processedText);
            }
        });

        showInfo(`Wrapped ${selections.length} selection(s)`);
    }

    private wrapLines(text: string, template: string): string {
        const newLine = utils.getNewLine(text);
        const lines = utils.do_split_line(text);
        const wrappedLines = lines.map(line => template.replace('$1', line));
        return utils.do_combine_line(wrappedLines, newLine);
    }

    private async handleIndexFrom(): Promise<void> {
        const editor = validateEditor(this.getActiveEditor());
        validateSelection(editor, true);

        const startIndexStr = await showValidatedInputBox({
            prompt: 'Enter starting index number',
            placeHolder: '1',
            validateInput: (value: string) => {
                try {
                    validateNumber(value, 'Start index', 0);
                    return null;
                } catch (error) {
                    return error instanceof Error ? error.message : 'Invalid input';
                }
            }
        });

        if (!startIndexStr) return;

        const startIndex = parseInt(startIndexStr, 10);
        this.indexLines(startIndex);
    }

    private handleIndex(): void {
        const editor = validateEditor(this.getActiveEditor());
        validateSelection(editor, true);
        this.indexLines(1);
    }

    private indexLines(startIndex: number): void {
        const editor = validateEditor(this.getActiveEditor());
        const selections = validateSelection(editor, true);

        editor.edit((editBuilder) => {
            for (const selection of selections) {
                const start = new vscode.Position(selection.start.line, 0);
                const end = new vscode.Position(selection.end.line, selection.end.character);
                const range = new vscode.Range(start, end);
                const text = editor.document.getText(range);
                const indexedText = utils.do_index(text, startIndex);
                editBuilder.replace(range, indexedText);
            }
        });

        showInfo(`Indexed ${selections.length} selection(s) starting from ${startIndex}`);
    }

    @trackPerformance('trim')
    private handleTrim(side: utils.Side): void {
        const editor = validateEditor(this.getActiveEditor());
        const selections = validateSelection(editor, true);

        editor.edit((editBuilder) => {
            for (const selection of selections) {
                const text = editor.document.getText(selection);
                const trimmedText = utils.do_trim(text, side);
                editBuilder.replace(selection, trimmedText);
            }
        });

        showInfo(`Trimmed ${selections.length} selection(s) (${side})`);
    }

    private handleRemoveBlankLines(): void {
        const editor = validateEditor(this.getActiveEditor());
        const selections = validateSelection(editor, true);

        editor.edit((editBuilder) => {
            for (const selection of selections) {
                const text = editor.document.getText(selection);
                const processedText = utils.do_remove(text);
                editBuilder.replace(selection, processedText);
            }
        });

        showInfo(`Removed blank lines from ${selections.length} selection(s)`);
    }

    private handleSplit(keepDelimiter: boolean): void {
        const editor = validateEditor(this.getActiveEditor());
        const selections = validateSelection(editor, true);

        const nonEmptySelections = selections.filter(selection => !selection.isEmpty);
        if (nonEmptySelections.length === 0) {
            throw new ValidationError('Please select some text to use as a delimiter');
        }

        editor.edit((editBuilder) => {
            for (const selection of nonEmptySelections) {
                const delimiter = editor.document.getText(selection);
                const line = editor.document.lineAt(selection.start);
                const processedText = utils.do_split(line.text, delimiter, keepDelimiter);
                editBuilder.replace(line.range, processedText);
            }
        });

        showInfo(`Split ${nonEmptySelections.length} line(s) ${keepDelimiter ? '(keeping delimiter)' : ''}`);
    }

    private handleCombine(): void {
        this.combineLines('');
    }

    private async handleCombineWith(): Promise<void> {
        const editor = validateEditor(this.getActiveEditor());
        validateSelection(editor, true);

        const joinString = await showValidatedInputBox({
            prompt: 'Enter string to join lines with',
            placeHolder: ' '
        });

        if (joinString === null) return;
        this.combineLines(joinString);
    }

    @trackPerformance('combine')
    private combineLines(joinString: string): void {
        const editor = validateEditor(this.getActiveEditor());
        const selections = validateSelection(editor, true);

        editor.edit((editBuilder) => {
            for (const selection of selections) {
                const text = editor.document.getText(selection);
                const combinedText = utils.do_combine(text, joinString);
                editBuilder.replace(selection, combinedText);
            }
        });

        showInfo(`Combined ${selections.length} selection(s) with separator: "${joinString || '(empty)'}"`);
    }
}

export function activate(context: vscode.ExtensionContext): void {
    console.log('Edlin extension is now active!');
    new EdlinExtension(context);
}

export function deactivate(): void {
    // Cleanup if needed
}