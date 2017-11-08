'use strict';
import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";

let protectedBranches: string[] = [];
let suppressPopup = false;

export function activate(context: vscode.ExtensionContext) {
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9999);
    status.text = "WARNING";
    status.color = "#f00";
    status.tooltip = "This branch has been marked as protected in the branch-warnings extension";

    console.log("Extension branch-warnings initializing");

    let config = vscode.workspace.getConfiguration("branchwarnings");
    protectedBranches = config.get<string[]>("protectedBranches");
    suppressPopup = config.get<boolean>("suppressPopup");
    
    const gitpath = path.join(vscode.workspace.rootPath, ".git");
    const headpath = path.join(gitpath, "HEAD");
    const pattern = new vscode.RelativePattern(gitpath, "HEAD");
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidChange(e => {
        console.log(".git/HEAD change detected");
        updateBranch(status, e.fsPath);
    });
    vscode.workspace.onDidChangeConfiguration(e => {
        console.log("Configuration change detected");
        protectedBranches = vscode.workspace.getConfiguration("branchwarnings").get<string[]>("protectedBranches");
        updateBranch(status, headpath);
    });
    updateBranch(status, headpath);
}

let lastBranch = "";

function updateBranch(status: vscode.StatusBarItem, path: string): void {
    fs.readFile(path, "utf-8", (err, data) => {
        if (!err) {
            const line = data.split(/\r\n|\r|\n/)[0];
            const branch = line.split("/").pop();
            console.log("On branch " + branch);
            if (protectedBranches.some(val => val.toLowerCase() === branch.toLowerCase())) {
                console.log("Branch is in protected branches [ " + protectedBranches.join(", ") + " ]");
                status.text = "WARNING: branch is " + branch;
                status.show();
                if (lastBranch != branch && !suppressPopup) {
                    console.log("Branch is a change, showing info");
                    vscode.window.showWarningMessage("WARNING: you are on the protected branch " + branch);
                }
            } else {
                console.log("Branch is not in protected branches [ " + protectedBranches.join(", ") + " ]");
                status.hide();
            }
            lastBranch = branch;
        } else {
            console.log("Error getting git branch");
            console.log(err);
        }
    });
}

export function deactivate() {
}