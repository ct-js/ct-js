//-
    @attribute block (IBlock)
        The block from the block script that is rendered
catnip-block(class="{declaration.type} {declaration.typeHint} {opts.class}")
    svg.feather(if="{declaration.icon}")
        use(xlink:href="#{declaration.icon}")
    span.catnip-block-aTextLabel {declaration.name}
    virtual(each="{piece in declaration.pieces}")
        span.catnip-block-aTextLabel(if="{piece.type === 'label'}") {piece.name}
        svg.feather(if="{piece.type === 'icon'}")
            use(xlink:href="#{piece.icon}")
        textarea.code(if="{piece.type === 'code'}" ref="codeEditor" value="{getValue(piece.key)}")
        textarea(if="{piece.type === 'textbox'}" value="{getValue(piece.key)}")
        .catnip-block-Blocks(if="{piece.type === 'blocks'}")
            .catnip-block-aBlockPlaceholder(if="{!getValue(piece.key) || getValue(piece.key).length}")
                | Do nothing
                |
                |
                svg.feather
                    use(xlink:href="#thumbs-up")
            catnip-block(each="{block in getValue(piece.key)}")
        catnip-block(
            if="{piece.type === 'argument' && getValue(piece.key) && getValue(piece.key).type !== 'constant'}"
            class="{piece.typeHint}"
            block="{getValue(piece.key)}"
        )
        // TODO: Write constant back
        input.catnip-block-aConstantInput(
            type="text" value="{getValue(piece.key)}"
            if="{piece.type === 'argument' && !getValue(piece.key)}"
            placeholder="{piece.key}"
            class="{piece.typeHint}"
        )
    script.
        const {getDeclaration} = require('./data/node_requires/catnip');
        this.declaration = getDeclaration(this.opts.block.lib, this.opts.block.code);
        this.getValue = key => {
            return this.opts.block.values[key];
        };
