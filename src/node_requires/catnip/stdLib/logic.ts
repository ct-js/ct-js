const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'if else branch',
    displayName: 'If',
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
    displayName: 'While',
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
    name: 'repeat times',
    displayName: 'Repeat',
    type: 'command',
    code: 'repeat',
    icon: 'rotate-cw',
    jsTemplate: (args, safeId) => `for (let i${safeId} = 0; i${safeId} < ${args.N}; i${safeId}++) {\n    ${args.body}\n}`,
    lib: 'core.logic',
    i18nKey: 'repeat',
    pieces: [{
        type: 'argument',
        key: 'N',
        typeHint: 'number'
    }, {
        type: 'label',
        name: 'times',
        i18nKey: 'times'
    }, {
        type: 'blocks',
        key: 'body'
    }]
}, {
    name: 'repeat times tracking',
    displayName: 'Repeat',
    type: 'command',
    code: 'repeat tracking',
    icon: 'rotate-cw',
    jsTemplate: (args) => `for (${args.variableName} = 0; ${args.variableName} < ${args.N}; ${args.variableName}++) {\n    ${args.body}\n}`,
    lib: 'core.logic',
    i18nKey: 'repeat',
    pieces: [{
        type: 'argument',
        key: 'N',
        typeHint: 'number'
    }, {
        type: 'label',
        name: 'times',
        i18nKey: 'times'
    }, {
        type: 'label',
        name: 'with index variable',
        i18nKey: 'with index variable'
    }, {
        type: 'argument',
        key: 'variableName',
        typeHint: 'wildcard'
    }, {
        type: 'blocks',
        key: 'body'
    }]
}, {
    name: 'for each of array',
    displayName: 'For each',
    type: 'command',
    code: 'for each',
    icon: 'rotate-cw',
    jsTemplate: (args) => `for (${args.variableName} of ${args.array}) {\n    ${args.body}\n}`,
    lib: 'core.logic',
    i18nKey: 'repeat',
    pieces: [{
        type: 'argument',
        key: 'variableName',
        typeHint: 'wildcard'
    }, {
        type: 'label',
        name: 'of array',
        i18nKey: 'of array'
    }, {
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard'
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
}, {
    name: 'AND logic operator',
    type: 'computed',
    code: 'a AND b',
    icon: 'bool',
    lib: 'core.logic',
    i18nKey: 'AND logic operator',
    hideLabel: true,
    hideIcon: true,
    typeHint: 'boolean',
    pieces: [{
        type: 'argument',
        key: 'a',
        typeHint: 'boolean'
    }, {
        type: 'label',
        name: 'and',
        i18nKey: 'AND'
    }, {
        type: 'argument',
        key: 'b',
        typeHint: 'boolean'
    }],
    jsTemplate: (args) => `(${args.a} && ${args.b})`
}, {
    name: 'OR logic operator',
    type: 'computed',
    code: 'a OR b',
    icon: 'bool',
    lib: 'core.logic',
    i18nKey: 'OR logic operator',
    hideLabel: true,
    hideIcon: true,
    typeHint: 'boolean',
    pieces: [{
        type: 'argument',
        key: 'a',
        typeHint: 'boolean'
    }, {
        type: 'label',
        name: 'or',
        i18nKey: 'OR'
    }, {
        type: 'argument',
        key: 'b',
        typeHint: 'boolean'
    }],
    jsTemplate: (args) => `(${args.a} || ${args.b})`
}, {
    name: 'NOT logic operator',
    displayName: 'not',
    type: 'computed',
    code: 'NOT a',
    icon: 'bool',
    hideIcon: true,
    lib: 'core.logic',
    i18nKey: 'NOT logic operator',
    typeHint: 'boolean',
    pieces: [{
        type: 'argument',
        key: 'a',
        typeHint: 'boolean'
    }],
    jsTemplate: (args) => `!${args.a}`
}, {
    name: 'is',
    code: 'is',
    icon: 'help-circle',
    type: 'computed',
    typeHint: 'boolean',
    hideIcon: true,
    hideLabel: true,
    jsTemplate: (vals) => `(${vals.a} === ${vals.b})`,
    lib: 'core.logic',
    pieces: [{
        type: 'argument',
        key: 'a',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'is'
    }, {
        type: 'argument',
        key: 'b',
        typeHint: 'wildcard',
        required: true
    }]
}, {
    name: 'is not',
    code: 'is not',
    icon: 'help-circle',
    type: 'computed',
    typeHint: 'boolean',
    hideIcon: true,
    hideLabel: true,
    jsTemplate: (vals) => `(${vals.a} !== ${vals.b})`,
    lib: 'core.logic',
    pieces: [{
        type: 'argument',
        key: 'a',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'is not'
    }, {
        type: 'argument',
        key: 'b',
        typeHint: 'wildcard',
        required: true
    }]
}];

export default blocks;
