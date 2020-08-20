const {exec, isWin, isMac} = require('./platformUtils');
const path = require('path');
const winInstaller = path.join(exec, 'ctjs-installer.exe');
const macInstaller = path.join(exec, 'ctjs-installer.app', 'Contents', 'MacOS', 'ctjs-installer');
const linuxInstaller = path.join(exec, 'ctjs-installer');

/**
 * Checks whether an updater/installer exists inside the ct.js' directory.
 * @returns {Promise<boolean>} `true` if an installer exists.
 */
const updaterExists = function () {
    const fs = require('fs-extra');
    if (isWin) {
        return fs.pathExists(winInstaller);
    }
    if (isMac) {
        return fs.pathExists(macInstaller);
    }
    // Linux
    return fs.pathExists(linuxInstaller);
};

const runUpdater = async function () {
    if (!(await updaterExists())) {
        throw new Error('The updater was requested, but it did not exist.');
    }
    const {spawn} = require('child_process');

    const opts = {
        detached: true,
        cwd: exec
    };
    const args = [`'${exec}'`];

    if (isWin) {
        spawn(winInstaller, args, opts);
    } else if (isMac) {
        spawn(macInstaller, args, opts);
    } else { // Linux
        spawn(linuxInstaller, args, opts);
    }
};

const updaterNeeded = async function updaterNeeded() {
    const {isWin, isMac, isItchIo, checkExecWritable} = require('./platformUtils');
    if (isWin || isMac) {
        return {
            decision: true
        };
    }
    if (isItchIo) {
        return {
            decision: false,
            reason: 'itch'
        };
    }
    if (!(await checkExecWritable())) {
        return {
            decision: false,
            reason: 'readonly'
        };
    }
    return true;
};

module.exports = {
    updaterExists,
    updaterNeeded,
    runUpdater
};
