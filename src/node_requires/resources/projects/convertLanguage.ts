const compileCoffee = require('coffeescript').CoffeeScript.compile;
const coffeescriptSettings = {
    bare: true,
    sourcemaps: false
};

import {uidMap} from '..';
import {compile as compileCatnip} from '../../catnip/compiler';

import {js_beautify as jsBeautify, JSBeautifyOptions} from 'js-beautify';

export const convertCoffeeToJs = (): void => {
    const proj = window.currentProject;
    if (proj.language !== 'coffeescript') {
        throw new Error('Project is already not in CoffeeScript');
    }
    const changeset = [];
    try {
        for (const [, asset] of uidMap) {
            if (['template', 'room', 'behavior'].includes(asset.type)) {
                for (const event of (asset as IScriptable).events) {
                    changeset.push({
                        event,
                        code: compileCoffee(event.code, coffeescriptSettings)
                    });
                }
            }
        }
        proj.language = 'typescript';
        for (const change of changeset) {
            change.event.code = change.code;
        }
        window.alertify.success('Done! 👏');
    } catch (err) {
        window.alertify.error('Could not convert to JavaScript. Operation rollbacked, everything is fine, but you need to fix your scripts.');
        window.alertify.error(err.stack);
    }
};


export const convertCatnipToJs = (): void => {
    const proj = window.currentProject;
    if (proj.language !== 'catnip') {
        throw new Error('Project is already not in Catnip');
    }
    const changeset = [];
    const beautifyOptions: JSBeautifyOptions = {
        // eslint-disable-next-line camelcase
        indent_char: ' ',
        // eslint-disable-next-line camelcase
        indent_size: 4,
        eol: '\n',
        // eslint-disable-next-line camelcase
        max_preserve_newlines: 2,
        // eslint-disable-next-line camelcase
        jslint_happy: true
    };
    try {
        for (const [, asset] of uidMap) {
            if (['template', 'room', 'behavior'].includes(asset.type)) {
                for (const event of (asset as IScriptable).events) {
                    let code = jsBeautify(compileCatnip(event.code as BlockScript, {
                        eventKey: event.eventKey,
                        resourceId: asset.uid,
                        resourceName: asset.name,
                        resourceType: asset.type
                    }, false), beautifyOptions);
                    // eslint-disable-next-line max-depth
                    if (event.variables?.length) {
                        code = `let ${event.variables.join(', ')};\n${code}`;
                    }
                    changeset.push({
                        event,
                        code
                    });
                }
            }
        }
        proj.language = 'typescript';
        for (const change of changeset) {
            change.event.code = change.code;
        }
        window.alertify.success('Done! 👏');
    } catch (err) {
        window.alertify.error('Could not convert to JavaScript. Operation rollbacked, everything is fine, but you need to fix your scripts.');
        window.alertify.error(err.stack);
    }
};
