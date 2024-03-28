//-
    @attribute variables (string[])
    @attribute props (string[])
    @attribute behaviorprops (string[])
catnip-library(class="{opts.class}").flexrow
    .flexfix
        .aSearchWrap.flexfix-header
            input.wide(type="text" oninput="{search}" ref="search" onclick="{selectSearch}" value="{searchVal}")
            svg.feather
                use(href="#search")
        .flexfix-body(show="{!searchVal.trim()}" ref="mainpanel")
            h3
                | {voc.properties}
                hover-hint(text="{voc.propertiesHint}")
            catnip-block(
                each="{prop in opts.props}"
                block="{({lib: 'core.hidden', code: 'property', values: {variableName: prop}})}"
                dragoutonly="dragoutonly"
                readonly="readonly"
                ondragstart="{parent.onVarDragStart}"
                draggable="draggable"
                ondragend="{parent.resetTarget}"
                oncontextmenu="{parent.onContextMenu}"
            )
            catnip-block(
                each="{prop in opts.behaviorprops}"
                block="{({lib: 'core.hidden', code: 'behavior property', values: {variableName: prop}})}"
                dragoutonly="dragoutonly"
                readonly="readonly"
                ondragstart="{parent.onVarDragStart}"
                draggable="draggable"
                ondragend="{parent.resetTarget}"
            )
            br(if="{opts.props.length || opts.behaviorprops.length}")
            button.inline(onclick="{promptNewProperty}")
                svg.feather
                    use(href="#plus")
                span {voc.createNewProperty}
            h3
                | {voc.variables}
                hover-hint(text="{voc.variablesHint}")
            catnip-block(
                each="{variable in opts.variables}"
                block="{({lib: 'core.hidden', code: 'variable', values: {variableName: variable}})}"
                dragoutonly="dragoutonly"
                readonly="readonly"
                ondragstart="{parent.onVarDragStart}"
                draggable="draggable"
                ondragend="{parent.resetTarget}"
                oncontextmenu="{parent.onContextMenu}"
            )
            br(if="{opts.variables.length}")
            button.inline(onclick="{promptNewVariable}")
                svg.feather
                    use(href="#plus")
                span {voc.createNewVariable}
            .aSpacer
            virtual(each="{cat in categories}")
                h3(ref="categories" if="{!cat.hidden}")
                    svg.feather
                        use(href="#{cat.icon || 'grid-random'}")
                    span {voc.coreLibs[cat.i18nKey] || cat.name}
                catnip-block(
                    each="{block in cat.items}"
                    block="{({lib: block.lib, code: block.code, values: {}})}"
                    dragoutonly="dragoutonly"
                    readonly="readonly"
                    ondragstart="{parent.parent.onDragStart}"
                    draggable="draggable"
                    ondragend="{parent.resetTarget}"
                )
        .flexfix-body(if="{searchVal.trim() && searchResults.length}")
            catnip-block(
                each="{block in searchResults}"
                block="{({lib: block.lib, code: block.code, values: {}})}"
                dragoutonly="dragoutonly"
                readonly="readonly"
                ondragstart="{parent.onDragStart}"
                draggable="draggable"
                ondragend="{resetTarget}"
            )
        .flexfix-body.center(if="{searchVal.trim() && !searchResults.length}")
            svg.anIllustration
                use(xlink:href="data/img/weirdFoldersIllustration.svg#illustration")
            br
            span {vocGlob.nothingToShowFiller}
    .catnip-library-CategoriesShortcuts.aButtonGroup.vertical
        .catnip-library-aShortcut.button(title="{voc.properties}" onclick="{scrollToTop}")
            svg.feather.a
                use(href="#archive")
            div  {voc.properties}
        .catnip-library-aShortcut.button(
            each="{cat, ind in categories}" if="{!cat.hidden}"
            title="{cat.name}"
            onclick="{scrollToCat}"
        )
            svg.feather.a
                use(href="#{cat.icon || 'grid-random'}")
            div {voc.coreLibs[cat.i18nKey] || cat.name}
    context-menu(if="{contextVarName}" menu="{contextMenu}" ref="menu")
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);

        const {
            blocksLibrary,
            startBlocksTrasmit,
            getDeclaration,
            setSuggestedTarget,
            searchBlocks,
            blockFromDeclaration,
            emptyTexture
        } = require('./data/node_requires/catnip');
        this.categories = blocksLibrary;

        this.onDragStart = e => {
            const {block} = e.item;
            const declaration = getDeclaration(block.lib, block.code);
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData(`ctjsblocks/${declaration.type}`, 'hello uwu');
            e.dataTransfer.setDragImage(emptyTexture, 0, 0);
            startBlocksTrasmit([blockFromDeclaration(declaration)], this.opts.blocks, false, true);
            const bounds = e.target.getBoundingClientRect();
            window.signals.trigger(
                'blockTransmissionStart',
                e,
                e.target.outerHTML,
                bounds.left - e.clientX,
                bounds.top - e.clientY
            );
        };
        this.onVarDragStart = e => {
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('ctjsblocks/computed', 'hello uwu');
            e.dataTransfer.setDragImage(emptyTexture, 0, 0);
            const bounds = e.target.getBoundingClientRect();
            const code = e.item.prop ? 'property' : 'variable',
                  value = e.item.prop ?? e.item.variable;
            console.log(e, code, value);
            startBlocksTrasmit([{
                lib: 'core.hidden',
                code,
                values: {
                    variableName: value
                }
            }], this.opts.blocks, false, true);
            window.signals.trigger(
                'blockTransmissionStart',
                e,
                e.target.outerHTML,
                bounds.left - e.clientX,
                bounds.top - e.clientY
            );
        };
        this.resetTarget = () => {
            setSuggestedTarget();
        };

        const ease = (x) => {
            return 1 - Math.pow(1 - x, 5);
        }
        this.scrollToCat = e => {
            const {ind} = e.item;
            let a = 0,
                timePrev = Number(new Date()),
                startScroll = this.refs.mainpanel.scrollTop,
                targetScroll = this.refs.categories[ind].offsetTop;
            const scrollToCategory = () => {
                a += (Number(new Date()) - timePrev) / 1000;
                if (a > 1) {
                    a = 1;
                } else {
                    window.requestAnimationFrame(scrollToCategory);
                }
                const b = ease(a);
                this.refs.mainpanel.scrollTo(0, startScroll * (1 - b) + targetScroll * b);
            };
            scrollToCategory();
        };
        this.scrollToTop = e => {
            let a = 0,
                timePrev = Number(new Date()),
                startScroll = this.refs.mainpanel.scrollTop,
                targetScroll = 0;
            const scrollToCategory = () => {
                a += (Number(new Date()) - timePrev) / 1000;
                if (a > 1) {
                    a = 1;
                } else {
                    window.requestAnimationFrame(scrollToCategory);
                }
                const b = ease(a);
                this.refs.mainpanel.scrollTo(0, startScroll * (1 - b) + targetScroll * b);
            };
            scrollToCategory();
        };

        this.searchVal = '';
        this.search = e => {
            this.searchVal = e.target.value;
            if (this.searchVal.trim()) {
                this.searchResults = searchBlocks(this.searchVal.trim());
            }
        };
        this.selectSearch = e => {
            this.refs.search.select();
        };

        this.promptNewProperty = () => {
            window.alertify.prompt(this.voc.newPropertyPrompt)
            .then(e => {
                const val = e.inputValue;
                if (!val || !val.trim()) {
                    return;
                }
                this.opts.props.push(val.trim());
                this.update();
            })
        };
        this.promptNewVariable = () => {
            window.alertify.prompt(this.voc.newVariablePrompt)
            .then(e => {
                const val = e.inputValue;
                if (!val || !val.trim()) {
                    return;
                }
                this.opts.variables.push(val.trim());
                this.update();
            })
        };
        this.contextVarName = false;
        this.onContextMenu = e => {
            e.preventDefault();
            e.stopPropagation();
            this.contextVarName = e.item.prop || e.item.variable;
            this.contextType = e.item.prop ? 'prop' : 'variable';
            this.update();
            this.refs.menu.popup(e.clientX, e.clientY);
        };
        this.contextMenu = {
            opened: true,
            items: [{
                label: this.vocGlob.delete,
                icon: 'trash',
                click: () => {
                    if (this.contextType === 'prop') {
                        this.opts.props.splice(this.opts.props.indexOf(this.contextVarName), 1);
                    } else {
                        this.opts.variables.splice(this.opts.variables.indexOf(this.contextVarName), 1);
                    }
                    this.contextVarName = false;
                    this.update();
                }
            }]
        };
