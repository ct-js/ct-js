module.exports = [{
    name: 'Move this copy along a line stopping at',
    name_Ru: 'Переместиться по линии, останавливаясь перед группой',
    type: 'command',
    code: 'move template bullet',
    icon: 'move',
    category: 'Movement',
    pieces: [{
        type: 'argument',
        key: 'cgroup',
        typeHint: 'string',
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
    jsTemplate: (values) => {
        if (values.return !== 'undefined') {
            return `${values.return} = this.moveBullet(${values.cgroup}, ${values.precision || 1});`;
        }
        return `this.moveBullet(${values.cgroup}, ${values.precision || 1});`;
    }
}, {
    name: 'Move this copy stopping at',
    name_Ru: 'Переместиться, останавливаясь перед группой',
    type: 'command',
    code: 'move template smart',
    icon: 'move',
    category: 'Movement',
    pieces: [{
        type: 'argument',
        key: 'cgroup',
        typeHint: 'string',
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
    jsTemplate: (values) => {
        if (values.return !== 'undefined') {
            return `${values.return} = this.moveSmart(${values.cgroup}, ${values.precision || 1});`;
        }
        return `this.moveSmart(${values.cgroup}, ${values.precision || 1});`;
    }
}, {
    name: 'Move this copy along a line stopping at colliding groups',
    type: 'command',
    code: 'move template bullet with default groups',
    icon: 'move',
    category: 'Movement',
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
    jsTemplate: (values) => {
        if (values.return !== 'undefined') {
            return `${values.return} = this.moveBullet(undefined, ${values.precision || 1});`;
        }
        return `this.moveBullet(undefined, ${values.precision || 1});`;
    }
}, {
    name: 'Move this copy stopping at colliding groups',
    type: 'command',
    code: 'move template smart with default groups',
    icon: 'move',
    category: 'Movement',
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
    jsTemplate: (values) => {
        if (values.return !== 'undefined') {
            return `${values.return} = this.moveSmart(undefined, ${values.precision || 1});`;
        }
        return `this.moveSmart(undefined, ${values.precision || 1});`;
    }
}, {
    name: 'Add colliding group',
    type: 'command',
    code: 'add default colliding group',
    icon: 'move',
    category: 'Movement',
    pieces: [{
        type: 'argument',
        key: 'cgroup',
        typeHint: 'string',
        required: true
    }, {
        type: 'filler'
    }],
    jsTemplate: (values) => {
        return `this.defaultCollidingCGroups.add(${values.cgroup});`;
    }
}, {
    name: 'Remove colliding group',
    type: 'command',
    code: 'remove default colliding group',
    icon: 'move',
    category: 'Movement',
    pieces: [{
        type: 'argument',
        key: 'cgroup',
        typeHint: 'string',
        required: true
    }, {
        type: 'filler'
    }],
    jsTemplate: (values) => {
        return `this.defaultCollidingCGroups.delete(${values.cgroup});`;
    }
}, {
    name: 'Clear colliding groups',
    type: 'command',
    code: 'clear default colliding groups',
    icon: 'move',
    category: 'Movement',
    pieces: [],
    jsTemplate: (values) => {
        return `this.defaultCollidingCGroups.clear();`;
    }
}];
