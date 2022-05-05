if ((this instanceof ct.templates.Copy) && this.inheritedType) {
    this.inherit = {
        onCreate: () => {
            const oldTemplate = this.template,
                  oldInherited = this.inheritedType;
            this.template = this.inheritedType;
            this.inheritedType = ct.templates.templates[this.inheritedType].extends.inheritedType;
            ct.templates.templates[oldInherited].onCreate.apply(this);
            this.template = oldTemplate;
            this.inheritedType = oldInherited;
        },
        onStep: () => {
            const oldTemplate = this.template,
                  oldInherited = this.inheritedType;
            this.template = this.inheritedType;
            this.inheritedType = ct.templates.templates[this.inheritedType].extends.inheritedType;
            ct.templates.templates[oldInherited].onStep.apply(this);
            this.template = oldTemplate;
            this.inheritedType = oldInherited;
        },
        onDraw: () => {
            const oldTemplate = this.template,
                  oldInherited = this.inheritedType;
            this.template = this.inheritedType;
            this.inheritedType = ct.templates.templates[this.inheritedType].extends.inheritedType;
            ct.templates.templates[oldInherited].onDraw.apply(this);
            this.template = oldTemplate;
            this.inheritedType = oldInherited;
        },
        onDestroy: () => {
            const oldTemplate = this.template,
                  oldInherited = this.inheritedType;
            this.template = this.inheritedType;
            this.inheritedType = ct.templates.templates[this.inheritedType].extends.inheritedType;
            ct.templates.templates[oldInherited].onDestroy.apply(this);
            this.template = oldTemplate;
            this.inheritedType = oldInherited;
        }
    };
}
