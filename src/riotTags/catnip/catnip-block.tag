//-
    @attribute block (IBlock)
        The block from the block script that is rendered
    @atribute [nodrag] (atomic)
        Prohibits dragging this block
    @attribute [readonly] (atomic)
        Prohibits editing this block and all its nested blocks

catnip-block(
    draggable="{!opts.nodrag}"
    class="{error: !declaration} {declaration.type} {declaration.typeHint} {opts.class} {declaration.customClass}"
    hide="{getHidden}"
    title="{declaration.documentation}"
)
    svg.feather(if="{!declaration}")
        use(xlink:href="#x")
    span(if="{!declaration}") {voc.errorBlock} "{opts.block.lib}" — {opts.block.code}. {voc.errorBlockDeleteHint}

    svg.feather(if="{declaration && declaration.icon && !declaration.hideIcon}")
        use(xlink:href="#{declaration.icon}")
    span.catnip-block-aTextLabel(if="{declaration && !declaration.hideLabel}")
        | {(voc.blockDisplayNames[declaration.displayI18nKey] || declaration.displayName) || (voc.blockNames[declaration.i18nKey] || declaration.name)}
    virtual(each="{piece in declaration.pieces}" if="{declaration}")
        span.catnip-block-aTextLabel(if="{piece.type === 'label'}") {voc.labels[piece.i18nKey] || piece.name}
        span.catnip-block-aTextLabel(if="{piece.type === 'propVar'}") {parent.opts.block.values.variableName}
        svg.feather(if="{piece.type === 'icon'}")
            use(xlink:href="#{piece.icon}")
        span.catnip-block-anAsyncMarker(if="{piece.type === 'asyncMarker'}" title="{voc.asyncHint}")
            svg.feather
                use(xlink:href="#clock")
        .catnip-block-aFiller(if="{piece.type === 'filler'}")
        .catnip-block-aBreak(if="{piece.type === 'break'}")
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
            style="width: {getValue(piece.key) ? Math.min((''+getValue(piece.key)).length + 0.5, 32) : piece.key.length + 0.5}ch"
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
            span(if="{!getValue(piece.key)}") {vocGlob.selectDialogue}
            svg.feather(if="{getValue(piece.key) && piece.assets === 'action'}")
                use(xlink:href="#airplay")
            svg.feather(if="{getValue(piece.key) && piece.assets !== 'action' && areThumbnailsIcons(piece.assets)}")
                use(xlink:href="#{getThumbnail(piece.assets, getValue(piece.key))}")
            img(
                if="{getValue(piece.key) && piece.assets !== 'action' && !areThumbnailsIcons(piece.assets)}"
                src="{getThumbnail(piece.assets, getValue(piece.key))}"
                class="{soundthumbnail: piece.assets === 'sound'}"
            )
            span(if="{getValue(piece.key) && piece.assets !== 'action'}") {getName(piece.assets, getValue(piece.key))}
            span(if="{getValue(piece.key) && piece.assets === 'action'}") {getValue(piece.key)}
    context-menu(if="{contextPiece}" menu="{contextMenu}" ref="menu")
    context-menu(if="{selectingAction}" menu="{actionsMenu}" ref="actionsmenu")
    asset-selector(
        if="{selectingAssetType}"
        assettypes="{selectingAssetType}"
        onselected="{selectAsset}"
        oncancelled="{cancelAssetSelection}"
    )
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);

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

        try {
            this.declaration = getDeclaration(this.opts.block.lib, this.opts.block.code);
        } catch (e) {
            console.error(e);
            this.declaration = false;
        }
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
            const sourcePiece = e.item.piece;
            try { // Prevent dragging broken blocks
                const block = this.opts.block.values[sourcePiece.key];
                getDeclaration(block.lib, block.code);
            } catch (oO) {
                e.stopPropagation();
                e.preventDefault();
                e.preventUpdate = true;
                return;
            }
            e.dataTransfer.setData('ctjsblocks/computed', 'hello uwu');
            e.dataTransfer.setDragImage(emptyTexture, 0, 0);
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
                e.preventUpdate = true;
                e.preventDefault(); // Tells that we do want to accept the drop
            }
        };
        this.onDrop = e => {
            if (isInvalidDrop(e)) {
                e.preventUpdate = true;
                return;
            }
            // Disallow commands
            if (getTransmissionType() !== 'computed') {
                e.preventUpdate = true;
                return;
            }
            // Disallow non-matching types
            if (e.item.piece.typeHint !== 'wildcard' &&
                getTransmissionReturnVal() !== 'wildcard' &&
                e.item.piece.typeHint !== getTransmissionReturnVal()
            ) {
                e.preventUpdate = true;
                return false;
            }
            this.hoveredOver = null;
            e.preventDefault();
            e.stopPropagation();
            endBlocksTransmit(this.opts.block.values, e.item.piece.key);
        };


        this.contextPiece = false;
        this.onContextMenu = e => {
            if (this.opts.readonly) {
                return;
            }
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
                label: this.vocGlob.delete,
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
            if (piece.assets === 'action') {
                this.selectingAction = true;
                this.actionsMenu = {
                    opened: true,
                    items: window.currentProject.actions.map(action => ({
                        label: action.name,
                        icon: 'airplay',
                        click: () => {
                            this.opts.block.values[piece.key] = action.name;
                            this.update();
                            this.selectingAction = false;
                        }
                    }))
                };
                this.update();
                this.refs.actionsmenu.popup(e.clientX, e.clientY);
            } else {
                this.selectingAssetType = piece.assets;
                this.selectingAssetPiece = piece;
            }
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
