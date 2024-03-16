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
                    // eslint-disable-next-line max-depth
                    if (Array.isArray(associatedVal)) {
                        values[piece.key] = compile(associatedVal);
                    } else {
                        values[piece.key] = compile([associatedVal]);
                    }
                } else if (typeof associatedVal === 'string') {
                    values[piece.key] = `'${associatedVal}'`;
                } else {
                    values[piece.key] = String(associatedVal);
                }
            }
        }
        result += declaration.jsTemplate(values);
    }
    return result;
};
