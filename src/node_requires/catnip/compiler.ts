/* eslint-disable max-depth */
import {getDeclaration} from '.';
import {ExporterError} from '../exporter/ExporterError';
import {getName, getById} from '../resources';

let safeId = -1;
export const resetSafeId = () => {
    safeId = -1;
};
export const compile = (blocks: BlockScript, failureMeta: {
    eventKey: string,
    resourceId: assetRef,
    resourceName: string,
    resourceType: resourceType
}): string => {
    let result = '';
    for (const block of blocks) {
        const declaration = getDeclaration(block.lib, block.code);
        const values: Record<string, string> = {};
        for (const piece of declaration.pieces) {
            if (piece.type === 'argument') {
                const associatedVal = block.values[piece.key];
                if (typeof associatedVal === 'object') {
                    values[piece.key] = compile([associatedVal as IBlock], failureMeta);
                } else if (piece.assets) {
                    try {
                        values[piece.key] = `'${getName(getById(piece.assets, associatedVal as string))}'`;
                    } catch (oO) {
                        if (piece.required) {
                            throw new ExporterError(`Required asset in field ${piece.key} of block "${declaration.name}" not found: ${associatedVal}`, {
                                clue: 'blockArgumentMissing',
                                eventKey: failureMeta.eventKey,
                                resourceId: failureMeta.resourceId,
                                resourceName: failureMeta.resourceName,
                                resourceType: failureMeta.resourceType
                            });
                        } else {
                            values[piece.key] = piece.defaultConstant ?? '-1';
                        }
                    }
                } else if (typeof associatedVal === 'string') {
                    values[piece.key] = `'${associatedVal}'`;
                } else {
                    // null, undefined and boolean values
                    values[piece.key] = String(associatedVal);
                }
            } else if (piece.type === 'blocks') {
                const associatedVal = block.values[piece.key];
                values[piece.key] = compile(associatedVal as IBlock[] ?? [], failureMeta);
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
