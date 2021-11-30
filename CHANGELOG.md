# Change Log
All notable changes to the "branch-warnings" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.10] - 2021-11-30
### Changed
- Filewatcher now responds to both "add" and "change" events, may fix an issue with newer versions of VSCode.

## [1.0.9] - 2021-08-09
### Changed
- Added "main" in addition to "master" as default protected branches.

## [1.0.8] - 2021-02-04
### Changed
- Status bar background color for the warning is now determined by the theme
- msgColor option is removed because it is obsolete with the above change

## [1.0.7] - 2020-06-02
### Changed
- Updated readme
### Added
- Added support for glob patterns in the "protected branches" extension setting, which makes it useful when excluding a set of feature branches or other branch types. 

## [1.0.6] - 2020-05-15
### Changed
- Updated readme

## [1.0.5] - 2020-05-15
### Added
- Support for nested project structures, where the vscode workspace isn't at the git repository root. 
- Changed the default properties to include "master" in the default protected branches. 
- Added the ability to customize the warning tooltip and color. 