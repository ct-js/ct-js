# Installer

A python installer for ct.js.

See https://github.com/ct-js/ct-js/issues/200.

## Developing

Run `./install-requirements.sh` to install the python dependencies.

Run `./run.sh` to run the installer.

Run `./format.sh` to format the python file.

Run `./build.sh` to build the installer.

## Todo

-   [ ] new gui
    -   [x] style
        -   button hover style may need to be changed
    -   [x] first page
        -   [x] gui
        -   [x] change button
        -   [x] install button
    -   [ ] second page
        -   [x] gui
        -   [x] installation status
        -   [x] abort button
        -   [ ] rotating in-progress icon
        -   [x] open ct.js button
            -   hopefully works
        -   [x] run bat/sh files that create shortcuts/file rules
            -   windows is freezing, linux isnt tested, otherwise should work
        -   [ ] eta
-   [ ] figure out pyinstaller/py2app/py2exe
-   [ ] integrate everything into travis