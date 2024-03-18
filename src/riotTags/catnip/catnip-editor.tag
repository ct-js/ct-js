//-
    @attribute event (IScriptableEvent)
    @attribute asset (IScriptable)
catnip-editor.flexrow
    .pad.dim(if="{!opts.event}") {vocFull.scriptables.createEventHint}
    catnip-block-list.catnip-editor-scriptable-aCanvas(
        ref="canvas"
        blocks="{opts.event.code}"
        showplaceholder="showplaceholder"
        if="{opts.event.code}"
    )
    .flexfix(ondragenter="{handlePreDrop}" ondragover="{handlePreDrop}")
        catnip-library.flexfix-body(
            props="{opts.asset.properties}"
            variables="{opts.event.variables}"
        )
        .flexfix-footer.catnip-editor-aTrashZone(
            title="{voc.trashZoneHint}"
            ondragenter="{handlePreDrop}"
            ondragover="{handlePreDrop}"
            ondrop="{nuke}"
        )
            svg.feather
                use(xlink:href="#trash")
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);
        const isInvalidDrop = e =>
            !e.dataTransfer.types.includes('ctjsblocks/computed') &&
            !e.dataTransfer.types.includes('ctjsblocks/command');
        this.handlePreDrop = e => {
            if (!isInvalidDrop(e)) {
                e.preventDefault(); // Tells that we do want to accept the drop
            }
        };

        const {endBlocksTransmit} = require('./data/node_requires/catnip');
        this.nuke = e => {
            if (isInvalidDrop(e)) {
                return;
            }
            // Put blocks in a newly-created array, which will then be garbage-collected.
            endBlocksTransmit([], 0);
            e.preventDefault();
            e.stopPropagation();
        };
