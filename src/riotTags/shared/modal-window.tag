//
    @attribute [title] (string)
        An optional title that is shown above the yielded content.
    @attribute [nook] (atomic)
        Hides the OK button.
    @attribute [nocancel] (atomic)
        Hides the Cancel button.
    @attribute [oklabel] (string)
        The text to display on the OK button.
    @attribute [cancellabel] (string)
        The text to display on the Cancel button.
    @attribute [okicon] (string)
        The icon to display on the OK button.
    @attribute [cancelicon] (string)
        The icon to display on the Cancel button.

    @attribute [onaccept] (function)
        A callback function to be executed when the OK button is clicked.
    @attribute [oncancel] (function)
        A callback function to be executed when the Cancel button is clicked.

    @attribute [modalclassname] (string)
        The class name to apply to the modal window.

    @method toggle
    @method open
    @method close

modal-window
    .aDimmer.pad.fadein(if="{opened}")
        button.aDimmer-aCloseButton.forcebackground(if="{!opts.nocancel}" title="{vocGlob.close}" onclick="{close}")
            svg.feather
                use(xlink:href="#x")
        .aModal.pad.npb.cursordefault.appear.flexfix(class="{opts.modalclassname}")
            .flexfix-header(if="{opts.title}")
                h1 {opts.title}
            .flexfix-body
                <yield />
            .flexfix-footer.inset.flexrow
                button.nogrow(onclick="{close}" if="{!opts.nocancel}")
                    svg.feather(if="{opts.cancelicon}")
                        use(xlink:href="#{opts.cancelicon}")
                    |
                    |
                    span {opts.cancellabel ?? vocGlob.cancel}
                .aSpacer
                button.success.nogrow(onclick="{accept}" if="{!opts.noaccept}")
                    svg.feather(if="{opts.okicon}")
                        use(xlink:href="#{opts.okicon}")
                    |
                    |
                    span {opts.oklabel ?? vocGlob.ok}
    script.
        this.namespace = 'common';
        this.mixin(require('src/node_requires/riotMixins/voc').default);
        this.opened = false;

        this.close = () => {
            this.opts.oncancel?.();
            this.opened = false;
            this.update();
        };
        this.accept = () => {
            this.opts.onaccept?.();
            this.opened = false;
            this.update();
        };
        this.open = () => {
            this.opened = true;
            this.update();
        };
        this.toggle = () => {
            this.opened = !this.opened;
            this.update();
        };
