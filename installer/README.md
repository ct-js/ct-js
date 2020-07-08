# Installer

A python installer for ct.js.

See https://github.com/ct-js/ct-js/issues/200.

## Developing

Run `./install-requirements.sh` to install the python dependencies.

Run `./run.sh` to run the installer.

Run `./format.sh` to format the python file.

Run `./build.sh` to build the installer.

## Todo

-   [x] when unzipping, extract to the parent of the installation directory and rename extraction (before: LocalAppData
        -> ct.js -> osx64; after: LocalAppData -> ct.js)
-   [ ] redo first page gui, move them without using the GridLayout
-   [ ] use CoMiGo's new design, make a style for it (?)
-   [ ] figure out pyinstaller
