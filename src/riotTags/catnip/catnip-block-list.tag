//-
    @attribute blocks (BlockScript)
    @attribute [placeholder] (Array<IBlockPieceLabel | IBlockPieceIcon>)
    @attribute [showplaceholder] (atomic)
    @attribute [readonly] (atomic)
catnip-block-list(
    ondragenter="{handlePreDrop}"
    ondragover="{handlePreDrop}"
    ondrop="{onDrop}"
)
    catnip-insert-mark(
        if="{opts.blocks}"
        list="{opts.blocks}" pos="-1"
        ondrop="{parent.onDropTop}"
        ondragenter="{parent.handlePreDropInsertMark}"
        ondragover="{parent.handlePreDropInsertMark}"
    )
    .catnip-block-aBlockPlaceholder(if="{opts.showplaceholder && (!opts.blocks || !opts.blocks.length)}")
        virtual(each="{piece in opts.placeholder}" if="{opts.placeholder}")
            span.catnip-block-aTextLabel(if="{piece.type === 'label'}") {piece.name}
            svg.feather(if="{piece.type === 'icon'}")
                use(xlink:href="#{piece.icon}")
        svg.feather(if="{!opts.placeholder}")
            use(xlink:href="#button")
        span.catnip-block-aTextLabel(if="{!opts.placeholder}") {voc.placeholders.putBlocksHere}
    virtual(each="{block, ind in opts.blocks}")
        catnip-block(
            block="{block}"
            ondragstart="{parent.onDragStart}"
            ondragend="{parent.onDragEnd}"
            readonly="{parent.opts.readonly}"
            oncontextmenu="{parent.onContextMenu}"
        )
        catnip-insert-mark(
            if="{!opts.readonly}"
            ondragenter="{parent.handlePreDropInsertMark}"
            ondragover="{parent.handlePreDropInsertMark}"
            ondrop="{parent.onDropAfter}"
            list="{parent.opts.blocks}"
            pos="{ind}"
        )
    context-menu(if="{contextBlock}" menu="{contextMenu}" ref="menu")
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);

        const {
            startBlocksTrasmit,
            endBlocksTransmit,
            getTransmissionType,
            getSuggestedTarget,
            setSuggestedTarget,
            emptyTexture
        } = require('./data/node_requires/catnip');

        this.getSuggestedTarget = getSuggestedTarget;

        this.onDragStart = e => {
            this.update();
            e.dataTransfer.setData('ctjsblocks/command', 'hello uwu');
            e.dataTransfer.setDragImage(emptyTexture, 0, 0);
            const bounds = e.target.getBoundingClientRect();
            window.signals.trigger(
                'blockTransmissionStart',
                e,
                e.target.outerHTML,
                bounds.left - e.clientX,
                bounds.top - e.clientY
            );
            startBlocksTrasmit([e.item.block], this.opts.blocks);
            e.stopPropagation();
            this.hoveredOver = null;
        };
        this.onDragEnd = e => {
            setSuggestedTarget();
        };

        const isInvalidDrop = e =>
            this.opts.readonly || !e.dataTransfer.types.includes('ctjsblocks/command');
        this.handlePreDrop = e => {
            if (!isInvalidDrop(e)) {
                e.preventDefault(); // Tells that we do want to accept the drop
            }
        };
        this.handlePreDropInsertMark = e => {
            this.handlePreDrop(e);
            if (!isInvalidDrop(e)) {
                setSuggestedTarget(e.item.block ?? this.opts.blocks);
            }
        };
        this.onDrop = e => {
            if (isInvalidDrop(e)) {
                return;
            }
            if (getTransmissionType() !== 'command') {
                return;
            }
            this.hoveredOver = null;
            e.preventDefault();
            e.stopPropagation();
            // Drop at the start of the script if the cursor was there
            const bounds = this.root.getBoundingClientRect();
            if (e.clientY < bounds.top + 20) {
                endBlocksTransmit(this.opts.blocks, 0);
            } else {
                endBlocksTransmit(this.opts.blocks, this.opts.blocks.length);
            }
        };
        this.onDropAfter = e => {
            if (isInvalidDrop(e)) {
                return;
            }
            if (getTransmissionType() !== 'command') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            const {ind} = e.item;
            endBlocksTransmit(this.opts.blocks, ind + 1);
        };
        this.onDropTop = e => {
            if (isInvalidDrop(e)) {
                return;
            }
            if (getTransmissionType() !== 'command') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            endBlocksTransmit(this.opts.blocks, 0);
        };

        this.contextBlock = false;
        this.onContextMenu = e => {
            e.preventDefault();
            e.stopPropagation();
            const {block} = e.item;
            this.contextBlock = block;
            this.update();
            this.refs.menu.popup(e.clientX, e.clientY);
        };
        this.contextMenu = {
            opened: true,
            items: [{
                label: this.vocGlob.delete,
                icon: 'trash',
                click: () => {
                    this.opts.blocks.splice(this.opts.blocks.indexOf(this.contextBlock), 1);
                    this.contextBlock = false;
                    this.update();
                }
            }]
        };
