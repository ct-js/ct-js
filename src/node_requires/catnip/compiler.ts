import {getDeclaration} from '.';
import {getName, getById} from '../resources';

let safeId = -1;
export const resetSafeId = () => {
    safeId = -1;
};
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
                    // eslint-disable-next-line max-depth
                    if (piece.assets) {
                        values[piece.key] = `'${getName(getById(piece.assets, associatedVal))}'`;
                    } else {
                        values[piece.key] = `'${associatedVal}'`;
                    }
                } else {
                    // null, undefined and boolean values
                    values[piece.key] = String(associatedVal);
                }
            } else if (piece.type === 'blocks') {
                const associatedVal = block.values[piece.key];
                values[piece.key] = compile(associatedVal as IBlock[] ?? []);
            } else if (piece.type === 'propVar') {
                values.variableName = block.values.variableName as string;
            }
        }
        safeId++;
        result += declaration.jsTemplate(values, safeId);
        if (blocks.length > 1) {
            result += '\n';
        }
    }
    return result;
};
