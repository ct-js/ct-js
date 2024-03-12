import {usableDeclaration} from './declarationExtractor';

export const convertFromDtsToBlocks = (usefuls: usableDeclaration[], lib: 'core' | string, icon = 'grid-random'):
(IBlockCommandDeclaration | IBlockComputedDeclaration)[] =>
    usefuls.map(useful => {
        if (useful.kind === 'function' && (!useful.returnType || useful.returnType === 'void')) {
            return {
                type: 'command',
                name: useful.name,
                lib,
                code: useful.name,
                icon,
                pieces: [{
                    type: 'label',
                    name: useful.name.replace(/\._/g, ' '),
                    i18nKey: useful.name
                }, ...useful.args.map(arg => ({
                    type: 'argument' as const,
                    key: arg.name,
                    typeHint: arg.type
                }))],
                jsTemplate: () => `${useful.name}();`
            };
        }
        const pieces: blockPiece[] = [{
            type: 'label',
            name: useful.name.replace(/\._/g, ' '),
            i18nKey: useful.name
        }];
        if (useful.kind === 'function' && useful.args.length) {
            pieces.push(...useful.args.map(arg => ({
                type: 'argument' as const,
                key: arg.name,
                typeHint: arg.type
            })));
        }
        const draft = {
            type: 'computed',
            name: useful.name,
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
