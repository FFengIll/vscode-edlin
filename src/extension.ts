'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
    //if no splitor given, use default
    if (splitor.length <= 0) {
        splitor = DEFAULT_SPLITOR;
    }

    return splitor;
}

function split(event) {

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
        //get selection info of the cursor
        var start = selection.start;

        //get line text (*note* the select is splitor only but we wanna split line)
        var textline = doc.lineAt(start);

        //do split
        var splitor = getSplitor();
        var text = textline.text;//.split('\r\n');
        var processed = text.split(splitor);

        //replace in edit
        editor.edit((edit) => {
            //edit.replace(new vscode.Position(line,number), processed.join('\n'));
            edit.replace(textline.range, processed.join('\n'));
        });
    });
}

function combine(event) {

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
        //get range
        let start = selection.start;
        let end = selection.end;

        //get lines except \r\n
        var text = editor.document.getText(selection).split('\r\n');

        //replace in edit
        editor.edit((edit) => {
            edit.replace(new vscode.Range(start, end), text.join(''));
        });
    });
}


// remove empty lines
function removeBlankLine(event) {

    // get active text editor
    var editor = vscode.window.activeTextEditor;

    // do nothing if 'doAction' was triggered by save and 'removeOnSave' is set to false
    if (event === CONTEXT_SAVE && config.triggerOnSave !== true) return;

    // do nothing if no open text editor
    if (!editor) return;

    //get selection
    var selections = editor.selections;
    selections.forEach(selection => {
        //split by \n to match all types
        var text = editor.document.getText(selection).split('\n');

        //get the non-blank line only
        var ptext = text.filter((l) => {
            return l.trim().length > 0
        });

        // format text
        editor.edit((edit) => {
            edit.replace(selection, ptext.join('\n'));
        });
    });
}

function ltrim(str) { //删除左边的空格
    return str.replace(/(^\s*)/g, "");
}

function rtrim(str) { //删除右边的空格
    return str.replace(/(\s*$)/g, "");
}

function doTrim(event, side) {
    // get active text editor
    var editor = vscode.window.activeTextEditor;

    // do nothing if 'doAction' was triggered by save and 'removeOnSave' is set to false
    if (event === CONTEXT_SAVE && config.triggerOnSave !== true) return;

    // do nothing if no open text editor
    if (!editor) return;

    //get selection
    var selections = editor.selections;
    selections.forEach(selection => {
        var text = editor.document.getText(selection).split('\r\n');

        // this where magic happens
        var ptext = [];
        switch (side) {
            case 0: //left
                text.forEach(l => {
                    l = ltrim(l);
                    ptext.push(l);
                });
                break;
            case 1: //right
                text.forEach(l => {
                    l = rtrim(l);
                    ptext.push(l);
                });
                break;
            default: //both side
                text.forEach(l => {
                    l = l.trim();
                    ptext.push(l);
                });
                break;
        }

        // format text
        editor.edit((edit) => {
            edit.replace(selection, ptext.join('\n'));
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
    disposable = vscode.commands.registerCommand('edlin.trim', () => {
        doTrim(CONTEXT_COMMAND, 2);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('edlin.ltrim', () => {
        doTrim(CONTEXT_COMMAND, 0);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('edlin.rtrim', () => {
        doTrim(CONTEXT_COMMAND, 1);
    });
    context.subscriptions.push(disposable);

    //add cmd to remove blank
    disposable = vscode.commands.registerCommand('edlin.removeBlankLine', () => {
        removeBlankLine(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('edlin.split', () => {
        split(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('edlin.combine', () => {
        combine(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }