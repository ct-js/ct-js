const YAML = require("js-yaml");
const fs = require("fs-extra");
const upath = require("path");

export async function preflight(path: string, uid: string, uid_db: string) {
    try {
        if (await fs.pathExists(path)) {
            const db_txt = await fs.pathExists(uid_db).then((result: boolean) => result ? fs.readFile(uid_db!, "utf8") : '');
            const db: Record<string, string> = (YAML.load(db_txt) || {}) as any;
            const which = Object.entries(db).find(
                x => x[1] === upath.basename(path)
            ) || [`${Math.random().toString(36).substring(2, 8)}${Math.random().toString(36).substring(2, 6)}`, ''];
            const src = path;
            const fdest = 'deleted-' + which[0].substring(0, 10) + upath.extname(path);
            const dest = upath.join(upath.dirname(path), fdest);
            await fs.move(src, dest);
            if (which[1]) db[which[0]] = fdest;
            db[uid] = upath.basename(path);
            const db_yaml = YAML.dump(db);
            await fs.outputFile(uid_db, db_yaml, "utf8");
        }
        else {
            const db_txt = await fs.pathExists(uid_db).then((result: boolean) => result ? fs.readFile(uid_db!, "utf8") : '');
            const db: Record<string, string> = (YAML.load(db_txt) || {}) as any;
            db[uid] = upath.basename(path);
            const db_yaml = YAML.dump(db);
            await fs.outputFile(uid_db, db_yaml, "utf8");
        }
    }
    catch (err) {
        throw err;
    }
}
