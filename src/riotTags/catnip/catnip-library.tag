catnip-library.flexfix
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
    script.
        const {blocksLibrary, startBlocksTrasmit, getDeclaration, setSuggestedTarget} = require('./data/node_requires/catnip');
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
