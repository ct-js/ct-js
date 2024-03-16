catnip-library.flexfix
    .aSearchWrap.flexfix-header
        input.wide(type="text" oninput="{search}" ref="search" onclick="{selectSearch}" value="{searchVal}")
        svg.feather
            use(href="#search")
    .flexfix-body(if="{!searchVal.trim()}")
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
            blocksRegistry,
            searchBlocks
        } = require('./data/node_requires/catnip');
        this.categories = blocksLibrary;

        this.onDragStart = e => {
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('ctjsblocks/marker', 'hello uwu');
            const {block} = e.item;
            const newBlock = {
                lib: block.lib,
                code: block.code,
                values: {}
            };
            const declaration = getDeclaration(block.lib, block.code);
            for (const piece of declaration.pieces) {
                if (piece.type === 'blocks') {
                    newBlock.values[piece.key] = [];
                }
            }
            startBlocksTrasmit([newBlock], this.opts.blocks, false, true);
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
