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


// remove empty lines
function removeEmpty(event) {

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

        //get the non-empty line only
        var ptext=text.filter((l)=>{return l.trim().length>0});
      

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
            case 0://left
                text.forEach(l => {
                    l = ltrim(l);
                    ptext.push(l);
                });
                break;
            case 1://right
                text.forEach(l => {
                    l = rtrim(l);
                    ptext.push(l);
                });
                break;
            default://both side
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
    console.log('Congratulations, your extension "column-edit" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);

    //add commands of trim
    disposable = vscode.commands.registerCommand('extension.trim', () => {
        doTrim(CONTEXT_COMMAND, 2);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.ltrim', () => {
        doTrim(CONTEXT_COMMAND, 0);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.rtrim', () => {
        doTrim(CONTEXT_COMMAND, 1);
    });
    context.subscriptions.push(disposable);

    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.removeEmptyLine', () => {
        removeEmpty(CONTEXT_COMMAND);
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}