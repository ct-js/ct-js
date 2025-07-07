import { safeName } from "./move";

export enum PathType {
    Texture = "img",
    Sound = "snd",
    Room = "rooms",
    Template = "templates",
    Font = "fonts",
    Script = "scripts",
    ScriptObject = "sobj",
}

/**
 * Creates a path a simple utility function that's power comes from it typing.
 *
 * @param projdir the project directory
 * @param type the asset type
 * @param origname the file name of the asset (ct.js calls this origname)
 * @returns a relative path to the asset
 */
export function make_path(projdir: string, type: PathType | string, origname: string) {
    if (typeof origname === 'undefined') throw Error('make_path requires an origname');
    if (type === "room") type = PathType.Room;
    if (type === "template") type = PathType.Template;
    return `${projdir}/${type}/${origname}`;
}

/**
 * Creates a path a simple utility function that's power comes from it typing.
 *
 * @param projdir the project directory
 * @param type the asset type
 * @param origname the file name of the asset (ct.js calls this origname)
 * @returns a relative path to the asset
 */
export function filename(name: string, language: string) {
    const ext = {
        typescript: "ts",
        ts: "ts",
        javascript: "ts",
        coffee: "coffee",
        coffeescript: "coffee"
    }[language.toLowerCase()] || language.toLowerCase();
    const base = safeName(name);

    return `${base}.${ext}`;
}
