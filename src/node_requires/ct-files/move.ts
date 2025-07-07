const YAML = require("js-yaml");
const fs = require("fs-extra");
const upath = require("path");

/**
 * The safe name is the file name used when saving to the file system.
 * The extension can be a range of values including another file name ("hello.ts")
 * a file extension ("ts"), a file extension with a dot (".ts") or a longhand
 * description of the file ("typescript" or "coffee").
 *
 * @param name the name of the file
 * @param ext the extension of the file (optional)
 */
export function safeName(name: string, ext?: string, additive?: string | number) {
    const newExt = { 'coffeescript': 'coffee', 'typescript': 'ts' }[(ext || '').toLowerCase()] || ext;
    const additivePlus1 = typeof additive === 'number' ? additive + 1 : additive;
    const hyphen = typeof additive === 'number' ? '_' : '-';
    if (newExt && newExt.indexOf(".") === -1) {
        return name.replace(/[^a-zA-Z0-9\-]+/g, "_").toLowerCase().replace(/_+$/, "")
            + (additive ? hyphen + additivePlus1 : '') + "." + newExt.toLowerCase();
    }
    else if (newExt && newExt.indexOf(".") > -1) {
        return name.replace(/[^a-zA-Z0-9\-]+/g, "_").toLowerCase().replace(/_+$/, "")
            + (additive ? hyphen + additivePlus1 : '') + "." + newExt.substring(newExt.lastIndexOf(".") + 1).toLowerCase();
    }
    else {
        return name.replace(/[^a-zA-Z0-9\-]+/g, "_").toLowerCase().replace(/_+$/, "")
            + (additive ? hyphen + additivePlus1 : '');
    }
}

/**
 * A rarely used function that allows you just to sanitize an existing file name.
 * For example, "My Space Asteroids.png" becomes "my_space_asteroids.png".
 * Otherwise behaves identical to the `safeName` function.
 *
 * The reason this was separated was the `safeName` function was being used to
 * sanitize human-readable names and so while we wanted "Cat.Blue.Red" to become
 * "cat_blue_red.png" this would have translated it to "cat_blue.red".
 *
 * @param name the name of the file
 * @param ext the extension of the file (optional)
 */
export function safeNameExt(name: string, ext?: string, additive?: string | number) {
    if (name.indexOf('.') > -1 && !ext) {
        const base = name.substring(0, name.lastIndexOf("."));
        const pext = name.substring(name.lastIndexOf(".") + 1);
        return safeName(base, pext, additive);
    }
    else {
        return safeName(name, ext, additive);
    }
}

/**
 * Moves a file about the file system. This is about keeping the uid_db up-to-date.
 * Essentially at any time there will be roughly three backups of the project file.
 * One of these may refer to "spaceship.png" as "spaceship.png" but the others may
 * refer to its past name "player.png" or its uid "34fe203c.png".
 *
 * They are all different references but meant to point to the same file. Most
 * importantly they'll all have the same uid "34fe203c". The uid_db simply keeps a
 * record of uids and their paths. Upon loading of any project file, the uid_db
 * will be searched for all uids and if a match is found, the origname will be
 * updated to the entry.
 *
 * @param src the source path (absolute or relative)
 * @param dest the destination path (absolute or relative)
 * @param uid_db the path to the uid_db file
 * @param uid the uid of the file being moved
 */
export async function move(src: string, dest: string, uid_db: string, uid: string) {
    if (src === dest) return; /* easiest move ever */
    try {
        const db_txt = await fs.pathExists(uid_db).then((result: boolean) => result ? fs.readFile(uid_db!, "utf8") : '');
        const db: Record<string, string> = (YAML.load(db_txt) || {}) as any;
        db[uid] = upath.basename(dest);
        const db_yaml = YAML.dump(db);
        await fs.outputFile(uid_db, db_yaml, "utf8");
        await fs.move(src, dest);
    }
    catch (err) {
        throw err;
    }
}
