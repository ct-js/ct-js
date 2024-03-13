const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'if else branch',
    type: 'command',
    code: 'if else branch',
    icon: 'help-circle',
    jsTemplate: (args) =>
        `if (${args.condition}) {\n    ${args.body1}\n} else {\n    ${args.body2}\n}`,
    lib: 'core.logic',
    i18nKey: 'if else branch',
    pieces: [{
        type: 'argument',
        key: 'condition',
        typeHint: 'boolean'
    }, {
        type: 'blocks',
        key: 'body1'
    }, {
        type: 'icon',
        icon: 'alert-circle'
    }, {
        type: 'label',
        name: 'else'
    }, {
        type: 'blocks',
        key: 'body2'
    }]
}, {
    name: 'while loop cycle',
    type: 'command',
    code: 'while loop cycle',
    icon: 'rotate-cw',
    jsTemplate: (args) => `while (${args.condition}) {\n    ${args.body}\n}`,
    lib: 'core.logic',
    i18nKey: 'while loop cycle',
    pieces: [{
        type: 'argument',
        key: 'condition',
        typeHint: 'boolean'
    }, {
        type: 'blocks',
        key: 'body'
    }]
}, {
    name: 'break loop',
    type: 'command',
    code: 'break loop',
    icon: 'log-out',
    jsTemplate: () => 'break;\n',
    lib: 'core.logic',
    i18nKey: 'break loop',
    pieces: []
}];

export default blocks;
