'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    status.text = "WARNING";
    status.color = "#f00";
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => updateBranch(status)));
    let gitExt = vscode.extensions.getExtension('vscode.git');
    console.log(gitExt.exports);

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "branch-warnings" is now active!');
    updateBranch(status);
}

function updateBranch(status: vscode.StatusBarItem): void {
    if (!vscode.window.activeTextEditor.selection.isEmpty) {
        status.show();
    } else {
        status.hide();
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}