declare type blockArgumentType = 'boolean' | 'number' | 'string' | 'wildcard' | 'void';

declare interface IBlockPieceLabel {
    type: 'label';
    name: string;
    i18nKey?: string;
}
declare interface IBlockPieceIcon {
    type: 'icon';
    icon: string;
}
declare interface IBlockPieceCode {
    type: 'code';
    key: string;
}
declare interface IBlockPieceArgument {
    type: 'argument';
    key: string;
    typeHint: blockArgumentType;
    defaultConstant?: string;
    required?: boolean;
    assets?: resourceType | 'action';
}
declare interface IBlockPieceTextbox {
    type: 'textbox';
    key: string;
    default?: string;
}
declare interface IBlockPieceBlocks {
    type: 'blocks';
    // eslint-disable-next-line no-use-before-define
    placeholder?: blockPiece[];
    key: string;
}

declare type blockPiece = IBlockPieceLabel | IBlockPieceIcon | IBlockPieceCode |
                          IBlockPieceArgument | IBlockPieceTextbox | IBlockPieceBlocks;

// eslint-disable-next-line no-use-before-define
type argumentValues = Record<string, IBlock[] | IBlock | string>;

declare interface IBlockDeclaration {
    pieces?: blockPiece[];
    icon: string;
    /** Searchable command name */
    name: string;
    i18nKey?: string;
    lib: string;
    /** A unique string corresponding to this block so it can be serialized and deserialized */
    code: string;
    jsTemplate: (args: Record<string, argumentValues>) => string;
}
/**
 * A block for an executable method that may have additional arguments
 * and cannot be nested inside other simiar commands.
 */
declare interface IBlockCommandDeclaration extends IBlockDeclaration {
    type: 'command';
}
/** A block for a variable, property, or an inline command that returns a value. */
declare interface IBlockComputedDeclaration extends IBlockDeclaration {
    type: 'computed';
    typeHint: blockArgumentType;
}

declare type blockDeclaration = IBlockCommandDeclaration | IBlockComputedDeclaration;

declare interface IBlock {
    values: Record<string, argumentValues>;
    lib: string;
    code: string;
}

type BlockScript = IBlock[];

declare type blockRegistry = Record<string, blockDeclaration>;
declare type blockMenu = {
    name: string;
    i18nKey?: string;
    items: blockDeclaration[];
    opened: boolean;
}
