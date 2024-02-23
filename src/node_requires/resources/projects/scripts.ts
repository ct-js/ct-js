type Script = IProject['scripts'][0];

export const scriptModels = new Map<Script, IDisposable>();

export const dropScriptModel = (script: Script) => {
    scriptModels.get(script).dispose();
    scriptModels.delete(script);
};
/** This method is to be used when loading a project or creating a new script */
export const addScriptModel = (script: Script) => {
    scriptModels.set(script, monaco.editor.createModel(
        script.code,
        'typescript'
    ));
};
/** Resets the monaco file models and loads in all the script */
export const loadScriptModels = (project: IProject) => {
    for (const script of scriptModels.keys()) {
        dropScriptModel(script);
    }
    for (const script of project.scripts) {
        addScriptModel(script);
    }
};
