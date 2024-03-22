const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'Kill copy',
    type: 'command',
    code: 'kill',
    icon: 'template',
    i18nKey: 'kill copy',
    jsTemplate: () => 'this.kill = true;',
    lib: 'core.templates',
    pieces: []
}];

export default blocks;
