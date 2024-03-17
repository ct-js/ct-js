const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'variable',
    hideLabel: true,
    type: 'computed',
    typeHint: 'wildcard',
    code: 'variable',
    icon: 'clock',
    jsTemplate: (values) => values.variableName,
    lib: 'core.hidden',
    i18nKey: 'note',
    pieces: [{
        type: 'propVar'
    }],
    customClass: 'userdefined'
}, {
    name: 'property',
    hideLabel: true,
    type: 'computed',
    typeHint: 'wildcard',
    code: 'property',
    icon: 'archive',
    jsTemplate: (values) => `this['${values.variableName}']`,
    lib: 'core.hidden',
    i18nKey: 'note',
    pieces: [{
        type: 'propVar'
    }],
    customClass: 'userdefined'
}];

export default blocks;
