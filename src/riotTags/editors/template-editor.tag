mixin templateProperties
    collapsible-section.anInsetPanel(
        heading="{vocGlob.assetTypes.behavior[2].slice(0, 1).toUpperCase() + vocGlob.assetTypes.behavior[2].slice(1)}"
        storestatekey="templateBehaviors"
        hlevel="4"
    )
        behavior-list(
            onchanged="{parent.updateBehaviorExtends}"
            asset="{parent.asset}"
        )
    collapsible-section.anInsetPanel(
        if="{hasCapability('ninePatch')}"
        heading="{voc.panelHeading}"
        storestatekey="templateNineSlice"
        hlevel="4"
    )
        fieldset.aNinePatchGrid
            input.aNinePatchElement.top(
                title="{parent.voc.nineSliceTop}"
                type="number" min="1" step="8"
                value="{parent.asset.nineSliceSettings.top}"
                oninput="{parent.wire('asset.nineSliceSettings.top')}"
            )
            input.aNinePatchElement.right(
                title="{parent.voc.nineSliceRight}"
                type="number" min="1" step="8"
                value="{parent.asset.nineSliceSettings.right}"
                oninput="{parent.wire('asset.nineSliceSettings.right')}"
            )
            input.aNinePatchElement.bottom(
                title="{parent.voc.nineSliceBottom}"
                type="number" min="1" step="8"
                value="{parent.asset.nineSliceSettings.bottom}"
                oninput="{parent.wire('asset.nineSliceSettings.bottom')}"
            )
            input.aNinePatchElement.left(
                title="{parent.voc.nineSliceLeft}"
                type="number" min="1" step="8"
                value="{parent.asset.nineSliceSettings.left}"
                oninput="{parent.wire('asset.nineSliceSettings.left')}"
            )
        fieldset
            label.block.checkbox
                input(
                    type="checkbox"
                    checked="{parent.asset.nineSliceSettings.autoUpdate}"
                    onchange="{parent.wire('asset.nineSliceSettings.autoUpdate')}"
                )
                span {parent.voc.autoUpdateNineSlice}
                hover-hint(text="{parent.voc.autoUpdateNineSliceHint}")
    collapsible-section.anInsetPanel(
        heading="{voc.appearance}"
        storestatekey="templateEditorAppearance"
        hlevel="4"
    )
        // Visual states' textures
        fieldset(if="{parent.hasCapability('visualStates')}")
            b {parent.voc.hoverTexture}:
            asset-input.wide(
                assettypes="texture"
                assetid="{parent.asset.hoverTexture || -1}"
                allowclear="allowclear"
                onchanged="{parent.applyButtonTexture('hoverTexture')}"
            )
            b {parent.voc.pressedTexture}:
            asset-input.wide(
                assettypes="texture"
                assetid="{parent.asset.pressedTexture || -1}"
                allowclear="allowclear"
                onchanged="{parent.applyButtonTexture('pressedTexture')}"
            )
            b {parent.voc.disabledTexture}:
            asset-input.wide(
                assettypes="texture"
                assetid="{parent.asset.disabledTexture || -1}"
                allowclear="allowclear"
                onchanged="{parent.applyButtonTexture('disabledTexture')}"
            )
        // Text style selector for buttons and other UI elements more complex than a text label
        fieldset(if="{parent.hasCapability('embeddedText')}")
            b {parent.voc.textStyle}:
            asset-input.wide(
                assettypes="style"
                assetid="{parent.asset.textStyle || -1}"
                allowclear="allowclear"
                onchanged="{parent.applyStyle}"
            )
        fieldset(if="{parent.hasCapability('text') || parent.hasCapability('embeddedText') || parent.hasCapability('textInput')}")
            label.block(if="{parent.hasCapability('text') || parent.hasCapability('embeddedText')}")
                b {parent.voc.defaultText}
                input.wide(
                    type="text"
                    value="{parent.asset.defaultText}"
                    onchange="{parent.wire('asset.defaultText')}"
                )
            label.block(if="{parent.hasCapability('textInput')}")
                b {parent.voc.fieldType}
                br
                select.wide(onchange="{parent.wire('asset.fieldType')}")
                    option(value="text" selected="{parent.asset.fieldType === 'text' || !parent.asset.fieldType}") {parent.voc.fieldTypes.text}
                    option(value="number" selected="{parent.asset.fieldType === 'number'}") {parent.voc.fieldTypes.number}
                    option(value="email" selected="{parent.asset.fieldType === 'email'}") {parent.voc.fieldTypes.email}
                    option(value="password" selected="{parent.asset.fieldType === 'password'}") {parent.voc.fieldTypes.password}
            label.block(if="{parent.hasCapability('textInput')}")
                b {parent.voc.maxLength}
                br
                input.wide(type="number" onchange="{parent.wire('asset.maxTextLength')}" value="{parent.asset.maxTextLength || 0}")
        fieldset(if="{parent.hasCapability('textInput')}")
            label.checkbox.block
                input(type="checkbox" checked="{parent.asset.selectionColor}" onchange="{parent.toggleSelectionColor}")
                b {parent.voc.useCustomSelectionColor}
            color-input(
                if="{parent.asset.selectionColor}"
                onchange="{parent.wire('asset.selectionColor', true)}"
                color="{parent.asset.selectionColor}"
                hidealpha="hidealpha"
            )

        // Scroll speed for repeating textures
        fieldset(if="{parent.hasCapability('scroller')}")
            label.block
                b {parent.voc.scrollSpeedX}
                input.wide(
                    type="number"
                    step="8"
                    onchange="{parent.wire('asset.tilingSettings.scrollSpeedX')}"
                    value="{parent.asset.tilingSettings.scrollSpeedX}"
                )
            label.block
                b {parent.voc.scrollSpeedY}
                input.wide(
                    type="number"
                    step="8"
                    onchange="{parent.wire('asset.tilingSettings.scrollSpeedY')}"
                    value="{parent.asset.tilingSettings.scrollSpeedY}"
                )
            label.checkbox
                input(
                    type="checkbox"
                    onchange="{parent.wire('asset.tilingSettings.isUi')}"
                    value="{parent.asset.tilingSettings.isUi}"
                )
                b {parent.voc.isUi}
        // Sprited counter settings
        fieldset(if="{parent.hasCapability('repeater')}")
            label.block
                b {parent.voc.defaultCount}
                input.wide(
                    type="number"
                    step="8"
                    onchange="{parent.wire('asset.repeaterSettings.defaultCount')}"
                    value="{parent.asset.repeaterSettings.defaultCount}"
                )
        fieldset
            label.block
                b {parent.voc.depth}
                input.wide(
                    type="number"
                    onchange="{parent.wire('asset.depth')}"
                    value="{parent.asset.depth}"
                )
            label.block
                b {parent.voc.opacity}
                input.wide(
                    type="number" min="0" max="1" step="0.1"
                    onchange="{parent.wire('asset.extends.alpha')}"
                    value="{parent.asset.extends.alpha ?? 1}"
                )
            label.block(if="{parent.hasCapability('blendModes')}")
                b {parent.voc.blendMode}
                select.wide(onchange="{parent.wire('asset.blendMode')}")
                    option(value="normal" selected="{parent.asset.blendMode === 'normal' || !parent.asset.blendMode}") {parent.voc.blendModes.normal}
                    option(value="add" selected="{parent.asset.blendMode === 'add'}") {parent.voc.blendModes.add}
                    option(value="multiply" selected="{parent.asset.blendMode === 'multiply'}") {parent.voc.blendModes.multiply}
                    option(value="screen" selected="{parent.asset.blendMode === 'screen'}") {parent.voc.blendModes.screen}
        fieldset
            label.flexrow(if="{parent.hasCapability('animatedSprite')}")
                b.nogrow.alignmiddle {parent.voc.animationFPS}
                .aSpacer.nogrow
                input.alignmiddle(type="number" max="60" min="1" step="1" value="{parent.asset.animationFPS ?? 60}" onchange="{parent.wire('asset.animationFPS')}")
            label.block.checkbox(if="{parent.hasCapability('animatedSprite')}")
                input(type="checkbox" checked="{parent.asset.playAnimationOnStart}" onchange="{parent.wire('asset.playAnimationOnStart')}")
                span {parent.voc.playAnimationOnStart}
            label.block.checkbox(if="{parent.hasCapability('animatedSprite')}")
                input(type="checkbox" checked="{parent.asset.loopAnimation}" onchange="{parent.wire('asset.loopAnimation')}")
                span {parent.voc.loopAnimation}
            label.block.checkbox
                input(type="checkbox" checked="{parent.asset.visible ?? true}" onchange="{parent.wire('asset.visible')}")
                span {parent.voc.visible}
    .aSpacer(if="{behaviorExtends.length}")
    extensions-editor(
        entity="{asset.extends}"
        customextends="{behaviorExtends}"
        compact="compact" wide="wide"
    )
    .aSpacer
    extensions-editor(type="template" entity="{asset.extends}" wide="yep" compact="probably")

mixin eventsList
    event-list-scriptable(
        events="{asset.events}"
        entitytype="template"
        baseclass="{asset.baseClass}"
        onchanged="{changeCodeTab}"
        currentevent="{currentSheet}"
    ).tall

template-editor.aPanel.aView.flexrow
    .template-editor-Properties.nml(class="{alt: localStorage.altTemplateLayout === 'on'}")
        .tall.flexfix.aPanel.pad
            .flexfix-header
                // Main linked asset of a template
                asset-input.wide(
                    if="{hasCapability('textured')}"
                    assettypes="texture"
                    assetid="{asset.texture || -1}"
                    large="large"
                    allowclear="allowclear"
                    onchanged="{applyTexture}"
                    ref="texturePicker"
                )
                asset-input.wide(
                    if="{hasCapability('text') && !hasCapability('textured')}"
                    assettypes="style"
                    assetid="{asset.textStyle || -1}"
                    large="large"
                    allowclear="allowclear"
                    onchanged="{applyStyle}"
                )
                error-notice(
                    if="{['SpritedCounter', 'RepeatingTexture'].includes(asset.baseClass) && needsTiledWarning()}"
                    target="{refs.texturePicker}"
                )
                    | {parent.vocFull.roomBackgrounds.notBackgroundTextureWarning}
                    br
                    span.a(onclick="{parent.fixTilingTexture}") 🔧{parent.vocFull.roomBackgrounds.fixBackground}
                    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    span.a(onclick="{parent.dismissTilingWarning}") 🫸{parent.vocFull.roomBackgrounds.dismissWarning}
                .aSpacer
                .relative
                    button.wide.flexrow(onclick="{showbaseClassMenu}")
                        svg.feather.nogrow.alignmiddle
                            use(xlink:href="#{baseClassToIcon[asset.baseClass]}")
                        span.nogrow.alignmiddle {voc.baseClass[asset.baseClass]}
                        .aSpacer
                        svg.feather.nogrow.alignmiddle
                            use(xlink:href="#chevron-down")
                    context-menu.wide(menu="{baseClassMenu}" style="position: absolute; top: 100%" ref="baseClassMenu")
                .aSpacer
            .flexfix-body(if="{localStorage.altTemplateLayout !== 'on'}")
                +eventsList()
            .flexfix-body(if="{localStorage.altTemplateLayout === 'on'}")
                +templateProperties()
            .flexfix-footer
                .aSpacer
                button.wide(onclick="{templateSave}" title="Shift+Control+S" data-hotkey="Shift+Control+S")
                    svg.feather
                        use(xlink:href="#check")
                    span {vocGlob.apply}
    .template-editor-aSlidingEventList(if="{localStorage.altTemplateLayout === 'on'}")
        .aPanel.tall
            .template-editor-aSlidingEventListWrap.tall
                +eventsList()
        svg.feather.template-editor-aSlidingEventListIcon.unclickable
            use(xlink:href="#plus")
    .template-editor-aCodeEditor
        .tabwrap.tall(style="position: relative")
            //ul.tabs.aNav.nogrow.noshrink
            //    li(onclick="{changeTab('javascript')}" class="{active: tab === 'javascript'}" title="JavaScript (Control+Q)" data-hotkey="Control+q")
            //        svg.feather
            //            use(xlink:href="#code")
            //        span {voc.create}
            //    li(onclick="{changeTab('blocks')}" class="{active: tab === 'blocks'}" title="Blurry (Control+W)" data-hotkey="Control+w")
            //        svg.feather
            //            use(xlink:href="#grid")
            //        span {voc.step}
            div
                .tabbed.noborder(show="{tab === 'javascript'}")
                    code-editor-scriptable(
                        event="{currentSheet}"
                        entitytype="template"
                        baseclass="{baseClassToTS[asset.baseClass]}"
                    )
                // .tabbed(show="{tab === 'blocks'}")
                //     .aBlocksEditor(ref="blocks")
    .template-editor-Properties.nmr(if="{localStorage.altTemplateLayout !== 'on' && !minimizeProps}")
        .tall.aPanel.pad.npt
            +templateProperties()
    button.toright.template-editor-aPresentationButton.square.tiny(
        onclick="{toggleProps}"
        if="{localStorage.altTemplateLayout !== 'on'}"
    )
        svg.feather
            use(xlink:href="#{minimizeProps ? 'maximize-2' : 'minimize-2'}")
    script.
        this.namespace = 'templateView';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);
        this.mixin(require('./data/node_requires/riotMixins/wire').default);
        this.mixin(require('./data/node_requires/riotMixins/discardio').default);

        const resources = require('./data/node_requires/resources');
        const {validateBehaviorExtends} = require('./data/node_requires/resources/behaviors');
        validateBehaviorExtends(this.asset);

        this.getTextureRevision = template => resources.getById(template.texture).lastmod;

        this.tab = 'javascript';
        [this.currentSheet] = this.asset.events; // can be undefined, this is ok

        const {schemaToExtensions} = require('./data/node_requires/resources/content');
        this.behaviorExtends = [];
        this.updateBehaviorExtends = () => {
            this.behaviorExtends = [];
            for (const behaviorUid of this.asset.behaviors) {
                const behavior = resources.getById('behavior', behaviorUid);
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

        const {baseClasses,
            baseClassToIcon,
            baseClassToTS,
            getBaseClassFields,
            hasCapability} = require('./data/node_requires/resources/templates');
        this.baseClassToIcon = baseClassToIcon;
        this.baseClassToTS = baseClassToTS;
        this.hasCapability = cp => hasCapability(this.asset.baseClass, cp);
        const fillBaseClassDefaults = () => {
            Object.assign(this.asset, getBaseClassFields(this.asset.baseClass));
        };
        this.baseClassMenu = {
            opened: false,
            items: baseClasses.map(baseClass => ({
                icon: this.baseClassToIcon[baseClass],
                label: this.voc.baseClass[baseClass],
                click: () => {
                    this.asset.baseClass = baseClass;
                    fillBaseClassDefaults();
                    this.update();
                }
            }))
        };
        this.showbaseClassMenu = () => {
            this.refs.baseClassMenu.toggle();
        };

        this.changeTab = tab => () => {
            this.tab = tab;
        };
        this.applyTexture = id => {
            if (id === -1) {
                this.asset.texture = -1;
            } else {
                const asset = resources.getById('texture', id);
                // Set template's name to match the texture's one
                // if user haven't specified their own yet.
                if (this.asset.name === 'New Template') {
                    this.asset.name = asset.name;
                }
                this.asset.texture = id;
            }
            this.update();
        };
        this.applyButtonTexture = key => id => {
            this.asset[key] = id;
            this.update();
        };
        this.applyStyle = id => {
            if (id === -1) {
                this.asset.textStyle = -1;
            } else {
                const asset = resources.getById('style', id);
                // Set template's name to match the style's one
                // if user haven't specified their own yet.
                if (this.asset.name === 'New Template') {
                    this.asset.name = asset.name;
                }
                this.asset.textStyle = id;
            }
            this.update();
        };
        this.applyCounterFiller = id => {
            this.asset.repeaterSettings.emptyTexture = id;
        };
        this.toggleSelectionColor = () => {
            if (this.asset.selectionColor) {
                delete this.asset.selectionColor;
            } else {
                this.asset.selectionColor = '#ffffff';
            }
        };

        this.needsTiledWarning = () => {
            if (this.asset.texture === -1 || !this.asset.texture) {
                return false;
            }
            const tex = resources.getById('texture', this.asset.texture);
            return !tex.tiled && !tex.ignoreTiledUse;
        };
        this.fixTilingTexture = () => {
            const tex = resources.getById('texture', this.asset.texture);
            tex.tiled = true;
            this.update();
        };
        this.dismissTilingWarning = () => {
            const tex = resources.getById('texture', this.asset.texture);
            tex.ignoreTiledUse = true;
            this.update();
        };

        this.saveAsset = () => {
            this.writeChanges();
            return true;
        };
        this.templateSave = () => {
            this.saveAsset();
            this.opts.ondone(this.asset);
        };
        this.changeCodeTab = scriptableEvent => {
            this.currentSheet = scriptableEvent;
            this.update();
        };

        const update = () => this.update(); // remove any possible arguments passed from events
        window.orders.on('forceCodeEditorLayout', update);
        this.on('unmount', () => {
            window.orders.off('forceCodeEditorLayout', update);
        });

        const checkRefs = deleted => {
            let cleaned = false;
            for (const key of [
                'texture',
                'skeleton',
                'hoverTexture',
                'pressedTexture',
                'disabledTexture',
                'textStyle'
            ]) {
                if (this.asset[key] === deleted) {
                    this.asset[key] = -1;
                    cleaned = true;
                }
            }
            if (cleaned) {
                this.update();
            }
        };
        window.signals.on('textureRemoved', checkRefs);
        window.signals.on('styleRemoved', checkRefs);
        this.on('unmount', () => {
            window.signals.off('textureRemoved', checkRefs);
            window.signals.off('styleRemoved', checkRefs);
        });

        this.minimizeProps = localStorage.minimizeTemplatesProps === 'yes';
        this.toggleProps = () => {
            this.minimizeProps = !this.minimizeProps;
            localStorage.minimizeTemplatesProps = this.minimizeProps ? 'yes' : 'no';
            window.orders.trigger('forceCodeEditorLayout');
        };
