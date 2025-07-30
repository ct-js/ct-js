export interface CtfIProjectScript {
    name: string;
    uid: string;
    origname?: string;
    code: string;
}

export interface CtfISoundVariant {
    uid: string;
    origname: string;
    source: string;
}

export interface CtfIFont {
    weight: string;
    italic: boolean;
    uid: string;
    origname: string;
}

export enum CtfType {
    template = 'template',
    room = 'room',
    sound = 'sound',
    style = 'style',
    texture = 'texture',
    tandem = 'tandem',
    typeface = 'typeface',
    behavior = 'behavior',
    script = 'script',
    enum = 'enum',
    folder = 'folder'
}

export interface CtfIAsset {
    readonly type: CtfType;
    readonly uid: string;
    name: string;
    origname?: string;
    variants?: CtfISoundVariant[];
    fonts?: CtfIFont[];
}

export interface CtfIProject {
    ctjsVersion: string;
    scripts: CtfIProjectScript[];
    assets: CtfIAsset[];
}
