const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'Variable',
    hideLabel: true,
    type: 'computed',
    typeHint: 'wildcard',
    code: 'variable',
    icon: 'clock',
    jsTemplate: (values) => values.variableName,
    lib: 'core.hidden',
    i18nKey: 'variable',
    pieces: [{
        type: 'propVar'
    }],
    customClass: 'userdefined'
}, {
    name: 'Property',
    hideLabel: true,
    type: 'computed',
    typeHint: 'wildcard',
    code: 'property',
    icon: 'archive',
    jsTemplate: (values) => `this['${values.variableName}']`,
    lib: 'core.hidden',
    i18nKey: 'property',
    pieces: [{
        type: 'propVar'
    }],
    customClass: 'userdefined'
}, {
    name: 'Behavior property',
    hideLabel: true,
    type: 'computed',
    typeHint: 'wildcard',
    code: 'behavior property',
    icon: 'behavior',
    jsTemplate: (values) => `this['${values.variableName}']`,
    lib: 'core.hidden',
    i18nKey: 'behavior property',
    pieces: [{
        type: 'propVar'
    }],
    customClass: 'userdefined'
}];

export default blocks;
