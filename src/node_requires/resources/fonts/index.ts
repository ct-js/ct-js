import {FontPreviewer} from '../preview/font';
import {getOfType} from '..';
import fs from 'fs-extra';
import path from 'path';
import generateGUID from './../../generateGUID';

/**
 * @param {object|string} typeface The font object in ct.js project, or its UID.
 * @param {boolean} fs If set to `true`, returns a clean path in a file system.
 * Otherwise, returns an URL.
 */
const getPathToTtf = function getPathToTtf(typeface: ITypeface, fs?: boolean): string {
    const path = require('path');
    if (fs) {
        return path.join(window.projdir, 'fonts', typeface.uid);
    }
    return `file://${window.projdir.replace(/\\/g, '/')}/fonts/f${typeface.uid}.ttf`;
};

const addTypeface = async (font: IFont, src: string): Promise<ITypeface> => {
    const uidTypeface = generateGUID();
    await fs.copy(src, path.join(window.projdir, '/fonts/f' + uidTypeface + '.ttf'));
    const typeface: ITypeface = {
        weight: '400' as const,
        italic: false,
        uid: uidTypeface
    };
    font.typefaces.push(typeface);
    if (font.typefaces.length === 1) {
        await FontPreviewer.save(font);
    }
    return typeface;
};

const importTtfToFont = async function importTtfToFont(src: string): Promise<IFont> {
    if (path.extname(src).toLowerCase() !== '.ttf') {
        throw new Error(`[resources/fonts] Rejecting a file as it does not have a .ttf extension: ${src}`);
    }
    const uidFont = generateGUID();
    const obj: IFont = {
        name: path.basename(src, '.ttf'),
        type: 'font',
        typefaces: [],
        lastmod: Number(new Date()),
        bitmapFont: false,
        bitmapFontSize: 16,
        bitmapFontLineHeight: 18,
        charsets: ['allInFont' as builtinCharsets],
        customCharset: '',
        uid: uidFont
    };
    await addTypeface(obj, src);
    await FontPreviewer.save(obj);
    window.signals.trigger('fontCreated');
    return obj;
};

const getThumbnail = FontPreviewer.getClassic;

export const areThumbnailsIcons = false;

export const createAsset = async (payload?: {src: string}): Promise<IFont> => {
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
    const fonts = getOfType('font');
    for (const font of document.fonts as Iterable<IExternalFont>) {
        if (font.external) {
            document.fonts.delete(font);
        }
    }
    for (const font of fonts) {
        for (const typeface of font.typefaces) {
            const template = {
                weight: typeface.weight,
                style: typeface.italic ? 'italic' : 'normal'
            };
            const source = getPathToTtf(typeface),
                  cleanedSource = source.replace(/ /g, '%20').replace(/\\/g, '/');
            const face = new FontFace('CTPROJFONT' + font.name, `url(file://${cleanedSource})`, template) as IExternalFont;
            face.load()
            .then((loaded: IExternalFont) => {
                loaded.external = true;
                loaded.ctId = face.ctId = typeface.uid;
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
