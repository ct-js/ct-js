/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import {usableDeclaration} from './declarationExtractor';

const specials = /[_.]/g;
const camels = /(\w)([A-Z])/g;
export const niceBlockName = (name: string, lowercase?: boolean): string => {
    name = name.replace(specials, ' ')
               .replace(camels, val => `${val[0]} ${val[1].toLocaleLowerCase()}`);
    if (!lowercase) {
        return name.charAt(0).toLocaleUpperCase() + name.slice(1);
    }
    return name;
};

const sortHelper = {
    command: -1,
    computed: 1
};

const supportedTypes = ['string', 'number', 'boolean', 'wildcard', 'function'];

const getPieces = (
    piecesAssets: Record<string, resourceType | 'action'>,
    useful: usableDeclaration
): (IBlockPieceArgument | IBlockPieceBlocks)[] => (useful.kind === 'function' ? useful.args : []).map(arg => {
    if (arg.type === 'BLOCKS') {
        return {
            type: 'blocks',
            key: arg.name
        };
    }
    return {
        type: 'argument' as const,
        key: arg.name,
        typeHint: supportedTypes.includes(arg.type) ? arg.type : 'wildcard',
        assets: piecesAssets[arg.name]
    };
});

const stringifyArg = (values: Record<string, string>) => (arg: {
    type: blockArgumentType | 'BLOCKS';
    name: string;
}) => {
    if (arg.type === 'BLOCKS') {
        return `function () {\n    ${values[arg.name]}\n}`;
    }
    return values[arg.name];
};

export const convertFromDtsToBlocks = (usefuls: usableDeclaration[], lib: 'core' | string, icon = 'grid-random'):
(IBlockCommandDeclaration | IBlockComputedDeclaration)[] =>
    (usefuls.map((useful): IBlockCommandDeclaration | IBlockComputedDeclaration | false => {
        let documentation = useful.description,
            name = niceBlockName(useful.name),
            displayName: string;
        const piecesAssets: Record<string, resourceType | 'action'> = {};
        let returnSave = false;
        if (useful.jsDoc) {
            for (const jsDoc of useful.jsDoc) {
                if (!jsDoc.tags) {
                    continue;
                }
                documentation += '\n';
                for (const node of jsDoc.tags) {
                    if (node.tagName.escapedText === 'param') {
                        documentation += `\n**${(node as any).name.escapedText}** ${node.comment}`;
                    } else if (node.tagName.escapedText === 'returns' || node.tagName.escapedText === 'return') {
                        documentation += `\n\n**Returns** ${node.comment}`;
                    } else if (node.tagName.escapedText === 'catnipIgnore') {
                        return false;
                    } else if (node.tagName.escapedText === 'catnipLabel') {
                        displayName = node.comment.toString();
                    } else if (node.tagName.escapedText === 'catnipName') {
                        name = node.comment.toString();
                    } else if (node.tagName.escapedText === 'catnipIcon') {
                        icon = node.comment.toString();
                    } else if (node.tagName.escapedText === 'catnipAsset') {
                        let [key, assetType] = node.comment.toString().split(':');
                        key = key.trim();
                        assetType = assetType.trim();
                        piecesAssets[key] = assetType as resourceType | 'action';
                    } else if (node.tagName.escapedText === 'catnipSaveReturn') {
                        returnSave = true;
                    }
                }
            }
        }
        let isCommand = useful.kind === 'function' && (!useful.returnType || useful.returnType === 'void');
        if (returnSave) {
            isCommand = true;
        }
        const draft = {
            code: useful.name,
            lib,
            type: isCommand ? 'command' : 'computed',
            typeHint: useful.returnType,
            name: isCommand ? name.slice(0, 1).toUpperCase() + name.slice(1) : name.toLowerCase(),
            displayName: displayName && (isCommand ?
                displayName.slice(0, 1).toUpperCase() + displayName.slice(1) :
                displayName.toLowerCase()),
            icon,
            documentation,
            pieces: getPieces(piecesAssets, useful)
        } as Omit<IBlockComputedDeclaration, 'jsTemplate'> & Partial<Pick<IBlockComputedDeclaration, 'jsTemplate'>>;
        if (returnSave) {
            draft.pieces.push({
                type: 'filler'
            }, {
                type: 'label',
                name: 'store in',
                i18nKey: 'store in'
            }, {
                type: 'argument',
                key: 'return',
                typeHint: 'wildcard'
            });
        }
        if (useful.kind === 'prop') {
            draft.jsTemplate = () => useful.name;
        } else {
            const {name, args} = useful;
            if (returnSave) {
                draft.jsTemplate = values => {
                    if (values.return) {
                        return `${values.return} = ${name}(${args.map(stringifyArg(values)).join(', ')});`;
                    }
                    return `${name}(${args.map(stringifyArg(values)).join(', ')});`;
                };
            } else if (isCommand) {
                draft.jsTemplate = values => `${name}(${args.map(stringifyArg(values)).join(', ')});`;
            } else {
                draft.jsTemplate = values => `${name}(${args.map(stringifyArg(values)).join(', ')})`;
            }
        }
        return draft as IBlockComputedDeclaration;
    })
    .filter(a => a) as (IBlockCommandDeclaration | IBlockComputedDeclaration)[])
    .sort((a, b) => sortHelper[a.type] - sortHelper[b.type]);
