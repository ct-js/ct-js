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

const supportedTypes = ['string', 'number', 'boolean', 'wildcard'];

export const convertFromDtsToBlocks = (usefuls: usableDeclaration[], lib: 'core' | string, icon = 'grid-random'):
(IBlockCommandDeclaration | IBlockComputedDeclaration)[] =>
    usefuls.map((useful): IBlockCommandDeclaration | IBlockComputedDeclaration => {
        let documentation = useful.description,
            name = niceBlockName(useful.name),
            displayName = name;
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
                    } else if (node.tagName.escapedText === 'catnipLabel') {
                        displayName = node.comment.toString();
                    } else if (node.tagName.escapedText === 'catnipName') {
                        name = node.comment.toString();
                    } else if (node.tagName.escapedText === 'catnipIcon') {
                        icon = node.comment.toString();
                    }
                }
            }
        }
        console.log(useful.description, useful.jsDoc);
        if (useful.kind === 'function' && (!useful.returnType || useful.returnType === 'void')) {
            return {
                type: 'command',
                name,
                displayName,
                documentation,
                lib,
                code: useful.name,
                icon,
                pieces: useful.args.map(arg => ({
                    type: 'argument' as const,
                    key: arg.name,
                    typeHint: supportedTypes.includes(arg.type) ? arg.type : 'wildcard'
                })),
                jsTemplate: () => `${useful.name}();`
            };
        }
        const pieces: blockPiece[] = [];
        if (useful.kind === 'function' && useful.args.length) {
            pieces.push(...useful.args.map(arg => ({
                type: 'argument' as const,
                key: arg.name,
                typeHint: supportedTypes.includes(arg.type) ? arg.type : 'wildcard'
            })));
        }
        const draft = {
            type: 'computed',
            name: name.toLowerCase(),
            displayName: displayName.toLowerCase(),
            documentation,
            lib,
            code: useful.name,
            icon,
            pieces,
            typeHint: useful.returnType
        } as Omit<IBlockComputedDeclaration, 'jsTemplate'> & Partial<Pick<IBlockComputedDeclaration, 'jsTemplate'>>;
        if (useful.kind === 'prop') {
            draft.jsTemplate = () => useful.name;
        } else {
            const usefulArgs = useful.args;
            draft.jsTemplate = args => `${useful.name}(${usefulArgs.map(arg => args[arg.name]).join(', ')})`;
        }
        return draft as IBlockComputedDeclaration;
    }).sort((a, b) => sortHelper[a.type] - sortHelper[b.type]);
