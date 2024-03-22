//-
    @attribute event (IScriptableEvent)
    @attribute asset (IScriptable)
catnip-editor.flexrow(onpointermove="{repositionGhost}" ondragover="{repositionGhost}" ondragend="{endGhost}")
    .pad.dim(if="{!opts.event}") {vocFull.scriptables.createEventHint}
    catnip-block-list.catnip-editor-scriptable-aCanvas(
        ref="canvas"
        blocks="{opts.event.code}"
        showplaceholder="showplaceholder"
        if="{opts.event}"
    )
    .flexfix(ondragenter="{handlePreDrop}" ondragover="{handlePreDrop}" if="{opts.event}")
        catnip-library.flexfix-body(
            props="{opts.asset.properties}"
            variables="{opts.event.variables}"
            asset="{opts.asset}"
            behaviorprops="{getBehaviorFields(opts.asset)}"
        )
        .flexfix-footer.catnip-editor-aTrashZone(
            title="{voc.trashZoneHint}"
            ondragenter="{handlePreDrop}"
            ondragover="{handlePreDrop}"
            ondrop="{nuke}"
        )
            svg.feather
                use(xlink:href="#trash")
    .catnip-editor-aGhost(ref="ghost")
    script.
        this.namespace = 'catnip';
        this.mixin(require('./data/node_requires/riotMixins/voc').default);
        const isInvalidDrop = e =>
            !e.dataTransfer.types.includes('ctjsblocks/computed') &&
            !e.dataTransfer.types.includes('ctjsblocks/command');
        this.handlePreDrop = e => {
            if (!isInvalidDrop(e)) {
                e.preventUpdate = true;
                e.preventDefault(); // Tells that we do want to accept the drop
            }
        };

        const {endBlocksTransmit,} = require('./data/node_requires/catnip');
        this.getBehaviorFields = require('./data/node_requires/events').getBehaviorFields;
        this.nuke = e => {
            if (isInvalidDrop(e)) {
                e.preventUpdate = true;
                return;
            }
            // Put blocks in a newly-created array, which will then be garbage-collected.
            endBlocksTransmit([], 0);
            e.preventDefault();
            e.stopPropagation();
        };

        this.blockGhost = '';
        this.dx = 0;
        this.dy = 0;
        const startGhost = (e, html, dx, dy) => {
            // check if we are in an opened editor
            if (!this.root.closest('[isactiveeditor]')) {
                e.preventUpdate = true;
                return;
            }
            this.blockGhost = html;
            this.dx = dx;
            this.dy = dy;
            this.refs.ghost.innerHTML = html;
            this.update();
            this.refs.ghost.style.left = `${e.clientX + this.dx}px`;
            this.refs.ghost.style.top = `${e.clientY + this.dy}px`;
        };
        this.endGhost = () => {
            this.refs.ghost.innerHTML = this.blockGhost = '';
            this.update();
        };
        window.signals.on('blockTransmissionStart', startGhost);
        window.signals.on('blockTransmissionEnd', this.endGhost);
        this.on('unmount', () => {
            window.signals.off('blockTransmissionStart', startGhost);
            window.signals.off('blockTransmissionEnd', this.endGhost);
        });
        this.repositionGhost = e => {
            if (!this.blockGhost || !this.refs.ghost) {
                e.preventUpdate = true;
                return;
            }
            this.refs.ghost.style.left = `${e.clientX + this.dx}px`;
            this.refs.ghost.style.top = `${e.clientY + this.dy}px`;
        };
