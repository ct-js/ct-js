const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'Set property variable value',
    type: 'command',
    code: 'set',
    icon: 'edit',
    jsTemplate: (vals) => `${vals.var} = ${vals.value};`,
    lib: 'core.utils',
    i18nKey: 'set property',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'value',
        i18nKey: 'value'
    }, {
        type: 'argument',
        key: 'value',
        typeHint: 'wildcard',
        required: true
    }]
}, {
    name: 'Increase property variable',
    type: 'command',
    code: 'increase',
    icon: 'plus-circle',
    jsTemplate: (vals) => `${vals.var} += ${vals.val};`,
    lib: 'core.utils',
    i18nKey: 'increase',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'by',
        i18nKey: 'changeBy'
    }, {
        type: 'argument',
        key: 'val',
        typeHint: 'number',
        required: true
    }]
}, {
    name: 'Decrease property variable',
    type: 'command',
    code: 'decrease',
    icon: 'minus-circle',
    jsTemplate: (vals) => `${vals.var} -= ${vals.val};`,
    lib: 'core.utils',
    i18nKey: 'decrease',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'by',
        i18nKey: 'changeBy'
    }, {
        type: 'argument',
        key: 'val',
        typeHint: 'number',
        required: true
    }]
}, {
    name: 'Increment property variable',
    type: 'command',
    code: 'increment',
    icon: 'plus-circle',
    jsTemplate: (vals) => `${vals.var}++;`,
    lib: 'core.utils',
    i18nKey: 'increment',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }]
}, {
    name: 'Decrement property variable',
    type: 'command',
    code: 'decrement',
    icon: 'minus-circle',
    jsTemplate: (vals) => `${vals.var}++;`,
    lib: 'core.utils',
    i18nKey: 'decrement',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }]
}, {
    name: 'Write property to self',
    type: 'command',
    code: 'this write',
    icon: 'edit',
    jsTemplate: (vals) => `this[${vals.property}] = ${vals.value};`,
    lib: 'core.utils',
    i18nKey: 'this write',
    pieces: [{
        type: 'argument',
        key: 'property',
        typeHint: 'string',
        required: true
    }, {
        type: 'label',
        name: 'value',
        i18nKey: 'value'
    }, {
        type: 'argument',
        key: 'value',
        typeHint: 'wildcard',
        required: true
    }]
}, {
    name: 'Write property to current room',
    type: 'command',
    code: 'current room write',
    icon: 'edit',
    jsTemplate: (vals) => `rooms.current[${vals.property}] = ${vals.value};`,
    lib: 'core.utils',
    i18nKey: 'current room write',
    pieces: [{
        type: 'argument',
        key: 'property',
        typeHint: 'string',
        required: true
    }, {
        type: 'label',
        name: 'value',
        i18nKey: 'value'
    }, {
        type: 'argument',
        key: 'value',
        typeHint: 'wildcard',
        required: true
    }]
}, {
    name: 'Write property to object',
    type: 'command',
    code: 'object write',
    icon: 'edit',
    jsTemplate: (vals) => `${vals.object}[${vals.property}] = ${vals.value};`,
    lib: 'core.utils',
    i18nKey: 'write property to object',
    pieces: [{
        type: 'argument',
        key: 'object',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'property',
        i18nKey: 'property'
    }, {
        type: 'argument',
        key: 'property',
        typeHint: 'string',
        required: true
    }, {
        type: 'label',
        name: 'value',
        i18nKey: 'value'
    }, {
        type: 'argument',
        key: 'value',
        typeHint: 'wildcard',
        required: true
    }]
}, {
    name: 'read property from self',
    type: 'computed',
    lib: 'core.utils',
    code: 'this read',
    icon: 'edit',
    i18nKey: 'this read',
    pieces: [{
        type: 'argument',
        key: 'property',
        typeHint: 'string',
        required: true
    }],
    jsTemplate: (vals) => `this[${vals.property}]`,
    typeHint: 'wildcard'
}, {
    name: 'read property from room',
    type: 'computed',
    lib: 'core.utils',
    code: 'room read',
    icon: 'edit',
    i18nKey: 'room read',
    pieces: [{
        type: 'argument',
        key: 'property',
        typeHint: 'string',
        required: true
    }],
    jsTemplate: (vals) => `rooms.current[${vals.property}]`,
    typeHint: 'wildcard'
}, {
    name: 'read property from object',
    type: 'computed',
    lib: 'core.utils',
    code: 'object read',
    icon: 'edit',
    i18nKey: 'object read',
    pieces: [{
        type: 'argument',
        key: 'object',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'argument',
        key: 'property',
        typeHint: 'string',
        required: true
    }],
    jsTemplate: (vals) => `${vals.object}[${vals.property}]`,
    typeHint: 'wildcard'
}, {
    name: 'convert to string',
    i18nKey: 'convert to string',
    type: 'computed',
    code: 'convert to string',
    icon: 'string',
    jsTemplate: (values) => `String(${values.val})`,
    lib: 'core.utils',
    pieces: [{
        type: 'argument',
        key: 'val',
        typeHint: 'wildcard',
        required: true
    }],
    typeHint: 'string'
}, {
    name: 'convert to number',
    i18nKey: 'convert to number',
    type: 'computed',
    code: 'convert to number',
    icon: 'sort-numerically',
    jsTemplate: (values) => `Number(${values.val})`,
    lib: 'core.utils',
    pieces: [{
        type: 'argument',
        key: 'val',
        typeHint: 'wildcard',
        required: true
    }],
    typeHint: 'number'
}, {
    name: 'convert to boolean',
    i18nKey: 'convert to boolean',
    type: 'computed',
    code: 'convert to boolean',
    icon: 'sort-numerically',
    jsTemplate: (values) => `Boolean(${values.val})`,
    lib: 'core.utils',
    pieces: [{
        type: 'argument',
        key: 'val',
        typeHint: 'wildcard',
        required: true
    }],
    typeHint: 'number'
}];

export default blocks;
