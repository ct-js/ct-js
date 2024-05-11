/*
 * This file returns versions for nw.js and pixi.js, as well as checks
 * that pixi.js versions used for game packaging are the same.
 */

const builderManifest = require('./package.json');

const unfixedRegex = /^[~^]|^[\d.]+-[\d.]+$/;

const versionMessage = 'versions.js has found an error in ct.js configuration!';
const makeTab = () => console.error(`╭─${'─'.repeat(versionMessage.length)}─╮
│ ${versionMessage} │
╰─${'─'.repeat(versionMessage.length)}─╯`);

const packagesToCheck = {
    pixi: 'pixi.js',
    pixiParticles: '@pixi/particle-emitter'
};
const packageVersions = {};
for (const packageKey in packagesToCheck) {
    packageVersions[packageKey] = builderManifest.dependencies[packagesToCheck[packageKey]];
    if (!packageVersions[packageKey] || unfixedRegex.test(packageVersions[packageKey])) {
        makeTab();
        throw new Error(`${packageKey} package used in the app folder is not set to a fixed version. This must be fixed. Current value is "${packageVersions[packageKey]}".`);
    }
}

module.exports = {
    nwjs: '0.87.0',
    nwjsArm: '0.67.1',
    ...packageVersions
};
