//-
    @attribute blocks (BlockScript)
    @attribute placeholder (Array<IBlockPieceLabel | IBlockPieceIcon>)
    @attribute showplaceholder (atomic)
    @attribute readonly (atomic)
catnip-block-list(
    ondragenter="{handlePreDrop}"
    ondragover="{handlePreDrop}"
    ondrop="{onDrop}"
)
    catnip-insert-mark(
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
        )
        catnip-insert-mark(
            ondragenter="{parent.handlePreDropInsertMark}"
            ondragover="{parent.handlePreDropInsertMark}"
            ondrop="{parent.onDropAfter}"
            list="{parent.opts.blocks}"
            pos="{ind}"
        )
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);

        const {
            startBlocksTrasmit,
            endBlocksTransmit,
            getTransmissionType,
            getSuggestedTarget,
            setSuggestedTarget
        } = require('./data/node_requires/catnip');

        this.getSuggestedTarget = getSuggestedTarget;

        this.onDragStart = e => {
            this.update();
            e.dataTransfer.setData('ctjsblocks/marker', 'hello uwu');
            startBlocksTrasmit([e.item.block], this.opts.blocks);
            e.stopPropagation();
            this.hoveredOver = null;
        };
        this.onDragEnd = e => {
            setSuggestedTarget();
        };

        const isInvalidDrop = e => !e.dataTransfer.types.includes('ctjsblocks/marker');
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
