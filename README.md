# Branch Warnings

Alerts you when you are working on a branch you have designated "protected" such as master. Can help to remember not to commit to the wrong branch.

![screenshot](images/warning.png)

## Extension Settings

This extension contributes the following settings:

* `branchwarnings.suppressPopup`: Suppress the more intrusive warning dialog when first switching to a protected branch (only show the warning on the status bar).

* `branchwarnings.protectedBranches`: An array of branch names. If it exists, warnings will be shown for these names.

By default, no warnings will be given. If you wish to warn when working on the branch "master", add to your workspace or user settings:
```
	"branchwarnings.protectedBranches": [
		"master"
	]
```

## Known issues

The VSCode git plugin handles workspaces in subfolders of git repositories. This extension does not, and will only activate if the workspace is the root of a git repo.