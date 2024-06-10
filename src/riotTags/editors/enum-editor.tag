enum-editor.aView.pad
    h1 {asset.name}
    ul.aStripedList
        li(each="{values, ind in asset.values}")
            input(type="text" pattern="[a-zA-Z][a-zA-Z0-9]*" onchange="{wire('asset.values.' + ind)}" value="{values}")
            code.inline {getTypescriptEnumName()}.{values}
            .anActionableIcon(onclick="{removeVariant}")
                svg.feather
                    use(xlink:href="#trash")
    button(onclick="{addVariant}")
        svg.feather
            use(xlink:href="#plus")
        span {voc.addVariant}
    p.dim {voc.enumUseCases}
    .aSpacer
    button(onclick="{applyChanges}")
        svg.feather
            use(xlink:href="#check")
        span {vocGlob.apply}
    script.
        this.namespace = 'enumEditor';
        this.mixin(require('src/node_requires/riotMixins/voc').default);
        this.mixin(require('src/node_requires/riotMixins/wire').default);
        this.mixin(require('src/node_requires/riotMixins/discardio').default);
        const {getTypescriptEnumName} = require('src/node_requires/resources/enums');
        this.getTypescriptEnumName = () => getTypescriptEnumName(this.asset);

        this.addVariant = () => {
            let nameInd = 1;
            while (this.asset.values.includes(`Variant${nameInd}`)) {
                nameInd++;
            }
            this.asset.values.push(`Variant${nameInd}`);
        };
        this.removeVariant = e => {
            const {ind} = e.item;
            this.asset.values.splice(ind, 1);
        };
        this.saveAsset = () => {
            this.writeChanges();
            return true;
        };
        this.applyChanges = () => {
            this.saveAsset();
            this.opts.ondone(this.asset);
        };
