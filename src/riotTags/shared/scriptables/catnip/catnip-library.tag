catnip-library.flexfix
    virtual(each="{cat in categories}")
        h2 {cat.name}
        catnip-block(
            each="{block in cat.items}"
            block="{({lib: block.lib, code: block.code, values: {}})}"
            dragoutonly="dragoutonly"
            ondragstart="{parent.onDragStart}"
            draggable="draggable"
        )
    script.
        const {blocksLibrary, startBlocksTrasmit} = require('./data/node_requires/catnip');
        this.categories = blocksLibrary;

        this.onDragStart = e => {
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('ctjsblocks/marker', 'hello uwu');
            const {block} = e.item;
            startBlocksTrasmit([{lib: block.lib, code: block.code, values: {}}], this.opts.blocks, false, true);
        };
