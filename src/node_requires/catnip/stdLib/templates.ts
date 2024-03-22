const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    name: 'kill copy',
    type: 'command',
    code: 'kill',
    icon: 'template',
    jsTemplate: () => 'this.kill = true;',
    lib: 'core.templates'
}];

export default blocks;
