'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9999);
    status.text = "WARNING";
    status.color = "#f00";

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "branch-warnings" is now active!');

    let protectedBranches = vscode.workspace.getConfiguration("branchwarnings").get<string[]>("protectedBranches");

    const gitpath = path.join(vscode.workspace.rootPath, ".git");
    const headpath = path.join(gitpath, "HEAD");
    const pattern = new vscode.RelativePattern(gitpath, "HEAD");
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidChange(e => {
        updateBranch(status, e.fsPath, protectedBranches);
    });
    vscode.workspace.onDidChangeConfiguration(e => {
        protectedBranches = vscode.workspace.getConfiguration("branchwarnings").get<string[]>("protectedBranches");
        updateBranch(status, headpath, protectedBranches);
    });
    updateBranch(status, headpath, protectedBranches);
}

let lastBranch = "";

function updateBranch(status: vscode.StatusBarItem, path: string, protectedBranches: string[]): void {
    fs.readFile(path, "utf-8", (err, data) => {
        if (!err) {
            const line = data.split(/\r\n|\r|\n/)[0];
            const branch = line.split("/").pop();
            if (protectedBranches.some(val => val.toLowerCase() === branch.toLowerCase())) {
                status.text = "WARNING: branch is " + branch;
                status.show();
                if (lastBranch != branch) {
                    vscode.window.showWarningMessage("WARNING: you are on the protected branch " + branch);
                }
            } else {
                status.hide();
            }
            lastBranch = branch;
        } else {
            console.log("Error getting git branch");
            console.log(err);
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}