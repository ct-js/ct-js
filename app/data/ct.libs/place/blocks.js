module.exports = [{
    name: 'Move along a line stopping at everything',
    name_Ru: 'Переместиться по линии, останавливаясь перед всем',
    type: 'command',
    code: 'move template bullet all',
    icon: 'move',
    category: 'Movement',
    pieces: [{
        type: 'label',
        name: 'with precision',
        name_Ru: 'с точностью'
    }, {
        type: 'argument',
        key: 'precision',
        typeHint: 'number',
        required: false
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
            return `${values.return} = this.moveBullet(${values.precision || 1});`;
        }
        return `this.moveBullet(${values.precision || 1});`;
    }
}, {
    name: 'Move stopping at everything',
    name_Ru: 'Переместиться, останавливаясь перед всем',
    type: 'command',
    code: 'move template smart all',
    icon: 'move',
    category: 'Movement',
    pieces: [{
        type: 'label',
        name: 'with precision',
        name_Ru: 'с точностью'
    }, {
        type: 'argument',
        key: 'precision',
        typeHint: 'number',
        required: false
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
    name: 'Move along a line stopping at specific group',
    name_Ru: 'Переместиться по линии, останавливаясь перед опр. группой',
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
        type: 'label',
        name: 'with precision',
        name_Ru: 'с точностью'
    }, {
        type: 'argument',
        key: 'precision',
        typeHint: 'number',
        required: false
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
    name: 'Move stopping at',
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
        type: 'label',
        name: 'with precision',
        name_Ru: 'с точностью'
    }, {
        type: 'argument',
        key: 'precision',
        typeHint: 'number',
        required: false
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
}];
