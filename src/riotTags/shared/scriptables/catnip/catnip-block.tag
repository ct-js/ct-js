//-
    @attribute block (IBlock)
        The block from the block script that is rendered
    @atribute [nodrag] (atomic)
        Prohibits dragging this block
    @attribute [readonly] (atomic)
        Prohibits editing this block and all its nested blocks

catnip-block(
    draggable="{!opts.nodrag}"
    class="{declaration.type} {declaration.typeHint} {opts.class}"
    hide="{getHidden}"
)
    svg.feather(if="{declaration.icon}")
        use(xlink:href="#{declaration.icon}")
    span.catnip-block-aTextLabel {declaration.name}
    virtual(each="{piece in declaration.pieces}")
        span.catnip-block-aTextLabel(if="{piece.type === 'label'}") {piece.name}
        svg.feather(if="{piece.type === 'icon'}")
            use(xlink:href="#{piece.icon}")
        textarea.code(
            readonly="{opts.readonly}"
            if="{piece.type === 'code'}"
            ref="codeEditor"
            value="{getValue(piece.key)}"
        )
        textarea(
            readonly="{opts.readonly}"
            if="{piece.type === 'textbox'}"
            value="{getValue(piece.key)}"
        )
        .catnip-block-Blocks(if="{piece.type === 'blocks'}" ref="blocksDrop")
            catnip-block-list(
                blocks="{getValue(piece.key)}"
                showplaceholder="showplaceholder"
                placeholder="{piece.placeholder}"
                readonly="{opts.readonly}"
            )
        catnip-block(
            if="{piece.type === 'argument' && getValue(piece.key) && (typeof getValue(piece.key)) === 'object'}"
            class="{piece.typeHint}"
            block="{getValue(piece.key)}"
            readonly="{opts.readonly}"
        )
        // TODO: Write constant back
        input.catnip-block-aConstantInput(
            type="text" value="{getValue(piece.key)}"
            if="{piece.type === 'argument' && (!getValue(piece.key) || (typeof getValue(piece.key)) !== 'object')}"
            placeholder="{piece.key}"
            class="{piece.typeHint}"
            readonly="{opts.readonly}"
            ref="argumentsDrop"
        )
    script.
        const {
            getDeclaration,
            getTransmissionType,
            startBlocksTrasmit,
            endBlocksTransmit
        } = require('./data/node_requires/catnip');
        this.declaration = getDeclaration(this.opts.block.lib, this.opts.block.code);
        this.getValue = key => {
            return this.opts.block.values[key];
        };
        // A random ID that is used during block tree traversal
        // to prevent putting a block into itself or its children.
        this.id = require('./data/node_requires/generateGUID')();

        this.dragging = false;

        this.getHidden = () => this.dragging;
