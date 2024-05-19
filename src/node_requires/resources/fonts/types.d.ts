type builtinCharsets = 'allInFont' | 'punctuation' | 'basicLatin' | 'latinExtended' | 'cyrillic' | 'greekCoptic' | 'custom';

interface ITypeface {
    weight: fontWeight;
    italic: boolean;
    uid: string;
}

interface IFont extends IAsset {
    type: 'font';
    typefaces: ITypeface[];
    bitmapFont: boolean;
    bitmapFontSize: number;
    bitmapFontLineHeight: number;
    charsets: builtinCharsets[];
    customCharset?: string;
}
