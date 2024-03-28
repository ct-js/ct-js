const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'Set texture',
    type: 'command',
    code: 'set texture',
    icon: 'droplet',
    jsTemplate: (vals) => `this.tex = ${vals.texture};`,
    lib: 'core.appearance',
    i18nKey: 'set texture',
    pieces: [{
        type: 'argument',
        key: 'texture',
        typeHint: 'string',
        assets: 'texture',
        required: true
    }]
}, {
    name: 'Set scale',
    type: 'command',
    code: 'set scale',
    icon: 'droplet',
    jsTemplate: (vals) => `this.scale.x = this.scale.y = ${vals.scale};`,
    lib: 'core.appearance',
    i18nKey: 'set scale',
    pieces: [{
        type: 'argument',
        key: 'scale',
        typeHint: 'number',
        required: true
    }]
}, {
    name: 'Set scale',
    type: 'command',
    code: 'set scale xy',
    icon: 'droplet',
    jsTemplate: (vals) => `this.scale.set(${vals.x}, ${vals.y});`,
    lib: 'core.appearance',
    i18nKey: 'set scale xy',
    pieces: [{
        type: 'argument',
        key: 'x',
        typeHint: 'number',
        required: true
    }, {
        type: 'argument',
        key: 'y',
        typeHint: 'number',
        required: true
    }]
}, {
    name: 'Set texture angle',
    type: 'command',
    code: 'set angle',
    icon: 'droplet',
    jsTemplate: (vals) => `this.angle = ${vals.degrees};`,
    lib: 'core.appearance',
    i18nKey: 'set angle',
    pieces: [{
        type: 'argument',
        key: 'degrees',
        typeHint: 'number',
        required: true
    }]
}, {
    name: 'Set opacity',
    type: 'command',
    code: 'set alpha',
    icon: 'droplet',
    jsTemplate: (vals) => `this.alpha = ${vals.value};`,
    lib: 'core.appearance',
    i18nKey: 'set alpha',
    pieces: [{
        type: 'argument',
        key: 'value',
        typeHint: 'number',
        required: true
    }]
}, {
    name: 'Set depth',
    type: 'command',
    code: 'set depth',
    icon: 'droplet',
    jsTemplate: (vals) => `this.zIndex = ${vals.value};`,
    lib: 'core.appearance',
    i18nKey: 'set depth',
    pieces: [{
        type: 'argument',
        key: 'value',
        typeHint: 'number',
        required: true
    }]
}, {
    name: 'get texture',
    type: 'computed',
    code: 'get texture',
    icon: 'droplet',
    jsTemplate: () => 'this.tex',
    lib: 'core.appearance',
    i18nKey: 'texture',
    pieces: [],
    typeHint: 'string'
}, {
    name: 'get scale by x',
    type: 'computed',
    code: 'get scale x',
    icon: 'droplet',
    jsTemplate: () => 'this.scale.x',
    lib: 'core.appearance',
    i18nKey: 'scale x',
    pieces: [],
    typeHint: 'number'
}, {
    name: 'get scale by y',
    type: 'computed',
    code: 'get scale y',
    icon: 'droplet',
    jsTemplate: () => 'this.scale.y',
    lib: 'core.appearance',
    i18nKey: 'scale y',
    pieces: [],
    typeHint: 'number'
}, {
    name: 'get texture angle',
    type: 'computed',
    code: 'get angle',
    icon: 'droplet',
    jsTemplate: () => 'this.angle',
    lib: 'core.appearance',
    i18nKey: 'get angle',
    pieces: [],
    typeHint: 'number'
}, {
    name: 'get opacity',
    type: 'computed',
    code: 'get alpha',
    icon: 'droplet',
    jsTemplate: () => 'this.alpha',
    lib: 'core.appearance',
    i18nKey: 'get alpha',
    pieces: [],
    typeHint: 'number'
}, {
    name: 'get depth',
    type: 'computed',
    code: 'get depth',
    icon: 'droplet',
    jsTemplate: () => 'this.zIndex',
    lib: 'core.appearance',
    i18nKey: 'get depth',
    pieces: [],
    typeHint: 'number'
}];

export default blocks;
