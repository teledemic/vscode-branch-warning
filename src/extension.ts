'use strict';
import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";
import * as globToRegExp from "glob-to-regexp";

const GIT_IDENTIFIER = ".git/HEAD";
const BRANCH_PREFIX = "ref: refs/heads/";
let protectedBranches: string[] = [];
let suppressPopup = false;
let lastBranch = "";
let statusWarningText = "";
let popupWarningText = "";

export function activate(context: vscode.ExtensionContext) {
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9999);
    console.log("Extension branch-warnings initializing");
    updateConfigs(status);

    const gitpath = path.join(locateGitPath(vscode.workspace.rootPath), ".git");
    const headpath = path.join(gitpath, "HEAD");
    
        // Install the debugger
    let disposable = vscode.commands.registerCommand('gitbranchwarn.debug', () => {
		// Display a message box to the user
        vscode.window.showInformationMessage('Found a .git folder at: ' + gitpath);
	});
	context.subscriptions.push(disposable);

    
    const pattern = new vscode.RelativePattern(gitpath, "HEAD");
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidChange(e => {
        console.log(".git/HEAD change detected");
        updateBranch(status, e.fsPath);
    });
    vscode.workspace.onDidChangeConfiguration(e => {
        console.log("Configuration change detected");
        updateConfigs(status);
        updateBranch(status, headpath);
    });
    updateBranch(status, headpath);
}

function updateConfigs(status:vscode.StatusBarItem) {
    let config = vscode.workspace.getConfiguration("branchwarnings");
    protectedBranches = config.get<string[]>("protectedBranches");
    suppressPopup = config.get<boolean>("suppressPopup");
    statusWarningText = config.get<string>("warningText");
    popupWarningText = config.get<string>("warningPopup");
    status.color = config.get<string>("msgColor");
    status.tooltip = config.get<string>("msgTooltip");
}

function locateGitPath(startPath:string): string {
    let dir = startPath;
    while (!isValidGitPath(dir)) {
        // If not valid try the parent
        dir = path.join(dir, '../');
    }
    console.log('Found .git folder: ' + dir);
    return dir;
}

function isValidGitPath(directory:string): boolean {
    const headpath = path.join(directory, GIT_IDENTIFIER);
    let isGitRoot = fs.existsSync(headpath);
    if (!isGitRoot) {
        console.log('Did not find .git folder in: ' + headpath);
    }
    return isGitRoot;
}


function updateBranch(status: vscode.StatusBarItem, path: string): void {
    fs.readFile(path, "utf-8", (err, data) => {
        if (!err) {
            // Parse out the branch name, since we now need to consider the entire 
            // branch path/name like "feature/xyz"
            const line = data.split(/\r\n|\r|\n/)[0];
            const branch = line.replace(BRANCH_PREFIX, "");
            console.log("On branch " + branch);
            if (protectedBranches.some(
                    val => { 
                        // Instead of doing a direct match, we now treat the values as globs
                        let regex = globToRegExp(val, { flags: "i", globstar: true });
                        return regex.test(branch);
                    }
                )) {
                console.log("Branch is in protected branches [ " + protectedBranches.join(", ") + " ]");
                status.text = statusWarningText + branch;
                status.show();
                if (lastBranch != branch && !suppressPopup) {
                    console.log("Branch is a change, showing info");
                    vscode.window.showWarningMessage(popupWarningText + branch);
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
