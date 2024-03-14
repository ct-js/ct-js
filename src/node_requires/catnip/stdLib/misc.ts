const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'note',
    type: 'command',
    code: 'note',
    icon: 'message-circle',
    jsTemplate: (values) => `/* ${values.note} */`,
    lib: 'core.misc',
    i18nKey: 'note',
    pieces: [{
        type: 'textbox',
        key: 'note'
    }],
    customClass: 'note'
}, {
    name: 'execute plain js javascript code',
    type: 'command',
    code: 'js',
    icon: 'code-alt',
    jsTemplate: (values) => String(values.code),
    lib: 'core.misc',
    i18nKey: 'plainJs',
    pieces: [{
        type: 'code',
        key: 'code'
    }]
}];

export default blocks;
