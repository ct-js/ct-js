//
    A component that uses itself recursively to markup a folder tree
    of the project.
    Asset dropping logic is left in asset-browser for DRY purposes,
    but folder dropping is implemented here.

    TODO: support folder dropping from asset-browser.

    @attribute path (IAssetFolder[])
        Currently opened folders, from the root to the current directory.
    @attribute folderclick ((path: IAssetFolder[]) => (event: MouseEvent) => void;)
        A two-fold callback that triggers when any of the folders have been clicked.
        The callback will be passed with the full folder path to the target as its only argument
        in the first function and the DOM event in the second one.
    @attribute assetclick ((asset: IAsset) => (event: MouseEvent) => void;)
        A two-fold callback that triggers when an asset is clicked.
        The callback will be passed with the selected asset as its only argument
        in the first function and the DOM event in the second one.
    @attribute drop ((folder: IAssetFolder | null) => (event: DragEvent) => void;)
        A two-fold callback that triggers when a user drops anything on the folders
        via a drag-n-drop interaction.
        The callback will be passed with the selected folder as its only argument
        in the first function and the DOM event in the second one.
    @attribute [layoutchanged] (riot function)
        A callback with no arguments that is called whenever folders were moved
        by this tag.
    @attribute [showassets] (boolean)
        Whether to show assets in the folder tree.

asset-folder-tree
    .noshrink
        .asset-folder-tree-aFolder(
            onclick="{onOpenFolder}"
            ondrop="{onDrop}"
            ondragstart="{onFolderDrag}"
            ondragend="{updateParent}"
            draggable="{opts.path.length > 0}"
            style="top: {(depth - 1) * 2}em; z-index: {50 - depth}"
        )
            svg.feather(class="{opts.path.length && opts.path[opts.path.length - 1].colorClass}")
                use(xlink:href="#{opened ? 'folder-open' : 'folder'}")
            span  {(opts.path.length > 0) ? opts.path[opts.path.length - 1].name : voc.root}
        .asset-folder-tree-aSubtree(if="{opened}" class="{root: opts.path.length === 0}")
            asset-folder-tree(
                each="{entry in entries}"
                if="{entry.type === 'folder'}"
                path="{parent.opts.path.concat([entry])}"
                folderclick="{parent.opts.folderclick}"
                drop="{parent.opts.drop}"
                layoutchanged="{parent.opts.layoutchanged}"
                assetclick="{parent.opts.assetclick}"
                showassets="{parent.opts.showassets}"
            )
            .asset-folder-tree-anAsset(
                each="{entry in entries}"
                if="{opts.showassets && entry.type !== 'folder'}"
                onclick="{onAssetClick}"
                ondragstart="{onAssetDrag}"
                draggable="true"
            )
                img(
                    if="{!parent.usesIcons(entry)}"
                    src="{parent.getThumbnail(entry, currentLayout === 'largeCards', false)}"
                    class="{soundthumbnail: entry.type === 'sound' && entry.variants.length}"
                )
                svg.feather.group-icon.act(if="{parent.usesIcons(entry)}")
                    use(xlink:href="#{parent.getThumbnail(entry)}")
                span  {entry.name}
                |
                |
                span.dim {vocGlob.assetTypes[entry.type][0]}
    script.
        this.namespace = 'assetViewer';
        this.mixin(require('src/node_requires/riotMixins/voc').default);

        this.on('update', () => {
            this.depth = (this.parent.depth || 0) + 1;
        });

        const resources = require('src/node_requires/resources');
        this.getThumbnail = resources.getThumbnail;
        this.usesIcons = resources.areThumbnailsIcons;

        let prevPath = this.opts.path;
        const updateEntries = () => {
            // Empty path means we're at the root level — show all the assets
            this.entries = this.opts.path.length ?
                this.opts.path[this.opts.path.length - 1].entries :
                window.currentProject.assets;
        };
        updateEntries();
        this.on('update', () => {
            if (prevPath !== this.opts.path) {
                prevPath = this.opts.path;
                updateEntries();
            }
        });

        this.opened = this.opts.path.length < 1;
        this.toggle = () => {
            this.opened = !this.opened;
        };

        this.hasFolders = () => this.opts.path[this.opts.path.length - 1].entries
            .some(i => i.type === 'folder');

        this.updateParent = () => this.parent.update();

        this.onOpenFolder = e => {
            this.toggle();
            if (!this.opts.folderclick) {
                return;
            }
            this.opts.folderclick(this.opts.path)(e);
        };
        this.onAssetClick = e => {
            if (!this.opts.assetclick) {
                return;
            }
            this.opts.assetclick(e.item.entry)(e);
        };
        this.onFolderDrag = e => {
            const folder = this.opts.path[this.opts.path.length - 1];
            const transferData = {
                type: 'assetFolderDrag',
                folder: folder.uid
            };
            e.dataTransfer.setData('text/plain', JSON.stringify(transferData));
            e.dataTransfer.dropEffect = 'move';
        };
        this.onAssetDrag = e => {
            const asset = e.item.entry;
            const transferData = {
                type: 'assetDrag',
                asset: asset.uid
            };
            e.dataTransfer.setData('text/plain', JSON.stringify(transferData));
            e.dataTransfer.dropEffect = 'move';
        };
        this.onDrop = e => {
            const targetFolder = this.opts.path.length ?
                this.opts.path[this.opts.path.length - 1] :
                null;
            const dt = e.dataTransfer.getData('text/plain');
            let transferData;
            // Ensure that we can receive drag data
            try {
                transferData = JSON.parse(dt);
            } catch (oO) {
                void oO;
            }
            if (transferData && transferData.type === 'assetFolderDrag') {
                const uid = transferData.folder;
                const {moveFolder, getFolderById} = resources;
                try {
                    moveFolder(getFolderById(uid), targetFolder);
                    if (this.opts.layoutchanged) {
                        this.opts.layoutchanged();
                    }
                } catch (err) {
                    window.alertify.error(err.message);
                }
                return true;
            }
            if (transferData && transferData.type === 'assetDrag') {
                const uid = transferData.asset;
                const {moveAsset, getById} = resources;
                try {
                    moveAsset(getById(null, uid), targetFolder);
                    if (this.opts.layoutchanged) {
                        this.opts.layoutchanged();
                    }
                } catch (err) {
                    window.alertify.error(err.message);
                }
                return true;
            }
            // Can't process the data transfer itself; pass the event to the parent
            this.opts.drop(targetFolder)(e);
            this.parent.update();
            return false;
        };
