scripts-panel
    h1.flexfix-header {voc.header}
    ul.menu.flexfix-body
        li(each="{script in global.currentProject.scripts}" name="{script.name}" onclick="{selectScript}" ondragstart="{dragStart}" ondragend="{dragEnd}" ondragover="{dragOver}" ondrop="{drop}" draggable="true")
            code {script.name}
            div.toright(onclick="{deleteScript}" title="{voc.deleteScript}")
                svg.feather.dim
                    use(xlink:href="data/icons.svg#delete")
    button.flexfix-footer(onclick="{addNewScript}")
        svg.feather
            use(xlink:href="data/icons.svg#plus")
        span {voc.addNew}
    script-editor(if="{currentScript}" script="{currentScript}")
    script.
        this.namespace = 'settings.scripts';
        this.mixin(window.riotVoc);
        this.currentProject = global.currentProject;
        this.currentProject.scripts = this.currentProject.scripts || [];

        this.addNewScript = e => {
            var script = {
                name: 'New Script',
                code: `/* ${this.voc.newScriptComment} */`
            };
            this.currentProject.scripts.push(script);
            this.currentScript = script;
        };
        this.selectScript = e => {
            this.currentScript = e.item.script;
        };
        this.deleteScript = e => {
            const script = e.item.script,
                  ind = this.currentProject.scripts.indexOf(script);
            this.currentProject.scripts.splice(ind, 1);
            for (const lib of glob.scriptTypings[script.name]) {
                lib.dispose();
            }
            delete glob.scriptTypings[script.name];
            e.stopPropagation();
        };

        this.event = {
            newIndex: 0
        };

        // https://stackoverflow.com/questions/25520904
        this.dragStart = e => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("srcId", e.currentTarget.name);
        };
        this.dragEnd = e => {
            e.dataTransfer.clearData("srcId");
        };
        this.dragOver = e => {
            e.preventDefault();
        };
        this.drop = e => {
            var srcId = e.dataTransfer.getData("srcId");
            let i = 0;
            for (let element of this.currentProject.scripts) {
                if (element.name == srcId) {
                    this.event.oldIndex = i;
                    // https://gist.github.com/kevinsalter/7a4a3cf64a6783ec755f697f93693f82
                    const movedItem = originalArray.find((item, index) => index === this.event.oldIndex);
                    const remainingItems = originalArray.filter((item, index) => index !== this.event.oldIndex);

                    const reorderedItems = [
                        ...remainingItems.slice(0, this.event.oldIndex),
                        movedItem,
                        ...remainingItems.slice(this.event.oldIndex)
                    ];

                    this.currentProject.scripts = reorderedItems;
                    break;
                }
                i++;
            }
        };

        const glob = require('./data/node_requires/glob');
        glob.scriptTypings = glob.scriptTypings || {};
        for (const script of global.currentProject.scripts) {
            glob.scriptTypings[script.name] = [
                monaco.languages.typescript.javascriptDefaults.addExtraLib(script.code),
                monaco.languages.typescript.typescriptDefaults.addExtraLib(script.code)
            ];
        }