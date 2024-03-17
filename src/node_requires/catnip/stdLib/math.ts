const makeOperator = (operator: string, type: blockArgumentType): IBlockComputedDeclaration => ({
    name: operator,
    code: operator,
    icon: type === 'boolean' ? 'help-circle' : 'hash',
    type: 'computed',
    typeHint: type,
    hideIcon: true,
    hideLabel: true,
    jsTemplate: (vals) => `(${vals.a} ${operator} ${vals.b})`,
    lib: 'core.math',
    pieces: [{
        type: 'argument',
        key: 'a',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: operator
    }, {
        type: 'argument',
        key: 'b',
        typeHint: 'number',
        required: true
    }]
});

const numberOperators = ['+', '-', '*', '/', '%'],
      boolOperators = ['===', '!==', '<', '<=', '>', '>='];

const blocks: IBlockComputedDeclaration[] = [
    ...numberOperators.map((operator) => makeOperator(operator, 'number')),
    ...boolOperators.map((operator) => makeOperator(operator, 'boolean'))
];

export default blocks;
