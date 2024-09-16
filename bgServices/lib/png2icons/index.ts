import type {png2IconsOptions} from './messagingContract';

import {BILINEAR, HERMITE, createICO} from '@ctjs/png2icons';

import notexture from '../../../app/data/img/notexture.png' with {type: 'file'};

export default async (param: png2IconsOptions): Promise<void> => {
    const interpolation = param.pixelart ? BILINEAR : HERMITE;
    const pngFile = param.pngPath === '/data/img/notexture.png' ?
        Bun.file(notexture) :
        Bun.file(param.pngPath);
    const icoBuffer = createICO(
        Buffer.from(await pngFile.arrayBuffer()),
        interpolation,
        0,
        true
    )!;
    await Bun.write(param.icoPath, icoBuffer);
};