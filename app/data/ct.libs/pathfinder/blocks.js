module.exports = [{
    name: 'Set walkable cells and their costs',
    displayName: 'Set walkable cells and their costs for a map',
    code: 'pathfinder setCosts',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'options',
        options: [],
        allowCustom: true,
        buttonLabel: 'Cost mapping',
        buttonLabel_Ru: 'Сопоставление стоимости',
        customKeysType: 'number',
        customValuesType: 'number'
    }],
    jsTemplate: (values, index, options) => {
        const cells = Object.keys(options).map(k => Number(k));
        const cellValues = Object.values(options)
            .map(v => Number(v))
            .map((v, index) => `${values.map}.setTileCost(${cells[index]}, ${v})`);
        return `
            ${values.map}.setAcceptableTiles([${cells.join(', ')}]);
            ${cellValues.join('\n')}
        `;
    }
}, {
    name: 'Set a map\'s grid',
    displayName: 'Set a grid of map',
    code: 'pathfinder setGrid',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'to'
    }, {
        type: 'argument',
        key: 'grid',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: values => `
        ${values.map}.setGrid(${values.grid});
        ${values.map}.grid = ${values.grid};
    `
}, {
    name: 'Fill a map\'s grid by a collision group',
    displayName: 'Fill',
    code: 'pathfinder generateBasic',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'by a collision group'
    }, {
        type: 'argument',
        key: 'group',
        typeHint: 'string',
        required: true
    }, {
        type: 'label',
        name: 'with cell size'
    }, {
        type: 'argument',
        key: 'cellWidth',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: '×'
    }, {
        type: 'argument',
        key: 'cellHeight',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: 'and grid size'
    }, {
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
        type: 'options',
        options: [{
            key: 'startingX',
            name: 'Starting X',
            typeHint: 'number',
            defaultConstant: '0',
            required: false
        }, {
            key: 'startingY',
            name: 'Starting Y',
            typeHint: 'number',
            defaultConstant: '0',
            required: false
        }, {
            key: 'walkable',
            name: 'Walkable value',
            typeHint: 'number',
            defaultConstant: '1',
            required: false
        }, {
            key: 'occupied',
            name: 'Occupied value',
            typeHint: 'number',
            defaultConstant: '0',
            required: false
        }, {
            key: 'fast',
            name: 'Fast collision checks',
            typeHint: 'boolean',
            defaultConstant: 'true',
            required: false
        }]
    }],
    jsTemplate: values => `pathfinder.generateBasic(${values.map}, ${values.group}, {
        mapCols: ${values.columns},
        mapRows: ${values.rows},
        startingX: ${values.startingX === 'undefined' ? '0' : values.startingX},
        startingY: ${values.startingY === 'undefined' ? '0' : values.startingY},
        cellWidth: ${values.cellWidth},
        cellHeight: ${values.cellHeight},
        walkable: ${values.walkable === 'undefined' ? '1' : values.walkable},
        occupied: ${values.occupied === 'undefined' ? '0' : values.occupied},
        fast: ${values.fast || 'true'}
    });`
}, {
    name: 'Fill a map\'s grid by collision groups',
    displayName: 'Fill',
    code: 'pathfinder generateAdvanced',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'by collision groups with cell size'
    }, {
        type: 'argument',
        key: 'cellWidth',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: '×'
    }, {
        type: 'argument',
        key: 'cellHeight',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: 'and grid size'
    }, {
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
        type: 'options',
        allowCustom: true,
        buttonLabel: 'Settings & Collisions mapping',
        buttonLabel_Ru: 'Настройки и сопоставление групп',
        customKeysType: 'string',
        customValuesType: 'number',
        customHeader: 'Collision group mapping',
        customHeader_Ru: 'Сопоставление групп столкновений',
        options: [{
            key: 'startingX',
            name: 'Starting X',
            typeHint: 'number',
            defaultConstant: '0',
            required: false
        }, {
            key: 'startingY',
            name: 'Starting Y',
            typeHint: 'number',
            defaultConstant: '0',
            required: false
        }, {
            key: 'freeCells',
            name: 'Value for free cells',
            typeHint: 'number',
            defaultConstant: '1',
            required: false
        }, {
            key: 'fast',
            name: 'Fast collision checks',
            typeHint: 'boolean',
            defaultConstant: 'true',
            required: false
        }]
    }],
    jsTemplate: (values, index, custom) => {
        const queries = Object.entries(custom)
            .map(([key, value]) => `${JSON.stringify(key)}: ${value}`)
            .join(',\n');
        return `pathfinder.generateAdvanced(${values.map}, {
    mapCols: ${values.columns},
    mapRows: ${values.rows},
    startingX: ${values.startingX === 'undefined' ? '0' : values.startingX},
    startingY: ${values.startingY === 'undefined' ? '0' : values.startingY},
    cellWidth: ${values.cellWidth},
    cellHeight: ${values.cellHeight},
    freeCells: ${values.freeCells === 'undefined' ? '1' : Number(values.freeCells)},
    queries: {
        ${queries}
    },
    fast: ${values.fast || 'true'}
});`;
    }
}, {
    name: 'Avoid additional cell',
    displayName: 'Avoid additional cell of map',
    code: 'pathfinder avoidCell',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
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
    }],
    jsTemplate: (values) => `${values.map}.avoidAdditionalPoint(${values.column}, ${values.row});`
}, {
    name: 'Stop avoiding additional cell',
    displayName: 'Stop avoiding additional cell of map',
    code: 'pathfinder stopAvoidingCell',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
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
    }],
    jsTemplate: (values) => `${values.map}.stopAvoidingAdditionalPoint(${values.column}, ${values.row});`
}, {
    name: 'Stop avoiding all additional points',
    displayName: 'Stop avoiding all additional points in map',
    code: 'pathfinder stopAvoidingAll',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (values) => `${values.map}.stopAvoidingAllAdditionalPoints();`
}, {
    name: 'Override cost of a cell',
    displayName: 'Override cost of a cell of map',
    code: 'pathfinder overrideCost',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
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
        name: 'with cost'
    }, {
        type: 'argument',
        key: 'cost',
        typeHint: 'number',
        required: true
    }],
    jsTemplate: (values) => `${values.map}.setAdditionalPointCost(${values.column}, ${values.row}, ${values.cost});`
}, {
    name: 'Unset cell cost',
    displayName: 'Unset cell cost of map',
    code: 'pathfinder unsetCost',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at',
        i18nKey: 'atPosition'
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
    }],
    jsTemplate: (values) => `${values.map}.removeAdditionalPointCost(${values.column}, ${values.row});`
}, {
    name: 'Reset all cost overrides',
    displayName: 'Reset all cost overrides in map',
    code: 'pathfinder resetCosts',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (values) => `${values.map}.removeAllAdditionalPointCosts();`
}, {
    name: 'Find a path from my position to coordinates',
    displayName: 'Find a path with',
    code: 'pathfinder findPath coords',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'from my position to coordinates'
    }, {
        type: 'argument',
        key: 'x',
        typeHint: 'number',
        required: true
    }, {
        type: 'argument',
        key: 'y',
        typeHint: 'number',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store ID in'
    }, {
        type: 'argument',
        key: 'id',
        typeHint: 'number'
    }, {
        type: 'asyncMarker'
    }, {
        type: 'break'
    }, {
        type: 'icon',
        icon: 'redo'
    }, {
        type: 'label',
        name: 'then',
        i18nKey: 'then'
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store path in'
    }, {
        type: 'argument',
        key: 'path',
        typeHint: 'wildcard'
    }, {
        type: 'break'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'then'
    }, {
        type: 'icon',
        icon: 'alert-octagon'
    }, {
        type: 'label',
        name: 'If path wasn\'t found'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'catch'
    }],
    jsTemplate: (values, index) => `
        ${(values.id && values.id !== 'undefined') ? values.id + ' = ' : ''}pathfinder.findPathToCoord(${values.map}, this.x, this.y, ${values.x}, ${values.y}, (_p${index}) => {
            if (_p${index} === null) {
                ${values.catch}
            } else {
                ${values.path} = _p${index};
                ${values.then}
            }
        });
    `
}, {
    name: 'Find a path from my position to a cell',
    displayName: 'Find a path with',
    code: 'pathfinder findPath cell',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'from my position to a cell'
    }, {
        type: 'argument',
        key: 'column',
        typeHint: 'number',
        required: true
    }, {
        type: 'argument',
        key: 'row',
        typeHint: 'number',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store ID in'
    }, {
        type: 'argument',
        key: 'id',
        typeHint: 'number'
    }, {
        type: 'asyncMarker'
    }, {
        type: 'break'
    }, {
        type: 'icon',
        icon: 'redo'
    }, {
        type: 'label',
        name: 'then',
        i18nKey: 'then'
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store path in'
    }, {
        type: 'argument',
        key: 'path',
        typeHint: 'wildcard'
    }, {
        type: 'break'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'then'
    }, {
        type: 'icon',
        icon: 'alert-octagon'
    }, {
        type: 'label',
        name: 'If path wasn\'t found'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'catch'
    }],
    jsTemplate: (values, index) => `
    ${(values.id && values.id !== 'undefined') ? values.id + ' = ' : ''}pathfinder.findPathToCell(${values.map}, this.x / ${values.map}.cellWidth, this.y / ${values.map}.cellHeight, ${values.column}, ${values.row}, (_p${index}) => {
            if (_p${index} === null) {
                ${values.catch}
            } else {
                ${values.path} = _p${index};
                ${values.then}
            }
        });
    `
}, {
    name: 'Find a path to a cell',
    displayName: 'Find a path with',
    code: 'pathfinder findPath cell from to',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'from cell'
    }, {
        type: 'argument',
        key: 'columnFrom',
        typeHint: 'number',
        required: true
    }, {
        type: 'argument',
        key: 'rowFrom',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: 'to cell'
    }, {
        type: 'argument',
        key: 'columnTo',
        typeHint: 'number',
        required: true
    }, {
        type: 'argument',
        key: 'rowTo',
        typeHint: 'number',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store ID in'
    }, {
        type: 'argument',
        key: 'id',
        typeHint: 'number'
    }, {
        type: 'asyncMarker'
    }, {
        type: 'break'
    }, {
        type: 'icon',
        icon: 'redo'
    }, {
        type: 'label',
        name: 'then',
        i18nKey: 'then'
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store path in'
    }, {
        type: 'argument',
        key: 'path',
        typeHint: 'wildcard'
    }, {
        type: 'break'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'then'
    }, {
        type: 'icon',
        icon: 'alert-octagon'
    }, {
        type: 'label',
        name: 'If path wasn\'t found'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'catch'
    }],
    jsTemplate: (values, index) => `
    ${(values.id && values.id !== 'undefined') ? values.id + ' = ' : ''}pathfinder.findPathToCell(${values.map}, ${values.columnFrom}, ${values.rowFrom}, ${values.columnTo}, ${values.rowTo}, (_p${index}) => {
            if (_p${index} === null) {
                ${values.catch}
            } else {
                ${values.path} = _p${index};
                ${values.then}
            }
        });
    `
}, {
    name: 'Find a path to coordinates',
    displayName: 'Find a path with',
    code: 'pathfinder findPath coordinates from to',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'from position'
    }, {
        type: 'argument',
        key: 'xFrom',
        typeHint: 'number',
        required: true
    }, {
        type: 'argument',
        key: 'yFrom',
        typeHint: 'number',
        required: true
    }, {
        type: 'label',
        name: 'to position'
    }, {
        type: 'argument',
        key: 'xTo',
        typeHint: 'number',
        required: true
    }, {
        type: 'argument',
        key: 'yTo',
        typeHint: 'number',
        required: true
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store ID in'
    }, {
        type: 'argument',
        key: 'id',
        typeHint: 'number'
    }, {
        type: 'asyncMarker'
    }, {
        type: 'break'
    }, {
        type: 'icon',
        icon: 'redo'
    }, {
        type: 'label',
        name: 'then',
        i18nKey: 'then'
    }, {
        type: 'filler'
    }, {
        type: 'label',
        name: 'store path in'
    }, {
        type: 'argument',
        key: 'path',
        typeHint: 'wildcard'
    }, {
        type: 'break'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'then'
    }, {
        type: 'icon',
        icon: 'alert-octagon'
    }, {
        type: 'label',
        name: 'If path wasn\'t found'
    }, {
        type: 'blocks',
        placeholder: 'doNothing',
        key: 'catch'
    }],
    jsTemplate: (values, index) => `
    ${(values.id && values.id !== 'undefined') ? values.id + ' = ' : ''}pathfinder.findPathToCoordinates(${values.map}, ${values.xFrom}, ${values.yFrom}, ${values.xTo}, ${values.yTo}, (_p${index}) => {
            if (_p${index} === null) {
                ${values.catch}
            } else {
                ${values.path} = _p${index};
                ${values.then}
            }
        });
    `
}, {
    code: 'pathfinder cancelPath',
    name: 'Cancel path calculation',
    displayName: 'Cancel path calculation of map',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'with ID'
    }, {
        type: 'argument',
        key: 'id',
        typeHint: 'number',
        required: true
    }],
    jsTemplate: (values) => `${values.map}.cancelPath(${values.id});`
}, {
    code: 'pathfinder calculate',
    name: 'Calculate paths',
    displayName: 'Calculate paths of',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (values) => `${values.map}.calculate();`
}, {
    code: 'pathfinder setIterationCount',
    name: 'Set iteration count per calculation',
    displayName: 'Set iteration count of',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'per calculation to'
    }, {
        type: 'argument',
        key: 'iterations',
        typeHint: 'number',
        required: true
    }],
    jsTemplate: (values) => `${values.map}.setIterationsPerCalculation(${values.iterations});`
}, {
    code: 'pathfinder retrieve cell',
    name: 'Retrieve path point as a cell',
    displayName: 'Retrieve a point from',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'path',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at index'
    }, {
        type: 'argument',
        key: 'index',
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
        key: 'column',
        typeHint: 'number'
    }, {
        type: 'argument',
        key: 'row',
        typeHint: 'number'
    }],
    jsTemplate: (values) => `({ x: ${values.column}, y: ${values.row} } = ${values.path}[${values.index}]);`
}, {
    code: 'pathfinder retrieve coordinate',
    name: 'Retrieve path point as coordinates',
    displayName: 'Retrieve a point as game coordinates from',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'path',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'of'
    }, {
        type: 'argument',
        key: 'map',
        typeHint: 'wildcard',
        required: true
    }, {
        type: 'label',
        name: 'at index'
    }, {
        type: 'argument',
        key: 'index',
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
        key: 'x',
        typeHint: 'number'
    }, {
        type: 'argument',
        key: 'y',
        typeHint: 'number'
    }],
    jsTemplate: (values) => `{
        const { x: _x, y: _y } = ${values.path}[${values.index}];
        const coords = pathfinder.toCoordinates(${values.map}, _x, _y);
        ${values.x} = coords.x;
        ${values.y} = coords.y;
    }`
}, {
    code: 'pathfinder destroy debug graphic',
    name: 'Destroy debug graphic',
    displayName: 'Destroy debug graphic',
    type: 'command',
    pieces: [{
        type: 'argument',
        key: 'graphic',
        typeHint: 'wildcard',
        required: true
    }],
    jsTemplate: (values) => `{
        ${values.graphic}.destroy();
    }`
}];
