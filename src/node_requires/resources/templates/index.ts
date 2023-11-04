import {get as getDefaultTemplate} from './defaultTemplate';
import {getTextureOrig,
    getDOMTexture as getTextureDOMImage,
    getPixiTexture as getTexturePixiTexture} from '../textures';
import {getDOMSkeleton, getPixiTexture as getSkeletonPixiTexture} from '../skeletons';

import {TexturePreviewer} from '../preview/texture';
import {SkeletonPreviewer} from '../preview/skeleton';
import {StylePreviewer} from '../preview/style';

import * as PIXI from 'node_modules/pixi.js';
import {getById, getOfType} from '..';

const createNewTemplate = function createNewTemplate(opts?: {name: string}): ITemplate {
    const template = getDefaultTemplate();
    if (opts?.name) {
        template.name = opts.name;
    }
    // Fix default OnStep event for coffeescript projects
    if (window.currentProject.language === 'coffeescript') {
        template.events[0].code = '@move()';
    }
    return template;
};

/**
 * Retrieves the full path to a thumbnail of a given template.
 * @param {string|ITemplate} template Either the id of the template, or its ct.js object
 * @param {boolean} [x2] If set to true, returns a 128x128 image instead of 64x64.
 * @param {boolean} [fs] If set to true, returns a file system path, not a URI.
 * @returns {string} The full path to the thumbnail.
 */
const getTemplatePreview = function getTemplatePreview(
    template: ITemplate | assetRef,
    x2: boolean,
    fs: boolean
): string {
    if (typeof template === 'string') {
        template = getById('template', template);
    }
    if (template === -1) {
        return TexturePreviewer.get(-1, fs);
    }
    if (template.baseClass === 'Text') {
        if (template.textStyle !== -1 && template.textStyle) {
            return StylePreviewer.get(getById('style', template.textStyle), fs);
        }
        return TexturePreviewer.get(-1, fs);
    }
    if (template.skeleton && template.skeleton !== -1) {
        return SkeletonPreviewer.get(getById('skeleton', template.skeleton), fs);
    }
    return TexturePreviewer.get(template.texture === -1 ? -1 : getById('texture', template.texture), fs);
};
const getThumbnail = getTemplatePreview;
export const areThumbnailsIcons = false;

/**
 * Returns the path to the source image of the template's used texture.
 */
const getTemplateTextureOrig = (template: ITemplate | assetRef, fs: boolean): string => {
    if (typeof template === 'string') {
        template = getById('template', template);
    }
    if (template === -1) {
        throw new Error('Cannot work with -1 assetRefs');
    }
    return getTextureOrig(template.texture, fs);
};

const getPixiTexture = (template: ITemplate | assetRef): PIXI.Texture<PIXI.ImageResource>[] => {
    if (typeof template === 'string') {
        template = getById('template', template);
    }
    if (template === -1) {
        throw new Error('Cannot work with -1 assetRefs');
    }
    if (template.skeleton && template.skeleton !== -1) {
        return [getSkeletonPixiTexture(template.skeleton)];
    }
    return getTexturePixiTexture(template.texture, void 0, true);
};

const getDOMTexture = (template: ITemplate | assetRef): HTMLImageElement => {
    if (template === -1) {
        throw new Error('templates.getDOMTexture: Cannot work with -1 references to templates.');
    }
    if (typeof template === 'string') {
        template = getById('template', template);
    }
    if (template.skeleton && template.skeleton !== -1) {
        return getDOMSkeleton(template.skeleton);
    }
    return getTextureDOMImage(template.texture);
};

/**
 * Properly removes a template from the project, cleansing it from all the associated rooms.
 * Must not be called directly from UI, use resources -> deleteAsset instead.
 */
export const removeAsset = (template: string | ITemplate): void => {
    const asset = typeof template === 'string' ? getById('template', template) : template;
    const {uid} = asset;
    for (const room of getOfType('room')) {
        room.copies = room.copies.filter((copy) => copy.uid !== uid);
        if (room.follow === uid) {
            room.follow = -1;
        }
    }
};

export {getIcons} from '../scriptables';

export {
    getDefaultTemplate,
    getTemplatePreview,
    getThumbnail,
    createNewTemplate as createAsset,
    getPixiTexture,
    getDOMTexture,
    getTemplateTextureOrig
};
