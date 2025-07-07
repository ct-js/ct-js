import ctFiles from "./ct-files/index";

export const discardAsset = (projdir: string, asset: IAsset) => {
    switch (asset.type) {
        case 'texture':
            return ctFiles.move(
                `${projdir}/img/${(asset as ITexture).origname}`,
                `${projdir}/img/deleted-${(asset as ITexture).uid.substring(0, 10)}.png`,
                projdir + '/.uid_db',
                asset.uid
            );
        case 'sound':
            return Promise.all((asset as ISound).variants.map(snd => ctFiles.move(
                `${projdir}/snd/${snd.origname}`,
                `${projdir}/snd/deleted-${snd.uid.substring(0, 10)}.${
                    snd.origname?.substring(snd.origname.lastIndexOf('.') + 1)
                }`,
                projdir + '/.uid_db',
                asset.uid
            )));
        case 'typeface':
            return Promise.all((asset as ITypeface).fonts.map(font => ctFiles.move(
                `${projdir}/fonts/${font.origname}`,
                `${projdir}/fonts/deleted-${font.uid.substring(0, 10)}.${
                    font.origname?.substring(font.origname.lastIndexOf('.') + 1)
                }`,
                projdir + '/.uid_db',
                asset.uid
            )));
        default:
            return Promise.resolve(false);
    }
}
