# Running in dev
- Load the project in VSCode and Hit F5

# Publishing the extension
## Updating PAT if needed
- Go to https://dev.azure.com/teledemic
- Follow instructions at https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token
- `vsce login teledemic` (case sensitive)
- Paste PAT

## Publishing
- Update the version in package.json
- Update the changelog
- `vsce package`
- `vsce publish`