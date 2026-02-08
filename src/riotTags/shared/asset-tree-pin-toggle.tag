asset-tree-pin-toggle
    button.square.tiny(
        title="{voc.toggleFolderTree}"
        onclick="{toggle}"
        class="{active: localStorage.pinAssetBrowser === 'on'}"
    )
        svg.feather
            use(xlink:href="#pin")
    script.
        this.namespace = 'assetViewer';
        this.mixin(require('src/node_requires/riotMixins/voc').default);

        this.toggle = () => {
            localStorage.pinAssetBrowser = localStorage.pinAssetBrowser === 'on' ? 'off' : 'on';
            window.signals.trigger('assetBrowserPinChanged', localStorage.pinAssetBrowser);
            this.update();
        };
