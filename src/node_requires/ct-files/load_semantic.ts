import { LoadOptions } from "js-yaml";

const fs = require("fs-extra");
const YAML = require("js-yaml");

/* eslint-disable camelcase */
const prepareProjectSemantic = (
    obj: any, db: Record<string, string>, lastuid: string = ''
): any => {
    if (!obj || typeof obj !== "object") return obj;

    lastuid = lastuid || obj.uid;

    if (Array.isArray(obj)) {
        return obj.map(item => prepareProjectSemantic(item, db, lastuid));
    }

    const newObj: any = {};
    for (const key in obj) {
        if (key === 'uid') {
            if (db[obj['uid']]) {
                newObj['origname'] = db[obj['uid']];
            }
            else if (obj['origname']) {
                newObj['origname'] = obj['origname'];
            }
            newObj['uid'] = obj['uid'];
        }
        else if (!obj.uid || (key !== 'origname')) {
            const value = obj[key];
            newObj[key] = typeof value === "object" ? 
                prepareProjectSemantic(value, db, lastuid) : value;
        }
    }

    return newObj;
}

/**
 * Loads a project from the file system. This only does semantic naming.
 * Where as the other load will also do private/public separation and
 * populate the last_mod field from a lastmod_data object.
 *
 * @param path the path to the project file (either *.ict or a backup)
 * @param uid_db the path to the uid_db file
 * @param opts options for YAML load (typically not used)
 * @returns a promise containing the project object
 */
/* eslint-disable no-undefined */
export const load_semantic = async (
    path: string, uid_db: string, opts?: LoadOptions
) => {
    const project = await fs.readFile(path, "utf8");
    if (project.indexOf('{') === 0) {
        return JSON.parse(project);
    }
    else {
        // unimpressed by this not being handled automatically
        const undefinedType = new YAML.Type('tag:yaml.org,2002:js/undefined', {
            kind: 'scalar',
            resolve: () => true,
            construct: () => undefined
        });
        let backwardsCompatible = YAML.DEFAULT_SCHEMA.extend([undefinedType]);
        const projectYAML = YAML.load(project, { schema: backwardsCompatible, ...opts });
        let db: Record<string, string> = {};
        try {
            const db_txt = await fs.pathExists(uid_db).then((result: boolean) => result ? fs.readFile(uid_db!, "utf8") : '');
            db = YAML.load(db_txt) || {} as any;
        }
        catch (e) {
            console.error(e);
            db = {};
        }
        return prepareProjectSemantic(projectYAML, db);
    }
}
