const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'Write property to self',
    type: 'command',
    code: 'this write',
    icon: 'code-alt',
    jsTemplate: (vals) => `this[${vals.property}] = ${vals.value};`,
    lib: 'core.objects',
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
    icon: 'code-alt',
    jsTemplate: (vals) => `rooms.current[${vals.property}] = ${vals.value};`,
    lib: 'core.objects',
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
    icon: 'code-alt',
    jsTemplate: (vals) => `${vals.object}[${vals.property}] = ${vals.value};`,
    lib: 'core.objects',
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
    lib: 'core.objects',
    code: 'this read',
    icon: 'code-alt',
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
    lib: 'core.objects',
    code: 'room read',
    icon: 'code-alt',
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
    lib: 'core.objects',
    code: 'object read',
    icon: 'code-alt',
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
    name: 'delete property in object',
    type: 'command',
    lib: 'core.objects',
    code: 'object delete',
    icon: 'code-alt',
    i18nKey: 'object delete',
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
    jsTemplate: (vals) => `delete ${vals.object}[${vals.property}];`
}, {
    name: 'new object',
    type: 'computed',
    code: 'new object',
    icon: 'code-alt',
    customClass: 'constant',
    jsTemplate: () => '{}',
    lib: 'core.objects',
    i18nKey: 'new object',
    pieces: [],
    typeHint: 'wildcard'
}];

export default blocks;
