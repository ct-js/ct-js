import ctFiles from './ct-files/index';
import { CtfType } from './ct-files/utils/project_types';

/* eslint-disable no-await-in-loop */
const renameAsset = async (asset: IAsset, newName: string) => {
    switch (asset.type) {
        case CtfType.texture: {
            const texture = asset as ITexture;
            const newFileName = ctFiles.safeName(newName, texture.origname);
            try {
                await ctFiles.move(
                    projdir + '/img/' + texture.origname,
                    projdir + '/img/' + newFileName,
                    projdir + '/.uid_db',
                    texture.uid
                );
                texture.origname = newFileName;
            }
            catch (err) {
                console.error(err);
            }
            return true;
        }
        case CtfType.typeface: {
            const typeface = asset as ITypeface;
            let ti = 0;
            for (let font of typeface.fonts) {
                const newFileName = ctFiles.safeName(newName, font.origname, ti ? font.uid.substring(0, 5) : '');
                try {
                    await ctFiles.move(
                        projdir + '/fonts/' + font.origname,
                        projdir + '/fonts/' + newFileName,
                        projdir + '/.uid_db',
                        font.uid
                    );
                    font.origname = newFileName;
                }
                catch (err) {
                    console.error(err);
                }
                ti++;
            }
            return true;
        }
        case CtfType.sound: {
            const sound = asset as ISound;
            let vi = 0;
            for (let variant of sound.variants) {
                const newFileName = ctFiles.safeName(newName, variant.origname, vi ? variant.uid.substring(0, 5) : '');
                try {
                    await ctFiles.move(
                        projdir + '/snd/' + variant.origname,
                        projdir + '/snd/' + newFileName,
                        projdir + '/.uid_db',
                        variant.uid
                    );
                    variant.origname = newFileName;
                }
                catch (err) {
                    console.error(err);
                }
                vi++;
            }
            return true;
        }
        default:
            return false;
    }
}

module.exports = renameAsset;
