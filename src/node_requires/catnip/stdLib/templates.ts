const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'Kill copy',
    type: 'command',
    code: 'kill',
    icon: 'template',
    i18nKey: 'kill copy',
    jsTemplate: () => 'this.kill = true;',
    lib: 'core.templates',
    pieces: []
}, {
    name: 'is copy',
    type: 'computed',
    code: 'is copy',
    icon: 'template',
    lib: 'core.templates',
    i18nKey: 'is copy',
    typeHint: 'boolean',
    pieces: [{
        type: 'argument',
        typeHint: 'wildcard',
        key: 'copy',
        required: true
    }],
    jsTemplate: (values) => `templates.isCopy(${values.copy})`
}, {
    name: 'is valid',
    type: 'computed',
    code: 'is valid',
    icon: 'template',
    lib: 'core.templates',
    i18nKey: 'is valid',
    typeHint: 'boolean',
    pieces: [{
        type: 'argument',
        typeHint: 'wildcard',
        key: 'copy',
        required: true
    }],
    jsTemplate: (values) => `templates.valid(${values.copy})`
}];

export default blocks;
