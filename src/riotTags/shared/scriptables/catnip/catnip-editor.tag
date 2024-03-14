//-
    @attribute blocks (BlockScript)
catnip-editor.flexrow
    .catnip-editor-scriptable-aCanvas(
        ref="canvas"
        ondragenter="{handlePreDrop}"
        ondragover="{handlePreDrop}"
        ondrop="{onDrop}"
    )
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
                onclick="{parent.openSearchMenu}"
                class="{dragover: parent.hoveredOver === block}"
            )
    .flexfix(ondragenter="{handlePreDrop}" ondragover="{handlePreDrop}")
        catnip-library.flexfix-body
        .flexfix-footer.catnip-editor-aTrashZone(title="{voc.trashZoneHint}")
            svg.feather
                use(xlink:href="#trash")
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);
        const {getDeclaration, startBlocksTrasmit, endBlocksTransmit, getTransmissionType} = require('./data/node_requires/catnip');

        this.onDragStart = e => {
            this.update();
            e.dataTransfer.setData('ctjsblocks/marker', 'hello uwu');
            startBlocksTrasmit([e.item.block], this.opts.blocks);
            e.stopPropagation();
            this.hoveredOver = null;
        };
        this.onDragEnd = e => {
            e.item.block.dragging = false;
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
                this.hoveredOver = e.item.block;
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
            const bounds = this.refs.canvas.getBoundingClientRect();
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
            console.log('Dropping in-between with index', ind)
            endBlocksTransmit(this.opts.blocks, ind + 1);
            this.hoveredOver = null;
        };
