import { safeName } from "./move";
import { CtfIProject, CtfType } from "./utils/project_types";

function available_name_internal(project: CtfIProject, proposed: string, type: CtfType, skipUid?: string) {
    if (!project.assets) throw Error('name_available expects an array "assets" in the project');

    const usedNames = {
        [CtfType.template]: {} as Record<string, boolean>,
        [CtfType.room]: {} as Record<string, boolean>,
        [CtfType.sound]: {} as Record<string, boolean>,
        [CtfType.style]: {} as Record<string, boolean>,
        [CtfType.texture]: {} as Record<string, boolean>,
        [CtfType.tandem]: {} as Record<string, boolean>,
        [CtfType.typeface]: {} as Record<string, boolean>,
        [CtfType.behavior]: {} as Record<string, boolean>,
        [CtfType.script]: {} as Record<string, boolean>,
        [CtfType.enum]: {} as Record<string, boolean>,
        [CtfType.folder]: {} as Record<string, boolean>
    };

    if (type === CtfType.script) {
        for (let script of project.scripts) {
            if (script.uid !== skipUid) {
                usedNames['script'][safeName(script.name, '')] = true;
            }
        }
    }
    else {
        for (let asset of project.assets) {
            if (asset.uid !== skipUid) {
                usedNames[asset.type][safeName(asset.name, '')] = true;
            }
        }
    }

    let i = 0;
    let basename = safeName(proposed);
    while (i < 100 && usedNames[type][basename]) {
        i++;
        basename = safeName(proposed, '', i);
    }

    if (i > 0) i++;

    return i;
}

/**
 * Returns the 0 if the name is available or the first number after 2 that is available.
 * You can then name your asset "Cat", Cat 2", "Cat 3", etc.
 *
 * @param project the project object
 * @param proposed the proposed name
 * @param type the type of asset (e.g. 'template', 'sound', 'script', etc.)
 * @param skipUid an optional uid to skip in the check (useful when renaming)
 * @returns a number that is 0 if the name is available or, the first number after 2 that is available
 */
export function available_name(project: any, proposed: string, type: string, skipUid?: string) {
    return available_name_internal(project, proposed, type as CtfType, skipUid);
}

/**
 * Returns either the empty string if the name is available or a suffix that can be used
 * to make the name unique. The name is for attachement to a human-readable name not a
 * file name. For example, " 2" to make "Cat 2". This then translates to "cat_2.png"
 * using the `safeName` function.
 *
 * @param project the project object
 * @param proposed the proposed name
 * @param type the type of asset (e.g. 'template', 'sound', 'script', etc.)
 * @param skipUid an optional uid to skip in the check (useful when renaming)
 * @returns a string that can be used as a suffix to the name (e.g. "", " 2", " 3", etc.)
 */
export function available_name_suffix(project: any, proposed: string, type: string, skipUid?: string) {
    const result = available_name_internal(project, proposed, type as CtfType, skipUid);
    return result > 0 ? ` ${result}` : '';
}

/**
 * Returns a boolean if the name is availble and will return a unique filename using the
 * `safeName` function
 *
 * @param project the project object
 * @param proposed the proposed name
 * @param type the type of asset (e.g. 'template', 'sound', 'script', etc.)
 * @param skipUid an optional uid to skip in the check (useful when renaming)
 * @returns true if the name is available, false otherwise
 */
export function is_available_name(project: any, proposed: string, type: string, skipUid?: string) {
    return available_name_internal(project, proposed, type as CtfType, skipUid) === 0;
}
