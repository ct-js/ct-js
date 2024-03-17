import {getDeclaration} from '.';

export const compile = (blocks: BlockScript): string => {
    let result = '';
    for (const block of blocks) {
        const declaration = getDeclaration(block.lib, block.code);
        const values: Record<string, string> = {};
        for (const piece of declaration.pieces) {
            if (piece.type === 'argument') {
                const associatedVal = block.values[piece.key];
                if (typeof associatedVal === 'object') {
                    values[piece.key] = compile([associatedVal as IBlock]);
                } else if (typeof associatedVal === 'string') {
                    values[piece.key] = `'${associatedVal}'`;
                } else {
                    values[piece.key] = String(associatedVal);
                }
            } else if (piece.type === 'blocks') {
                const associatedVal = block.values[piece.key];
                values[piece.key] = compile(associatedVal as IBlock[] ?? []);
            } else if (piece.type === 'propVar') {
                values.variableName = block.values.variableName as string;
            }
        }
        result += declaration.jsTemplate(values);
    }
    return result;
};
