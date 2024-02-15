declare type blockArgumentType = 'boolean' | 'number' | 'string' | 'any';

declare interface IBlockPieceLabel {
    type: 'label';
    name: string;
    i18nKey?: string;
}
declare interface IBlockPieceIcon {
    type: 'icon';
    icon: string;
}
declare interface IBlockPieceJsCode {
    type: 'js';
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

declare type blockPiece = IBlockPieceLabel | IBlockPieceIcon | IBlockPieceJsCode |
                          IBlockPieceArgument | IBlockPieceTextbox | IBlockPieceBlocks;

// eslint-disable-next-line no-use-before-define
type argumentValues = Record<string, IBlock[] | IBlock | string>;

/**
 * A block for an executable method that may have additional arguments
 * and cannot be nested inside other simiar commands.
 */
declare interface IBlockCommandDeclaration {
    type: 'command';
    pieces?: blockPiece[];
    icon: string;
    name: string;
    i18nKey: string;
    lib: string;
    code: string;
    jsTemplate: (args: Record<string, argumentValues>) => string;
}
/** A block for a variable, property, or an inline command that returns a value. */
declare interface IBlockComputedDeclaration {
    type: 'computed';
    pieces?: blockPiece[];
    lib: string;
    code: string;
    typeHint: blockArgumentType;
    jsTemplate: (values: Record<string, argumentValues>) => string;
}

declare type blockDeclaration = IBlockCommandDeclaration | IBlockComputedDeclaration;

declare interface IBlock {
    values: Record<string, argumentValues>;
    lib: string;
    code: string;
}

declare interface IBlockCanvas {
    /* floatingBlocks: IBlock[] & {
        x: number;
        y: number;
    }; */
    coreBlocks: IBlock[];
}

declare type blockRegistry = Record<string, blockDeclaration>;
declare type blockMenu = {
    name: string;
    i18nKey?: string;
    items: (blockMenu | blockDeclaration)[];
    opened: boolean;
}
