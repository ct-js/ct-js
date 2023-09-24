declare interface ISkeleton extends IAsset {
    origname: string;
    from: 'dragonbones' | string;
    name: string;
}

const path = require('path');
const { SkeletonPreviewer } = require('./preview/skeleton');

const getSkeletonData = function getSkeletonData(skeleton: ISkeleton, fs?: boolean): string {
    if (fs) {
        return path.join(global.projdir, 'img', skeleton.origname);
    }
    return `file://${global.projdir}/img/${skeleton.origname}`;
};
const getSkeletonTextureData = function getSkeletonTextureData(
    skeleton: ISkeleton,
    fs?: boolean
): string {
    const slice = skeleton.origname.replace('_ske.json', '');
    if (fs) {
        return path.join(global.projdir, 'img', `${slice}_tex.json`);
    }
    return `file://${global.projdir}/img/${slice}_tex.json`;
};
const getSkeletonTexture = function getSkeletonTexture(skeleton: ISkeleton, fs?: boolean): string {
    const slice = skeleton.origname.replace('_ske.json', '');
    if (fs) {
        return path.join(global.projdir, 'img', `${slice}_tex.png`);
    }
    return `file://${global.projdir}/img/${slice}_tex.png`;
};

const getSkeletonPreview = SkeletonPreviewer.getClassic;

const importSkeleton = async function importSkeleton(source: string, group?: string) {
    const generateGUID = require('./../generateGUID');
    const fs = require('fs-extra');

    const uid = generateGUID();
    const partialDest = path.join(global.projdir + '/img/skdb' + uid);

    await Promise.all([
        fs.copy(source, partialDest + '_ske.json'),
        fs.copy(source.replace('_ske.json', '_tex.json'), partialDest + '_tex.json'),
        fs.copy(source.replace('_ske.json', '_tex.png'), partialDest + '_tex.png')
    ]);
    const skel = {
        name: path.basename(source).replace('_ske.json', ''),
        origname: path.basename(partialDest + '_ske.json'),
        from: 'dragonbones',
        type: 'skeleton' as resourceType,
        lastmod: Number(Date.now()),
        group,
        uid
    };
    await SkeletonPreviewer.save(skel);
    global.currentProject.skeletons.push(skel);
    window.signals.trigger('skeletonImported', skel);
};

module.exports = {
    getSkeletonData,
    getSkeletonTextureData,
    getSkeletonTexture,
    getSkeletonPreview,
    importSkeleton
};
