import path from 'path';

export const getVariantBasePath = (sound: ISound, variant: ISound['variants'][0]): string =>
    `${window.projdir}/snd/s${sound.uid}_${variant.uid}`;
export const getVariantPath = (sound: ISound, variant: ISound['variants'][0]): string =>
    variant.origname ? `${window.projdir}/snd/${variant.origname}` : `${getVariantBasePath(sound, variant)}${path.extname(variant.source)}`;
