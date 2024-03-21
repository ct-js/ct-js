//-
    @attribute block (IBlock)
        The block from the block script that is rendered
    @atribute [nodrag] (atomic)
        Prohibits dragging this block
    @attribute [readonly] (atomic)
        Prohibits editing this block and all its nested blocks

catnip-block(
    draggable="{!opts.nodrag}"
    class="{declaration.type} {declaration.typeHint} {opts.class} {declaration.customClass}"
    hide="{getHidden}"
    title="{declaration.documentation}"
)
    svg.feather(if="{declaration.icon && !declaration.hideIcon}")
        use(xlink:href="#{declaration.icon}")
    span.catnip-block-aTextLabel(if="{!declaration.hideLabel}") {declaration.displayName || declaration.name}
    virtual(each="{piece in declaration.pieces}")
        span.catnip-block-aTextLabel(if="{piece.type === 'label'}") {piece.name}
        span.catnip-block-aTextLabel(if="{piece.type === 'propVar'}") {parent.opts.block.values.variableName}
        svg.feather(if="{piece.type === 'icon'}")
            use(xlink:href="#{piece.icon}")
        textarea.code(
            readonly="{opts.readonly}"
            if="{piece.type === 'code'}"
            ref="codeEditor"
            value="{getValue(piece.key)}"
            placeholder="{piece.key}"
        )
        textarea(
            readonly="{opts.readonly}"
            if="{piece.type === 'textbox'}"
            value="{getValue(piece.key)}"
            placeholder="{piece.key}"
        )
        .catnip-block-Blocks(if="{piece.type === 'blocks'}" ref="blocksDrop")
            catnip-block-list(
                blocks="{getValue(piece.key)}"
                showplaceholder="showplaceholder"
                placeholder="{piece.placeholder}"
                readonly="{parent.opts.readonly}"
            )
        catnip-block(
            if="{piece.type === 'argument' && getValue(piece.key) && (typeof getValue(piece.key)) === 'object'}"
            class="{piece.typeHint}"
            block="{getValue(piece.key)}"
            readonly="{parent.opts.readonly}"
            ondragstart="{parent.onDragStart}"
            ondragend="{parent.onDragEnd}"
            oncontextmenu="{parent.onContextMenu}"
        )
        input.catnip-block-aConstantInput(
            ondrop="{parent.onDrop}"
            ondragenter="{parent.handlePreDrop}"
            ondragstart="{parent.handlePreDrop}"
            type="text" value="{parent.getValue(piece.key)}"
            oninput="{parent.writeConstantVal}"
            placeholder="{piece.key}"
            if="{piece.type === 'argument' && !piece.assets && (!getValue(piece.key) || (typeof getValue(piece.key)) !== 'object')}"
            class="{piece.typeHint}"
            readonly="{parent.opts.readonly}"
            style="width: {getValue(piece.key) ? Math.min((''+getValue(piece.key)).length + 1, 32) : 5}ch"
        )
        span.catnip-block-aConstantInput.menu(
            ondrop="{parent.onDrop}"
            ondragenter="{parent.handlePreDrop}"
            ondragstart="{parent.handlePreDrop}"
            if="{piece.type === 'argument' && piece.assets && (!getValue(piece.key) || (typeof getValue(piece.key)) !== 'object')}"
            class="{piece.typeHint}"
            onclick="{!parent.opts.readonly && promptAsset}"
        )
            svg.feather(if="{!getValue(piece.key)}")
                use(xlink:href="#search")
            span(if="{!getValue(piece.key)}") {voc('common.selectDialogue')}
            svg.feather(if="{getValue(piece.key) && areThumbnailsIcons(piece.assets)}")
                use(xlink:href="#{getThumbnail(piece.assets, getValue(piece.key))}")
            img(
                if="{getValue(piece.key) && !areThumbnailsIcons(piece.assets)}"
                src="{getThumbnail(piece.assets, getValue(piece.key))}"
                class="{soundthumbnail: piece.assets === 'sound'}"
            )
            span(if="{getValue(piece.key)}") {getName(piece.assets, getValue(piece.key))}
    context-menu(if="{contextPiece}" menu="{contextMenu}" ref="menu")
    asset-selector(
        if="{selectingAssetType}"
        assettypes="{selectingAssetType}"
        onselected="{selectAsset}"
        oncancelled="{cancelAssetSelection}"
    )
    script.
        const {
            getDeclaration,
            getTransmissionType,
            getTransmissionReturnVal,
            startBlocksTrasmit,
            endBlocksTransmit,
            setSuggestedTarget,
            emptyTexture
        } = require('./data/node_requires/catnip');
        const {
            getName,
            getById,
            areThumbnailsIcons,
            getThumbnail
        } = require('./data/node_requires/resources');
        this.getName = (assetType, id) => getName(getById(assetType, id));
        this.areThumbnailsIcons = areThumbnailsIcons;
        this.getThumbnail = (assetType, id) => getThumbnail(getById(assetType, id), false, false);
        const {getByPath} = require('./data/node_requires/i18n');
        this.voc = getByPath;

        this.declaration = getDeclaration(this.opts.block.lib, this.opts.block.code);
        this.getValue = key => {
            return this.opts.block.values[key];
        };
        // A random ID that is used during block tree traversal
        // to prevent putting a block into itself or its children.
        this.id = require('./data/node_requires/generateGUID')();

        this.dragging = false;

        this.getHidden = () => this.dragging;

        this.onDragStart = e => {
            this.update();
            e.dataTransfer.setData('ctjsblocks/computed', 'hello uwu');
            e.dataTransfer.setDragImage(emptyTexture, 0, 0);
            console.log(e.item);
            const sourcePiece = e.item.piece;
            const bounds = e.target.getBoundingClientRect();
            window.signals.trigger(
                'blockTransmissionStart',
                e,
                e.target.outerHTML,
                bounds.left - e.clientX,
                bounds.top - e.clientY
            );
            startBlocksTrasmit([this.opts.block.values[sourcePiece.key]], this.opts.block.values, sourcePiece.key);
            e.stopPropagation();
            this.hoveredOver = null;
        };
        this.onDragEnd = e => {
            setSuggestedTarget();
        };

        this.writeConstantVal = e => {
            const {piece} = e.item;
            let val = e.target.value;
            if (piece.typeHint === 'number') {
                val = Number(e.target.value) || 0;
            } else if (piece.typeHint === 'boolean') {
                val = val.trim() === 'true';
            } else if (piece.typeHint === 'wildcard' && Number.isFinite(Number(e.target.value))) {
                val = Number(e.target.value);
            }
            this.opts.block.values[piece.key] = val;
        };

        const isInvalidDrop = e =>
            this.opts.readonly || !e.dataTransfer.types.includes('ctjsblocks/computed');
        this.handlePreDrop = e => {
            if (!isInvalidDrop(e)) {
                e.preventDefault(); // Tells that we do want to accept the drop
            }
        };
        this.onDrop = e => {
            if (isInvalidDrop(e)) {
                return;
            }
            // Disallow commands
            if (getTransmissionType() !== 'computed') {
                return;
            }
            // Disallow non-matching types
            if (e.item.piece.typeHint !== 'wildcard' &&
                getTransmissionReturnVal() !== 'wildcard' &&
                e.item.piece.typeHint !== getTransmissionReturnVal()
            ) {
                return false;
            }
            this.hoveredOver = null;
            e.preventDefault();
            e.stopPropagation();
            endBlocksTransmit(this.opts.block.values, e.item.piece.key);
        };


        this.contextPiece = false;
        this.onContextMenu = e => {
            e.preventDefault();
            e.stopPropagation();
            const {piece} = e.item;
            this.contextPiece = piece;
            this.update();
            this.refs.menu.popup(e.clientX, e.clientY);
        };
        this.contextMenu = {
            opened: true,
            items: [{
                label: getByPath('common.delete'),
                icon: 'trash',
                click: () => {
                    delete this.opts.block.values[this.contextPiece.key];
                    this.contextPiece = false;
                    this.update();
                }
            }]
        };


        this.selectingAssetType = this.selectingAssetPiece = false;
        this.promptAsset = e => {
            const {piece} = e.item;
            this.selectingAssetType = piece.assets;
            this.selectingAssetPiece = piece;
        };
        this.selectAsset = id => {
            this.opts.block.values[this.selectingAssetPiece.key] = id;
            this.selectingAssetType = this.selectingAssetPiece = false;
            this.update();
        };
        this.cancelAssetSelection = () => {
            this.selectingAssetType = this.selectingAssetPiece = false;
            this.update();
        };
