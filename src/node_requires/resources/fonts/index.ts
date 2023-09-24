import { FontPreviewer } from "../preview/font";

/**
 * Gets the ct.js texture object by its id.
 * @param {string} id The id of the texture
 * @returns {ITexture} The ct.js texture object
 */
const getById = (id: string): IFont => {
    const font = global.currentProject.fonts.find((f: IFont) => f.uid === id);
    if (!font) {
        throw new Error(`Attempt to get a non-existent font with ID ${id}`);
    }
    return font;
};
const getName = function getName(font: IFont): string {
    return `${font.typefaceName} ${font.weight} ${font.italic ? 'Italic' : ''}`;
};

/**
 * @param {object|string} font The font object in ct.js project, or its UID.
 * @param {boolean} fs If set to `true`, returns a clean path in a file system.
 * Otherwise, returns an URL.
 */
const getPathToTtf = function getPathToTtf(font: IFont, fs?: boolean): string {
    const path = require('path');
    if (fs) {
        return path.join((global as any).projdir, 'fonts', font.origname);
    }
    return `file://${(global as any).projdir.replace(/\\/g, '/')}/fonts/${font.origname}`;
};

const importTtfToFont = async function importTtfToFont(
    src: string,
    group: string
): Promise<void> {
    const fs = require('fs-extra'),
          path = require('path');
    if (path.extname(src).toLowerCase() !== '.ttf') {
        throw new Error(`[resources/fonts] Rejecting a file as it does not have a .ttf extension: ${src}`);
    }
    const generateGUID = require('./../../generateGUID');
    const uid = generateGUID();
    await fs.copy(src, path.join((global as any).projdir, '/fonts/f' + uid + '.ttf'));
    const obj = {
        type: 'font' as resourceType,
        typefaceName: path.basename(src).replace(/\.ttf$/i, ''),
        weight: '400' as fontWeight,
        italic: false,
        origname: `f${uid}.ttf`,
        lastmod: Number(new Date()),
        bitmapFont: false,
        bitmapFontSize: 16,
        bitmapFontLineHeight: 18,
        charsets: ['allInFont' as builtinCharsets],
        customCharset: '',
        group,
        uid
    };
    global.currentProject.fonts.push(obj);
    await FontPreviewer.save(obj);
    window.signals.trigger('fontCreated');
};

const getThumbnail = FontPreviewer.getClassic;

export {
    importTtfToFont,
    getById,
    getName,
    getThumbnail,
    getPathToTtf
};
