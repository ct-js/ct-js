const blocks: (IBlockCommandDeclaration)[] = [{
    code: 'u.loopOverEnumNames',
    lib: 'u',
    name: 'Loop over enumeration\'s keys',
    i18nKey: 'u loopOverEnumNames',
    displayName: 'Loop over keys of enumeration',
    displayI18nKey: 'u loopOverEnumNames',
    type: 'command',
    icon: 'rotate-cw',
    pieces: [{
        type: 'argument',
        assets: 'enum',
        key: 'enum',
        required: true,
        typeHint: 'wildcard'
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store in',
        i18nKey: 'store in'
    }, {
        type: 'argument',
        key: 'enumKey',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'blocks',
        key: 'body'
    }],
    jsTemplate: (values, index) => `u.eachEnumName(${values.enum}, keyName${index} => {
        ${values.enumKey} = keyName${index};
        ${values.body}
    });`
}, {
    code: 'u.loopOverEnumValues',
    lib: 'u',
    name: 'Loop over enumeration\'s values',
    i18nKey: 'u loopOverEnumValues',
    displayName: 'Loop over values of enumeration',
    displayI18nKey: 'u loopOverEnumValues',
    type: 'command',
    icon: 'rotate-cw',
    pieces: [{
        type: 'argument',
        assets: 'enum',
        key: 'enum',
        required: true,
        typeHint: 'wildcard'
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store in',
        i18nKey: 'store in'
    }, {
        type: 'argument',
        key: 'enumValue',
        typeHint: 'number',
        required: true
    }, {
        type: 'blocks',
        key: 'body'
    }],
    jsTemplate: (values, index) => `u.eachEnumValue(${values.enum}, valueName${index} => {
        ${values.enumValue} = valueName${index};
        ${values.body}
    });`
}];

export default blocks;
