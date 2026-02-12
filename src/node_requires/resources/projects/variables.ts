const variableNamePattern = /^[a-zA-Z_][a-zA-Z_0-9]*$/;

export const validateVariableName = (name: string): boolean => {
    if (name.trim() === '') {
        return false;
    }
    return variableNamePattern.test(name);
};

const reservedNames = new Set([
    // Names used by ct.js
    'actions',
    'backgrounds',
    'behaviors',
    'Camera',
    'camera',
    'CtAction',
    'content',
    'emitters',
    'inputs',
    'res',
    'rooms',
    'scripts',
    'sounds',
    'styles',
    'templates',
    'Tilemap',
    'Tile',
    'tilemaps',
    'timer',
    'u',
    'meta',
    'settings',
    'pixiApp',
    // JS globals
    ...Object.keys(window),
    // JS Keywords
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield'
]);

export const isReservedName = (name: string): boolean => reservedNames.has(name);

import {ExporterError} from 'src/node_requires/exporter/ExporterError';
export const validateAllVars = (project: IProject) => {
    for (const variable of project.globalVars) {
        if (!validateVariableName(variable.name)) {
            throw new ExporterError(`Invalid variable name "${variable.name}"`, {
                clue: 'variableNames'
            });
        }
    }
};

export const stringifyVariables = (project: IProject, production: boolean): string => {
    let code = '';
    for (const variable of project.globalVars) {
        code += `let ${variable.name} = ${variable.value};\n`;
        if (!production) {
            // Expose these variables on window object as properties with getter/setters
            code += `Object.defineProperty(window, '${variable.name}', {
                get: () => ${variable.name},
                set: (value) => ${variable.name} = value
            });\n`;
        }
    }
    return code;
};

const ts = monaco.languages.typescript;
let previousExtraLibTs: IDisposable | null = null;
let previousExtraLibJs: IDisposable | null = null;
export const updateGlobalVarTypings = () => {
    const vars = window.currentProject.globalVars;
    const types = vars.map(v => `declare var ${v.name}: ${v.type === 'raw' ? 'any' : v.type};`);
    if (previousExtraLibTs) {
        previousExtraLibTs.dispose();
        previousExtraLibJs!.dispose();
    }
    const typedefs = types.join('\n');
    previousExtraLibJs = ts.javascriptDefaults.addExtraLib(typedefs);
    previousExtraLibTs = ts.typescriptDefaults.addExtraLib(typedefs);
};

export const addNewVariable = () => {
    const vars = window.currentProject.globalVars;
    const newVar: IProjectVariable = {
        name: 'globalVar',
        value: '0',
        type: 'number'
    };
    let namingAttempts = 1;
    while (vars.some(v => v.name === newVar.name)) {
        newVar.name = `globalVar${namingAttempts++}`;
    }
    vars.push(newVar);
    updateGlobalVarTypings();
};

export const removeVariable = (index: number) => {
    const vars = window.currentProject.globalVars;
    vars.splice(index, 1);
    updateGlobalVarTypings();
};

export const renameVariable = (index: number, newName: string) => {
    if (isReservedName(newName) || !validateVariableName(newName)) {
        return false;
    }
    const vars = window.currentProject.globalVars;
    const variable = vars[index];
    const oldName = variable.name;
    variable.name = newName;

    window.orders.trigger('catnipGlobalVarRename', {
        type: 'global variable',
        from: oldName, // old name of the property/variable
        to: newName // new name of the prop/var
    });
    updateGlobalVarTypings();
    return true;
};

export const changeVariableType = (index: number, newType: IProjectVariable['type']) => {
    const vars = window.currentProject.globalVars;
    const variable = vars[index];
    const oldType = variable.type;
    if (oldType === newType) {
        return;
    }

    variable.type = newType;
    if (newType === 'string') {
        variable.value = JSON.stringify(variable.value);
    } else if (newType === 'number') {
        variable.value = (Number(variable.value) || '0').toString();
    } else if (newType === 'boolean') {
        variable.value = Boolean(variable.value).toString();
    }

    window.orders.trigger('catnipGlobalVarRetype', {
        type: 'global variable',
        varName: variable.name,
        from: oldType, // old type of the property/variable
        to: newType // new type of the prop/var
    });
    updateGlobalVarTypings();
};

export const getCleanVariableValue = (variable: IProjectVariable) => {
    if (variable.type === 'raw') {
        return variable.value;
    }
    return JSON.parse(variable.value);
};
