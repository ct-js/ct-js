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
      boolOperators = ['<', '<=', '>', '>='];

const blocks: (IBlockComputedDeclaration | IBlockCommandDeclaration)[] = [{
    name: 'Increase property variable',
    type: 'command',
    code: 'increase',
    icon: 'plus-circle',
    jsTemplate: (vals) => `${vals.var} += ${vals.val};`,
    lib: 'core.math',
    i18nKey: 'increase',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'by',
        i18nKey: 'changeBy'
    }, {
        type: 'argument',
        key: 'val',
        typeHint: 'number',
        required: true
    }]
},
{
    name: 'Decrease property variable',
    type: 'command',
    code: 'decrease',
    icon: 'minus-circle',
    jsTemplate: (vals) => `${vals.var} -= ${vals.val};`,
    lib: 'core.math',
    i18nKey: 'decrease',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'by',
        i18nKey: 'changeBy'
    }, {
        type: 'argument',
        key: 'val',
        typeHint: 'number',
        required: true
    }]
},
{
    name: 'Increment property variable',
    type: 'command',
    code: 'increment',
    icon: 'plus-circle',
    jsTemplate: (vals) => `${vals.var}++;`,
    lib: 'core.math',
    i18nKey: 'increment',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }]
},
{
    name: 'Decrement property variable',
    type: 'command',
    code: 'decrement',
    icon: 'minus-circle',
    jsTemplate: (vals) => `${vals.var}++;`,
    lib: 'core.math',
    i18nKey: 'decrement',
    pieces: [{
        type: 'argument',
        key: 'var',
        typeHint: 'wildcard',
        required: true
    }]
},
...numberOperators.map((operator) => makeOperator(operator, 'number')),
...boolOperators.map((operator) => makeOperator(operator, 'boolean')),
{
    name: 'convert to number',
    i18nKey: 'convert to number',
    type: 'computed',
    code: 'convert to number',
    icon: 'sort-numerically',
    jsTemplate: (values) => `Number(${values.val})`,
    lib: 'core.utils',
    pieces: [{
        type: 'argument',
        key: 'val',
        typeHint: 'wildcard',
        required: true
    }],
    typeHint: 'number'
}];

export default blocks;
