'use strict';
import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";
import * as globToRegExp from "glob-to-regexp";
import simpleGit, {SimpleGit} from 'simple-git';

const GIT_IDENTIFIER = ".git/HEAD";
const BRANCH_PREFIX = "ref: refs/heads/";
let protectedBranches: string[] = [];
let suppressPopup = false;
let lastBranch = "";
let statusWarningText = "";
let popupWarningText = "";
let warningTooltip = "";
let warningColor = "";
let warnIfRegex = "";
let warnIfMsg = "";
let warnIfMsgColor = "";

let gitRootDir;

export function activate(context: vscode.ExtensionContext) {
    // Construct the status display
    const statusLocal = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9999);
    const statusRemote = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9999);
    console.log("Extension branch-warnings initializing");

    refresh(statusLocal, statusRemote);
    
    // Install the debugger
    const gitPath = path.join(gitRootDir, ".git");
    const disposable = vscode.commands.registerCommand('gitbranchwarn.debug', () => {
		// Display a message box to the user
        vscode.window.showInformationMessage('Found a .git folder at: ' + gitPath);
	});
	context.subscriptions.push(disposable);

    // Register to watch for config or file system changes and update alerts.
    const pattern = new vscode.RelativePattern(gitPath, "HEAD");
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidChange(e => {
        console.log(".git/HEAD change detected");
        refresh(statusLocal, statusRemote);
    });
    vscode.workspace.onDidChangeWorkspaceFolders(e => {
        console.log("Workspace folder change detected");
        refresh(statusLocal, statusRemote);
    });
    vscode.workspace.onDidChangeConfiguration(e => {
        console.log("Configuration change detected");
        refresh(statusLocal, statusRemote);
    }); 
}

function refresh(statusLocal:vscode.StatusBarItem, statusRemote:vscode.StatusBarItem) {
    updateConfigs();
    gitRootDir = locateGitPath(vscode.workspace.rootPath);
    checkLocalBranch(statusLocal);
    checkRemoteBranches(statusRemote)
}

function updateConfigs() {
    const config = vscode.workspace.getConfiguration("branchwarnings");

    protectedBranches = config.get<string[]>("protectedBranches");
    suppressPopup = config.get<boolean>("suppressPopup");
    
    statusWarningText = config.get<string>("warningText");
    popupWarningText = config.get<string>("warningPopup");
    warningColor = config.get<string>("msgColor");
    warningTooltip = config.get<string>("msgTooltip");

    warnIfRegex = config.get<string>("warnIfRemoteBranchExistsMatchingRegex");
    warnIfMsg = config.get<string>("warnIfRemoteBranchExistsMatchingMsg");
    warnIfMsgColor = config.get<string>("warnIfRemoteBranchExistsMatchingMsgColor");
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
    const headPath = path.join(directory, GIT_IDENTIFIER);
    const isGitRoot = fs.existsSync(headPath);
    if (!isGitRoot) {
        console.log('Did not find .git folder in: ' + headPath);
    }
    return isGitRoot;
}

function checkLocalBranch(status: vscode.StatusBarItem): void {
    const gitPath = path.join(gitRootDir, ".git");
    const headPath = path.join(gitPath, "HEAD");

    // Case 1: You're on a branch thats protected
    fs.readFile(headPath, "utf-8", (err, data) => {
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
                status.tooltip = warningTooltip;
                status.color = warningColor;
                status.show();
                if (lastBranch != branch && !suppressPopup) {
                    console.log("Branch has changed, showing info");
                    vscode.window.showWarningMessage(popupWarningText + branch);
                }
            } else {
                console.log("Branch is not in protected branches [ " + protectedBranches.join(", ") + " ].");
                status.hide();
            }
            lastBranch = branch;
        } else {
            console.log("Error getting git branch");
            console.log(err);
            status.hide();
        }
    });
}

async function checkRemoteBranches(status: vscode.StatusBarItem) {

    // start git client using root and determine if it contains the regex
    const git2: SimpleGit = simpleGit(gitRootDir);
    try {
        const result = await git2.listRemote(['--heads']);
        if (result && warnIfMsg && warnIfMsg != "") {
            console.log("Raw GIT results: " + JSON.stringify(result));
            let matches = result.match(warnIfRegex);
            if (matches && matches.length >= 1) {
                console.log("Remote branch found matching the regex for a release branch [ " + warnIfRegex + " ]");
                console.log("Found regex match: " + JSON.stringify(matches));
                const expandedMsg = warnIfMsg + matches.join(', ');
                status.text = expandedMsg;
                status.tooltip = expandedMsg;
                status.color = warnIfMsgColor;
                status.show();
                vscode.window.showWarningMessage(warnIfMsg);
            }
        } else {
            console.log('Remote URL -- no match.');
            status.hide();
        }
    } catch(err) {
        console.log("Error when getting git remotes in dir: " + gitRootDir 
            + ", error: " + JSON.stringify(err));
        status.hide();
    }
}

export function deactivate() {
}
