const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'move template',
    type: 'command',
    code: 'move template',
    icon: 'move',
    jsTemplate: () => 'this.move();',
    lib: 'core.templates',
    i18nKey: 'move template',
    pieces: []
}, {
    name: 'kill remove copy',
    type: 'command',
    code: 'kill',
    icon: 'template',
    jsTemplate: () => 'this.kill = true;',
    lib: 'core.templates',
    i18nKey: 'kill',
    pieces: []
}];

export default blocks;
