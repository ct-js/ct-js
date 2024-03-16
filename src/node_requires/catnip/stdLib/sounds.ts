const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'play a sound',
    type: 'command',
    code: 'sound play',
    icon: 'music',
    jsTemplate: (values) => `sounds.play('${values.sound}')`,
    lib: 'core.sounds',
    i18nKey: 'soundPlay',
    pieces: [{
        type: 'argument',
        key: 'sound',
        typeHint: 'string',
        required: true,
        assets: 'sound'
    }]
}, {
    name: 'sound 3d at current location',
    type: 'command',
    code: 'sound play 3d',
    icon: 'music',
    jsTemplate: (values) => `sounds.playAt('${values.sound}', this)`,
    lib: 'core.misc',
    i18nKey: 'plainJs',
    pieces: [{
        type: 'argument',
        key: 'sound',
        typeHint: 'string',
        required: true,
        assets: 'sound'
    }]
}];

export default blocks;
