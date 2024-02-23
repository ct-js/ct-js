//
    @attribute room
    @attribute editor
    @attribute updatebg (riot function)
    @attribute history (History)
room-properties.npt(class="{opts.class}")
    collapsible-section.anInsetPanel(
        heading="{voc.viewportHeading}"
        defaultstate="opened"
        storestatekey="roomEditorViewport"
        hlevel="4"
    )
        fieldset
            .aPoint2DInput.compact.wide
                label
                    b {parent.voc.width}
                    br
                    input.wide(
                        type="number" min="1" step="8"
                        onfocus="{parent.rememberValue}"
                        oninput="{parent.wireAndRealign('opts.room.width')}"
                        onchange="{parent.recordChange(parent.opts.room, 'width')}"
                        value="{parent.opts.room.width}"
                    )
                .aSpacer
                label
                    b {parent.voc.height}
                    br
                    input.wide(
                        type="number" min="1" step="8"
                        onfocus="{parent.rememberValue}"
                        oninput="{parent.wireAndRealign('opts.room.height')}"
                        onchange="{parent.recordChange(parent.opts.room, 'height')}"
                        value="{parent.opts.room.height}"
                    )
        fieldset
            b {parent.voc.followTemplate}
            docs-shortcut.toright(
                title="{parent.voc.followCodeHint}"
                path="/tips-n-tricks/viewport-management.html#following-a-copy"
            )
            asset-input.wide(
                assettypes="template"
                allowclear="allowclear"
                compact="compact"
                assetid="{parent.opts.room.follow}"
                onchanged="{parent.setFollow}"
            )
        fieldset
            label.checkbox
                input(
                    type="checkbox"
                    checked="{parent.opts.room.restrictCamera}"
                    onchange="{parent.handleToggle(parent.opts.room, 'restrictCamera')}"
                )
                span {parent.voc.restrictCamera}
        fieldset
            .aPoint2DInput.compact.wide(if="{parent.opts.room.restrictCamera}")
                label
                    b {parent.voc.minimumX}:
                    |
                    input.compact.wide(
                        step="{parent.opts.room.gridX}" type="number"
                        onfocus="{parent.rememberValue}"
                        oninput="{parent.wire('opts.room.restrictMinX')}"
                        onchange="{parent.recordChange(parent.opts.room, 'restrictMinX')}"
                        value="{parent.opts.room.restrictMinX === void 0 ? 0 : parent.opts.room.restrictMinX}"
                    )
                .aSpacer
                label
                    b.nogrow {parent.voc.minimumY}:
                    |
                    input.compact.wide(
                        step="{parent.opts.room.gridY}" type="number"
                        onfocus="{parent.rememberValue}"
                        oninput="{parent.wire('opts.room.restrictMinY')}"
                        onchange="{parent.recordChange(opts.room, 'restrictMinY')}"
                        value="{parent.opts.room.restrictMinY === void 0 ? 0 : parent.opts.room.restrictMinY}"
                    )
            .aPoint2DInput.compact.wide(if="{parent.opts.room.restrictCamera}")
                label
                    b {parent.voc.maximumX}:
                    |
                    input.compact.wide(
                        step="{parent.opts.room.gridX}" type="number"
                        onfocus="{parent.rememberValue}"
                        oninput="{parent.wire('opts.room.restrictMaxX')}"
                        onchange="{parent.recordChange(parent.opts.room, 'restrictMaxX')}"
                        value="{parent.opts.room.restrictMaxX === void 0 ? parent.opts.room.width : parent.opts.room.restrictMaxX}"
                    )
                .aSpacer
                label
                    b.nogrow {parent.voc.maximumY}:
                    |
                    input.compact.wide(
                        step="{parent.opts.room.gridY}" type="number"
                        onfocus="{parent.rememberValue}"
                        oninput="{parent.wire('opts.room.restrictMaxY')}"
                        onchange="{parent.recordChange(parent.opts.room, 'restrictMaxY')}"
                        value="{parent.opts.room.restrictMaxY === void 0 ? parent.opts.room.height : parent.opts.room.restrictMaxY}"
                    )
        fieldset
            label.block.checkbox
                input(
                    type="checkbox" checked="{parent.opts.room.isUi}"
                    onchange="{parent.handleToggle(parent.opts.room, 'isUi')}"
                )
                b {parent.voc.isUi}

    collapsible-section.anInsetPanel(
        heading="{vocGlob.assetTypes.behavior[2].slice(0, 1).toUpperCase() + vocGlob.assetTypes.behavior[2].slice(1)}"
        storestatekey="roomBehaviors"
        hlevel="4"
    )
        behavior-list(
            onchanged="{parent.updateBehaviorExtends}"
            asset="{parent.opts.room}"
        )
    .aSpacer
    fieldset
        b {voc.backgroundColor}
        br
        color-input.wide(
            onchange="{changeBgColor}"
            color="{opts.room.backgroundColor || '#000000'}"
            hidealpha="hidealpha"
        )
    extensions-editor(
        entity="{opts.room.extends}"
        customextends="{behaviorExtends}"
        compact="compact" wide="wide"
    )

    fieldset
        extensions-editor(entity="{opts.room.extends}" type="room" wide="true" compact="true")

    script.
        this.namespace = 'roomView';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);
        this.mixin(require('./data/node_requires/riotMixins/wire').default);

        var prevValue;
        this.rememberValue = e => {
            if (e.target.type === 'number') {
                prevValue = Number(e.target.value);
            } else {
                prevValue = e.target.value;
            }
        };
        this.recordChange = (entity, key) => e => {
            if (!this.opts.history) {
                return;
            }
            let {value} = e.target;
            if (e.target.type === 'number') {
                value = Number(value);
            }
            this.opts.history.pushChange({
                type: 'propChange',
                key,
                target: entity,
                before: prevValue,
                after: value
            });
        };
        this.wireAndRealign = key => e => {
            const val = Number(e.target.value);
            if (key === 'opts.room.width') {
                this.opts.editor.repositionUiCopies(val, this.opts.room.height);
            } else {
                this.opts.editor.repositionUiCopies(this.opts.room.width, val);
            }
            this.wire(key)(e);
        };

        this.setFollow = uid => {
            const prevValue = this.opts.room.follow;
            this.opts.room.follow = uid;
            this.opts.history.pushChange({
                type: 'propChange',
                key: 'follow',
                target: this.opts.room,
                before: prevValue,
                after: uid
            });
            this.update();
        };

        this.changeBgColor = (e, color) => {
            const prevChange = this.opts.room.backgroundColor;
            this.opts.updatebg(e, color);
            this.opts.history.pushChange({
                type: 'propChange',
                key: 'backgroundColor',
                target: this.opts.room,
                before: prevChange,
                after: this.opts.room.backgroundColor
            });
        };
        this.handleToggle = (entity, key) => () => {
            const prevValue = entity[key];
            entity[key] = !entity[key];
            this.opts.history.pushChange({
                type: 'propChange',
                key,
                target: entity,
                before: prevValue,
                after: entity[key]
            });
        };

        const {schemaToExtensions} = require('./data/node_requires/resources/content');
        const {getById} = require('./data/node_requires/resources');
        this.behaviorExtends = [];
        this.updateBehaviorExtends = () => {
            this.behaviorExtends = [];
            for (const behaviorUid of this.opts.room.behaviors) {
                const behavior = getById('behavior', behaviorUid);
                if (behavior.specification.length) {
                    this.behaviorExtends.push({
                        name: behavior.name,
                        type: 'group',
                        items: schemaToExtensions(behavior.specification)
                    });
                }
            }
            this.update();
        };
        this.updateBehaviorExtends();
