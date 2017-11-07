# Branch Warnings

Alerts you when you are working on a branch you have designated "protected" such as master. Can help to remember not to commit to the wrong branch.

\!\[screenshot\]\(images/warning.png\)

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `branchwarnings.protectedBranches`: An array of branch names. If it exists, warnings will be shown for these names.

For example if there is an image subfolder under your extension project workspace:

