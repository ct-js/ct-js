scripts-settings
    h1 {voc.heading}
    ul.menu
        li(each="{script, index in global.currentProject.scripts}" onclick="{selectScript}")
            code {script.name}
            .toright
                // Use forced opacity to keep nice layout
                div.anActionableIcon(onclick="{moveUp}" title="{voc.moveUp}" style="{index === 0? 'opacity: 0;' : ''}")
                    svg.feather
                        use(xlink:href="data/icons.svg#arrow-up")
                div.anActionableIcon(onclick="{moveDown}"  style="{index === global.currentProject.scripts.length - 1 ? 'opacity: 0;' : ''}" title="{voc.moveDown}")
                    svg.feather
                        use(xlink:href="data/icons.svg#arrow-down")
                div.anActionableIcon(onclick="{deleteScript}" title="{voc.deleteScript}")
                    svg.feather.red
                        use(xlink:href="data/icons.svg#delete")
    button(onclick="{addNewScript}")
        svg.feather
            use(xlink:href="data/icons.svg#plus")
        span {voc.addNew}
    script-editor(if="{currentScript}" script="{currentScript}")
    script.
        this.namespace = 'settings.scripts';
        this.mixin(window.riotVoc);
        this.currentProject = global.currentProject;
        this.currentProject.scripts = this.currentProject.scripts || [];

        const glob = require('./data/node_requires/glob');

        this.addNewScript = () => {
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
            const {script} = e.item,
                  ind = this.currentProject.scripts.indexOf(script);
            this.currentProject.scripts.splice(ind, 1);
            for (const lib of glob.scriptTypings[script.name]) {
                lib.dispose();
            }
            delete glob.scriptTypings[script.name];
            e.stopPropagation();
        };

        this.moveUp = e => {
            e.stopPropagation();
            const clickedScript = e.item.script;
            const top = [];
            const bottom = [];
            let topPush = true;
            for (const projScript of this.currentProject.scripts) {
                if (projScript === clickedScript) {
                    topPush = false;
                } else if (topPush) {
                    top.push(projScript);
                } else {
                    bottom.push(projScript);
                }
            }
            top.splice(top.length - 1, 0, clickedScript);
            const out = [...top, ...bottom];
            this.currentProject.scripts = out;
        };

        this.moveDown = e => {
            e.stopPropagation();
            const clickedScript = e.item.script;
            const top = [];
            const bottom = [];
            let topPush = true;
            for (const projScript of this.currentProject.scripts) {
                if (projScript === clickedScript) {
                    topPush = false;
                } else if (topPush) {
                    top.push(projScript);
                } else {
                    bottom.push(projScript);
                }
            }
            bottom.splice(1, 0, clickedScript);
            const out = [...top, ...bottom];
            this.currentProject.scripts = out;
        };