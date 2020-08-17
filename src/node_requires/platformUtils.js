const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const isWin = (/win[0-9]+/).test(os.platform());
const isLinux = os.platform() === 'linux';
const isMac = !(isWin || isLinux);
const isItchIo = process.cwd().split(path.sep)
                 .includes('itch');

const mod = {
    isWin,
    isLinux,
    isMac,
    isItchIo,
    exec: path.dirname(process.cwd()).replace(/\\/g, '/'),

    /**
     * Checks whether a given directory is writable
     *
     * @param {String} way A path to check against
     * @returns {Promise<Boolean>} Resolves into either `true` (if writable) or `false`
     */
    checkWritable(way) {
        return new Promise(resolve => {
            // eslint-disable-next-line no-bitwise
            fs.access(way, fs.constants.R_OK | fs.constants.W_OK, err => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    },
    /**
     * Checks whether the directory where ct.js' executable is placed is writable
     *
     * @returns {Promise<Boolean>} Resolves into either `true` (if writable) or `false`
     */
    checkExecWritable() {
        return mod.checkWritable(mod.exec);
    },
    /**
     * Gets a directory ct.js can write to. It can be either a path where an executable is placed
     * or a ct.js folder in the home directory. Throws an error if no directory is available.
     *
     * @returns {Promise<String>} A writable directory
     */
    async getWritableDir() {
        // The `HOME` variable is not always available in ct.js on Windows
        const home = process.env.HOME || ((process.env.HOMEDRIVE || '') + process.env.HOMEPATH);

        const execWritable = mod.checkExecWritable();
        const homeWritable = mod.checkWritable(home);
        await execWritable; // Run in parallel
        await homeWritable;
        return new Promise((resolve, reject) => {
            // writing to an exec path on Mac is not a good idea,
            // as it will be hidden inside an app's directory, which is shown as one file.
            if (isMac || !(execWritable)) {
                if (!homeWritable) {
                    reject(new Error(`Could not write to folders ${home} and ${mod.exec}.`));
                } else {
                    fs.ensureDir(path.join(home, 'ct.js'))
                    .then(() => {
                        resolve(path.join(home, 'ct.js'));
                    })
                    .catch(reject);
                }
            } else {
                resolve(path.dirname(process.cwd()).replace(/\\/g, '/'));
            }
        });
    }
};

{
    let exportDir,
        exportDirPromise,
        buildDir,
        buildDirPromise;
    // We compute a directory once and store it forever
    mod.getExportDir = () => {
        if (exportDir) {
            return Promise.resolve(exportDir);
        }
        if (exportDirPromise) {
            return exportDirPromise;
        }
        exportDirPromise = mod.getWritableDir().then(dir => {
            exportDir = path.join(dir, 'export');
            return exportDir;
        });
        return exportDirPromise;
    };
    mod.getBuildDir = () => {
        if (buildDir) {
            return Promise.resolve(buildDir);
        }
        if (buildDirPromise) {
            return buildDirPromise;
        }
        buildDirPromise = mod.getWritableDir().then(dir => {
            buildDir = path.join(dir, 'build');
            return buildDir;
        });
        return buildDirPromise;
    };
}

module.exports = mod;
