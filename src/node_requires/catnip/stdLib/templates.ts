const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'move template',
    type: 'command',
    code: 'move template',
    icon: 'move',
    jsTemplate: () => 'this.move();',
    lib: 'core.templates',
    i18nKey: 'move template',
    pieces: []
}];

export default blocks;
