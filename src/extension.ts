'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as utils from './utils';

// constance
const NAME = 'blankLine';
const COMMAND = 'process';
const CONTEXT_SAVE = 'save';
const CONTEXT_COMMAND = 'command';

// configuration definition
interface ExtensionConfig {
    keepOneEmptyLine?: boolean;
    triggerOnSave?: boolean;
    insertLineAfterBlock?: boolean;
    languageIds?: string[];
}

// default configuration
let config: ExtensionConfig = {
    keepOneEmptyLine: true,
    triggerOnSave: true,
    insertLineAfterBlock: true,
    languageIds: ['javascript', 'typescript', 'json']
};

//default use the tab as splitor
const DEFAULT_SPLITOR = '\t';
let splitor = DEFAULT_SPLITOR;

function getSplitor() {
    // get active text editor
    var editor = vscode.window.activeTextEditor;

    var selection = editor.selection;
    splitor = editor.document.getText(selection);
    /*
    //if no splitor given, use default
    if (splitor.length <= 0) {
        splitor = DEFAULT_SPLITOR;
    }
    */

    return splitor;
}


function index(event) {
    // get active text editor
    var editor = vscode.window.activeTextEditor;

    // do nothing if 'doAction' was triggered by save and 'removeOnSave' is set to false
    if (event === CONTEXT_SAVE && config.triggerOnSave !== true) return;

    // do nothing if no open text editor
    if (!editor) return;

    //get selection
    var doc = editor.document;
    var selections = editor.selections;
    selections.forEach(selection => {
        var start = new vscode.Position(selection.start.line, 0);
        var end = new vscode.Position(selection.end.line, selection.end.character);
        var select = editor.document.getText(new vscode.Range(start, end));

        var res = utils.do_index(select);

        //replace in edit
        editor.edit((edit) => {
            edit.replace(selection, res);

        });
    });
}

function split(event, keep = false) {

    // get active text editor
    var editor = vscode.window.activeTextEditor;

    // do nothing if 'doAction' was triggered by save and 'removeOnSave' is set to false
    if (event === CONTEXT_SAVE && config.triggerOnSave !== true) return;

    // do nothing if no open text editor
    if (!editor) return;

    //get selection
	var splitor = getSplitor();
    var doc = editor.document;
    var selections = editor.selections;
    selections.forEach(selection => {
        //get selection info of the cursor
        var start = selection.start;

        //get line text (*note* the select is splitor only but we wanna split line)
        var vsline = doc.lineAt(start);

        var res = utils.do_split(vsline.text, splitor, keep);

        //replace in edit
        editor.edit((edit) => {
            edit.replace(vsline.range, res);

        });
    });
}

function combine(event) {

    // get active text editor
    var editor = vscode.window.activeTextEditor;

    // do nothing if no open text editor
    if (!editor) return;

    //get selection
    var doc = editor.document;
    var selections = editor.selections;
    selections.forEach(selection => {
        //get range
        let start = selection.start;
        let end = selection.end;

        var select = editor.document.getText(selection);
        var res = utils.do_combine(select);

        //replace in edit
        editor.edit((edit) => {
            edit.replace(new vscode.Range(start, end), res);
        });
    });
}


// remove empty lines
function removeBlankLines(event) {

    // get active text editor
    var editor = vscode.window.activeTextEditor;

    // do nothing if no open text editor
    if (!editor) return;

    //get selection
    var selections = editor.selections;
    selections.forEach(selection => {
        var select = editor.document.getText(selection);
        var res = utils.do_remove(select);
        // format text
        editor.edit((edit) => {
            edit.replace(selection, res);
        });
    });
}

function trimLines(event, side) {
    // get active text editor
    var editor = vscode.window.activeTextEditor;

    // do nothing if no open text editor
    if (!editor) return;

    //get selection
    var selections = editor.selections;
    selections.forEach(selection => {
        var select = editor.document.getText(selection);
        var res = utils.do_trim(select, side);

        // format text
        editor.edit((edit) => {
            edit.replace(selection, res);
        });
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "column-edit" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = null;

    //add commands of trim
    disposable = vscode.commands.registerCommand('edlin.index', () => {
        index(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('edlin.trim', () => {
        trimLines(CONTEXT_COMMAND, utils.Side.BOTH);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('edlin.ltrim', () => {
        trimLines(CONTEXT_COMMAND, utils.Side.LEFT);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('edlin.rtrim', () => {
        trimLines(CONTEXT_COMMAND, utils.Side.RIGHT);
    });
    context.subscriptions.push(disposable);

    //add cmd to remove blank
    disposable = vscode.commands.registerCommand('edlin.removeBlankLine', () => {
        removeBlankLines(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('edlin.split', () => {
        split(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('edlin.splitAndKeep', () => {
        split(CONTEXT_COMMAND, true);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('edlin.combine', () => {
        combine(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }