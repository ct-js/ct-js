const blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[] = [{
    code: 'array create',
    name: 'Create a new empty array',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'array create',
    pieces: [{
        type: 'filler'
    }, {
        type: 'label',
        name: 'store in',
        i18nKey: 'store in'
    }, {
        type: 'argument',
        key: 'return',
        typeHint: 'wildcard'
    }],
    jsTemplate: (vals) => `${vals.return} = [];`
}, {
    code: 'array set element',
    name: 'Set an element of an array',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'array set element',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
    }, {
        type: 'argument',
        key: 'index',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: 'to',
        i18nKey: 'toWrite'
    }, {
        type: 'argument',
        key: 'value',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}[${vals.index}] = ${vals.value};`
}, {
    code: 'array unshift',
    name: 'add an element at start',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'array unshift',
    pieces: [{
        type: 'argument',
        key: 'elt',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'to',
        i18nKey: 'toWrite'
    }, {
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.unshift(${vals.elt})`
}, {
    code: 'array push',
    name: 'add an element at end',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'array push',
    pieces: [{
        type: 'argument',
        key: 'elt',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'to',
        i18nKey: 'toWrite'
    }, {
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.push(${vals.elt})`
}, {
    code: 'add element at position',
    name: 'add an element at position',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'add element at position',
    displayName: 'add an element',
    displayI18nKey: 'add element',
    pieces: [{
        type: 'argument',
        key: 'elt',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'to',
        i18nKey: 'toDestination'
    }, {
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at position',
        i18nKey: 'at position'
    }, {
        type: 'argument',
        key: 'position',
        typeHint: 'number',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.splice(${vals.position}, 0, ${vals.elt})`
}, {
    code: 'array pop',
    name: 'remove last element',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'array pop',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.pop()`
}, {
    code: 'array shift',
    name: 'remove first element',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'array shift',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.shift()`
}, {
    code: 'remove element',
    name: 'remove element from array',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'remove element from array',
    displayName: 'remove element',
    displayI18nKey: 'remove element',
    pieces: [{
        type: 'argument',
        key: 'elt',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'from',
        i18nKey: 'fromSource'
    }, {
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.splice(${vals.array}.indexOf(${vals.elt}), 1)`
}, {
    code: 'remove at position',
    name: 'remove element at position',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'remove at position',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
    }, {
        type: 'argument',
        key: 'position',
        typeHint: 'number',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.splice(${vals.position}, 1)`
}, {
    code: 'array clear',
    name: 'Clear array',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'clear array',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}.length = 0;`
}, {
    code: 'filter array',
    name: 'filter array',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'filter array',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'with results in',
        i18nKey: 'with results in'
    }, {
        type: 'argument',
        key: 'result',
        typeHint: 'boolean',
        required: true
    }, {
        type: 'label',
        name: 'and elements',
        i18nKey: 'and elements'
    }, {
        type: 'argument',
        key: 'elt',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store new array in',
        i18nKey: 'store new array in'
    }, {
        type: 'argument',
        key: 'return',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'blocks',
        key: 'loop'
    }],
    jsTemplate: (vals) => `${vals.return} = ${vals.array}.filter(elt => {
        ${vals.elt} = elt;
        ${vals.loop}
        return ${vals.result};
    });`
}, {
    code: 'map array',
    name: 'map array',
    type: 'command',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'map array',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'with results in',
        i18nKey: 'with results in'
    }, {
        type: 'argument',
        key: 'result',
        typeHint: 'boolean',
        required: true
    }, {
        type: 'label',
        name: 'and elements',
        i18nKey: 'and elements'
    }, {
        type: 'argument',
        key: 'elt',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store new array in',
        i18nKey: 'store new array in'
    }, {
        type: 'argument',
        key: 'return',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'blocks',
        key: 'loop'
    }],
    jsTemplate: (vals) => `${vals.return} = ${vals.array}.map(elt => {
        ${vals.elt} = elt;
        ${vals.loop}
        return ${vals.result};
    });`
}, {
    code: 'array create 2d',
    name: 'Create a new 2D array',
    type: 'command',
    icon: 'array-2d',
    lib: 'core.arrays',
    i18nKey: 'array create 2d',
    pieces: [{
        type: 'argument',
        key: 'columns',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: '×'
    }, {
        type: 'argument',
        key: 'rows',
        typeHint: 'number',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store in',
        i18nKey: 'store in'
    }, {
        type: 'argument',
        key: 'return',
        typeHint: 'wildcard'
    }],
    jsTemplate: (vals, index) => `${vals.return} = new Array(${vals.rows});
    for (let _i${index} = 0; _i${index} < ${vals.rows}; _i${index}++) {
        ${vals.return}[_i${index}] = new Array(${vals.columns});
    }`
}, {
    code: 'array 2d set element',
    name: 'Set element in 2D array',
    type: 'command',
    icon: 'array-2d',
    lib: 'core.arrays',
    i18nKey: 'array 2d set element',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'at'
    }, {
        type: 'argument',
        key: 'column',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: '×'
    }, {
        type: 'argument',
        key: 'row',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: 'set to',
        i18nKey: 'set to'
    }, {
        type: 'argument',
        key: 'value',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (vals) => `${vals.array}[${vals.row}][${vals.column}] = ${vals.value};`
}, {
    name: 'For each cell of 2d array',
    i18nKey: 'for each 2d',
    type: 'command',
    code: 'for each 2d',
    lib: 'core.logic',
    category: 'Logic',
    icon: 'rotate-cw',
    pieces: [{
        type: 'argument',
        key: 'array',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'with x as',
        i18nKey: 'with x as'
    }, {
        type: 'argument',
        key: 'x',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: 'and y as',
        i18nKey: 'and y as'
    }, {
        type: 'argument',
        key: 'y',
        typeHint: 'number',
        required: true
    }, {
        type: 'blocks',
        key: 'body'
    }],
    jsTemplate: (args, index) => `for (const _iy${index} of ${args.array}) {
        for (const _ix${index} of _iy${index}) {
            ${args.x} = _ix${index};
            ${args.y} = _iy${index};
            ${args.body}
        }
    }`
}, {
    code: 'array length',
    name: 'array length',
    type: 'computed',
    i18nKey: 'array length',
    displayName: 'length of',
    displayI18nKey: 'lengthOf',
    icon: 'array',
    lib: 'core.arrays',
    typeHint: 'number',
    pieces: [{
        key: 'array',
        type: 'argument',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (values) => `${values.array}.length`
}, {
    code: 'array 2d width',
    name: '2d array width',
    type: 'computed',
    i18nKey: 'array 2d width',
    displayName: 'width of',
    displayI18nKey: 'widthOf',
    icon: 'array-2d',
    lib: 'core.arrays',
    typeHint: 'number',
    pieces: [{
        key: 'array',
        type: 'argument',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (values) => `${values.array}[0].length`
}, {
    code: 'array 2d height',
    name: '2d array height',
    type: 'computed',
    i18nKey: 'array 2d height',
    displayName: 'height of',
    displayI18nKey: 'heightOf',
    icon: 'array-2d',
    lib: 'core.arrays',
    typeHint: 'number',
    pieces: [{
        key: 'array',
        type: 'argument',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (values) => `${values.array}.length`
}, {
    name: 'get array element',
    i18nKey: 'array get',
    type: 'computed',
    code: 'get',
    icon: 'array',
    lib: 'core.arrays',
    pieces: [{
        type: 'argument',
        key: 'obj',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
    }, {
        type: 'argument',
        key: 'index',
        typeHint: 'number',
        required: true
    }],
    jsTemplate: (values) => `${values.obj}[${values.index}]`,
    typeHint: 'wildcard'
}, {
    name: 'get array 2d element',
    i18nKey: 'array 2d get',
    type: 'computed',
    code: 'get 2d',
    icon: 'array-2d',
    lib: 'core.arrays',
    pieces: [{
        type: 'argument',
        key: 'obj',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
    }, {
        type: 'argument',
        key: 'x',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: '×'
    }, {
        type: 'argument',
        key: 'y',
        typeHint: 'number',
        required: true
    }],
    jsTemplate: (values) => `${values.obj}[${values.y}][${values.x}]`,
    typeHint: 'wildcard'
}, {
    name: 'new array',
    type: 'computed',
    code: 'new array',
    icon: 'array',
    lib: 'core.arrays',
    i18nKey: 'new array',
    pieces: [],
    typeHint: 'wildcard',
    jsTemplate: () => 'new Array()',
    customClass: 'constant'
}];

export default blocks;
