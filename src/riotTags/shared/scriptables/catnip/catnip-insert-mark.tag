//-
    Marks up an empty zone and shows a visual "insert (+)" prompt when hovered.
    Used as a dropzone for commands.
    When clicked on its own, triggers a search menu of the catnip-editor to show up.
catnip-insert-mark(ondragenter="{markClass}" ondragover="{markClass}" ondrop="{unmarkClass}" ondragleave="{unmarkClass}" class="{dragover: draggingOver} {opts.class}")
    .catnip-insert-mark-aLine
    .catnip-insert-mark-anIcon
        svg.feather
            use(xlink:href="#plus")
    script.
        this.draggingOver = false;
        this.markClass = () => {
            this.draggingOver = true;
        };
        this.unmarkClass = () => {
            this.draggingOver = false;
        };
