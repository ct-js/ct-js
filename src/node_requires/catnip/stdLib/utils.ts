const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'write property to self',
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
    name: 'write property to current room',
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
    name: 'write property to object',
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
    name: 'with object',
    type: 'command',
    code: 'with object',
    icon: 'crosshair',
    i18nKey: 'with object',
    jsTemplate: (vals) => `templates.with(${vals.object}, function() {${vals.blocks}});`,
    lib: 'core.utils',
    pieces: [{
        type: 'argument',
        key: 'object',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'blocks',
        key: 'blocks'
    }]
}, {
    name: 'convert to string',
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
}];

export default blocks;
