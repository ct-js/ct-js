import {TypefacePreviewer} from '../preview/typeface';
import {getOfType} from '..';
import fs from 'fs-extra';
import path from 'path';
import generateGUID from '../../generateGUID';

/**
 * @param font The font object in ct.js project.
 * @param fs If set to `true`, returns a clean path in a file system.
 * Otherwise, returns an URL.
 */
const getPathToTtf = function getPathToTtf(font: IFont, fs?: boolean): string {
    const path = require('path');
    if (fs) {
        return path.join(window.projdir, 'fonts', font.uid);
    }
    return `file://${window.projdir.replace(/\\/g, '/')}/fonts/f${font.uid}.ttf`;
};

export const addFont = async (typeface: ITypeface, src: string): Promise<IFont> => {
    const uidTypeface = generateGUID();
    await fs.copy(src, path.join(window.projdir, '/fonts/f' + uidTypeface + '.ttf'));
    const font: IFont = {
        weight: '400' as const,
        italic: false,
        uid: uidTypeface
    };
    typeface.fonts.push(font);
    if (typeface.fonts.length === 1) {
        await TypefacePreviewer.save(typeface);
    }
    return font;
};

const importTtfToFont = async function importTtfToFont(src: string): Promise<ITypeface> {
    if (path.extname(src).toLowerCase() !== '.ttf') {
        throw new Error(`[resources/fonts] Rejecting a file as it does not have a .ttf extension: ${src}`);
    }
    const uidFont = generateGUID();
    const obj: ITypeface = {
        name: path.basename(src, '.ttf'),
        type: 'typeface',
        fonts: [],
        lastmod: Number(new Date()),
        bitmapFont: false,
        bitmapFontSize: 16,
        bitmapFontLineHeight: 18,
        charsets: ['allInFont' as builtinCharsets],
        customCharset: '',
        uid: uidFont
    };
    await addFont(obj, src);
    await TypefacePreviewer.save(obj);
    window.signals.trigger('fontCreated');
    return obj;
};

const getThumbnail = TypefacePreviewer.getClassic;

export const areThumbnailsIcons = false;

export const createAsset = async (payload?: {src: string}): Promise<ITypeface> => {
    if (payload && payload.src) {
        return importTtfToFont(payload.src);
    }
    const inputPath = await window.showOpenDialog({
        filter: '.ttf'
    });
    if (!inputPath) {
        throw new Error('You need to select a TTF file.');
    }
    return importTtfToFont(inputPath);
};

interface IExternalFont extends FontFace {
    external?: boolean;
    ctId?: string;
}

const refreshFonts = (): void => {
    const typefaces = getOfType('typeface');
    for (const font of document.fonts as Iterable<IExternalFont>) {
        if (font.external) {
            document.fonts.delete(font);
        }
    }
    for (const typeface of typefaces) {
        for (const font of typeface.fonts) {
            const template = {
                weight: font.weight,
                style: font.italic ? 'italic' : 'normal'
            };
            const source = getPathToTtf(font),
                  cleanedSource = source.replace(/ /g, '%20').replace(/\\/g, '/');
            const face = new FontFace('CTPROJFONT' + typeface.name, `url(file://${cleanedSource})`, template) as IExternalFont;
            face.load()
            .then((loaded: IExternalFont) => {
                loaded.external = true;
                loaded.ctId = face.ctId = font.uid;
                document.fonts.add(loaded);
            });
        }
    }
};

export {
    importTtfToFont,
    getThumbnail,
    refreshFonts,
    getPathToTtf
};
