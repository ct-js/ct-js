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

export const convertFromDtsToBlocks = (usefuls: usableDeclaration[], lib: 'core' | string, icon = 'grid-random'):
(IBlockCommandDeclaration | IBlockComputedDeclaration)[] =>
    usefuls.map((useful): IBlockCommandDeclaration | IBlockComputedDeclaration => {
        if (useful.kind === 'function' && (!useful.returnType || useful.returnType === 'void')) {
            return {
                type: 'command',
                name: niceBlockName(useful.name),
                lib,
                code: useful.name,
                icon,
                pieces: useful.args.map(arg => ({
                    type: 'argument' as const,
                    key: arg.name,
                    typeHint: arg.type
                })),
                jsTemplate: () => `${useful.name}();`
            };
        }
        const pieces: blockPiece[] = [];
        if (useful.kind === 'function' && useful.args.length) {
            pieces.push(...useful.args.map(arg => ({
                type: 'argument' as const,
                key: arg.name,
                typeHint: arg.type
            })));
        }
        const draft = {
            type: 'computed',
            name: niceBlockName(useful.name, true),
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
    });
