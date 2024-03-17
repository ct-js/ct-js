//-
    @attribute variables (string[])
    @attribute props (string[])
catnip-library.flexfix(class="{opts.class}")
    .aSearchWrap.flexfix-header
        input.wide(type="text" oninput="{search}" ref="search" onclick="{selectSearch}" value="{searchVal}")
        svg.feather
            use(href="#search")
    .flexfix-body(if="{!searchVal.trim()}")
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
            ondragend="{resetTarget}"
        )
        br(if="{opts.props.length}")
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
            ondragend="{resetTarget}"
        )
        br(if="{opts.variables.length}")
        button.inline(onclick="{promptNewVariable}")
            svg.feather
                use(href="#plus")
            span {voc.createNewVariable}
        virtual(each="{cat in categories}")
            h3 {cat.name}
            catnip-block(
                each="{block in cat.items}"
                block="{({lib: block.lib, code: block.code, values: {}})}"
                dragoutonly="dragoutonly"
                readonly="readonly"
                ondragstart="{parent.onDragStart}"
                draggable="draggable"
                ondragend="{resetTarget}"
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
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);

        const {
            blocksLibrary,
            startBlocksTrasmit,
            getDeclaration,
            setSuggestedTarget,
            searchBlocks,
            blockFromDeclaration
        } = require('./data/node_requires/catnip');
        this.categories = blocksLibrary;

        this.onDragStart = e => {
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('ctjsblocks/marker', 'hello uwu');
            const {block} = e.item;
            const declaration = getDeclaration(block.lib, block.code);
            startBlocksTrasmit([blockFromDeclaration(declaration)], this.opts.blocks, false, true);
        };
        this.onVarDragStart = e => {
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('ctjsblocks/marker', 'hello uwu');
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
        };
        this.resetTarget = () => {
            setSuggestedTarget();
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
