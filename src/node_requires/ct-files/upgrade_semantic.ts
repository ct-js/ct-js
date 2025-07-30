/* eslint-disable camelcase,max-depth,no-await-in-loop,require-atomic-updates */
import { make_path, PathType } from "./make_path";
import { safeName } from "./move";
import { CtfIAsset, CtfIProject, CtfType } from "./utils/project_types";

const YAML = require("js-yaml");
const fs = require("fs-extra");

interface UsedNameRecords {
    [CtfType.sound]: Record<string, boolean>,
    [CtfType.typeface]: Record<string, boolean>,
    [CtfType.texture]: Record<string, boolean>
}

const upgrade_sound = async (
    asset: CtfIAsset,
    usedNames: UsedNameRecords,
    db: Record<string, string>
) => {
    let basename: string | undefined;

    for (let i = 0; i < 100 && (!basename || usedNames.sound[basename]); i++) {
        basename = safeName(asset.name, '', i);
        if (!usedNames.sound[basename]) {
            if (i > 0) asset.name = asset.name + ' ' + (i + 1);
            let vi = 0;
            for (let variant of (asset.variants || [])) {
                const newOrigName = safeName(asset.name, variant.source, vi > 0 ? variant.uid.substring(0, 5) : '');
                const [ext] = variant.source.match(/\.[A-Za-z0-9]+$/) || [''];
                const src = make_path(projdir, PathType.Sound, 's' + asset.uid + '_' + variant.uid + ext);
                const dest = make_path(projdir, PathType.Sound, newOrigName);
                try {
                    if (src !== dest) await fs.move(src, dest);
                    variant.origname = newOrigName;
                    db[variant.uid] = variant.origname;
                }
                catch (e) { console.error(e); }
                vi++;
            }
        }
    }
    if (basename) usedNames.sound[basename] = true;
}

const upgrade_typeface = async (
    asset: CtfIAsset,
    usedNames: UsedNameRecords,
    db: Record<string, string>
) => {
    let basename: string | undefined;

    for (let i = 0; i < 100 && (!basename || usedNames.typeface[basename]); i++) {
        basename = safeName(asset.name, '', i);
        if (!usedNames.typeface[basename]) {
            if (i > 0) asset.name = asset.name + ' ' + (i + 1);
            let vi = 0;
            for (let font of (asset.fonts || [])) {
                const newOrigName = safeName(asset.name, 'ttf',  vi > 0 ? font.uid.substring(0, 5) : '');
                const src = make_path(projdir, PathType.Font, 'f' + font.uid + '.ttf');
                const dest = make_path(projdir, PathType.Font, newOrigName);
                try {
                    if (src !== dest) await fs.move(src, dest);
                    font.origname = newOrigName;
                    db[font.uid] = font.origname;
                }
                catch (e) { console.error(e); }
                vi++;
            }
        }
    }
    if (basename) usedNames.typeface[basename] = true;
}

const upgrade_textures = async (
    asset: CtfIAsset,
    usedNames: UsedNameRecords,
    db: Record<string, string>
) => {
    let basename: string | undefined;

    for (let i = 0; i < 100 && (!basename || usedNames.texture[basename]); i++) {
        basename = safeName(asset.name, '', i);
        if (!usedNames.texture[basename]) {
            const oldOrigName = asset.origname;
            if (i > 0) asset.name = asset.name + ' ' + (i + 1);
            const newOrigName = safeName(asset.name, asset.origname);
            const src = make_path(projdir, PathType.Texture, oldOrigName || 'untitled');
            const dest = make_path(projdir, PathType.Texture, newOrigName);
            try {
                if (src !== dest) await fs.move(src, dest);
                asset.origname = newOrigName;
                db[asset.uid] = asset.origname;
            }
            catch (e) { console.error(e); }
        }
    }
    if (basename) usedNames.texture[basename] = true;
}

/**
 * Upgrades the project to semantic file naming, this is a level down from external file naming.
 * With semantic file naming, no new files are created but existing files are renamed based upon
 * their human-readable name. A "Cat" texture would become "cat.png". The sound "Whoosh!!!.mp3"
 * would become "woosh.mp3". If there was a variant to that sound with GUID "382d8fef38", it
 * would become "woosh_382d8.mp3".
 *
 * Semantic file naming is a box of pain. For example, human readable names might not be suitable
 * for the file system so you might convert "Whoosh BANG!*@$!" to "whoosh_bang.mp3" but then
 * what if another human-readable simplifies to 'whoosh_bang.mp3'? Therfore unique naming must be
 * based on the simplified file system name but return a modification to the human readable name.
 *
 * What if now a user deletes the asset "Red" and wants to rename "Primary" to the deleted "Red"
 * that move will fail if "red.png" remains which it may to allow the user to use a back-up
 * project. That's why, upon deletion, "red.png" becomes "<<GUID>>.png". But how does the
 * back-up project become aware of that move. That's where the uid_db comes into play which
 * links the GUID to its current filename.
 *
 * @param project the project object
 * @param projdir the project directory
 * @param uid_db the uid_db - this is usually called ".uid_db" or ".uid_db.yaml" (former preferred)
 * @returns
 */
export const upgrade_semantic = async (
    project: CtfIProject, projdir: string, uid_db: string
) => {
    if (!project.assets) throw Error(`upgrade_semantic project format is unexpected (version is ${project.ctjsVersion} must be >= 5.2.0)`);

    const usedNames: UsedNameRecords = {
        [CtfType.sound]: {},
        [CtfType.typeface]: {},
        [CtfType.texture]: {}
    };

    const db_txt = await fs.pathExists(uid_db).then((result: boolean) => result ? fs.readFile(uid_db!, "utf8") : '');
    const db: Record<string, string> = (YAML.load(db_txt) || {}) as any;

    for (let asset of project.assets) {
        switch (asset.type) {
            case CtfType.sound:
                await upgrade_sound(asset, usedNames, db);
                break;
            case CtfType.typeface:
                await upgrade_typeface(asset, usedNames, db);
                break;
            case CtfType.texture:
                await upgrade_textures(asset, usedNames, db);
                break;
            default:
                break;
        }
    }

    const db_yaml = YAML.dump(db);
    await fs.outputFile(uid_db, db_yaml, "utf8");

    return true;
}
