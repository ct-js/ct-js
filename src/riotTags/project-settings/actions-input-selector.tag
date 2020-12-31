actions-input-selector
    .panel.flexfix
        .flexfix-header
            .aSearchWrap.wide
                input.wide(
                    type="text"
                    ref="searchField"
                    value="{searchString}"
                    onkeyup="{wire('this.searchString')}"
                )
                svg.feather
                    use(xlink:href="data/icons.svg#search")
        .flexfix-body
            virtual(each="{module in inputProviders}")
                h2 {module.name}
                .anActionMethod(
                    onclick="{selectMethod(module.code+'.'+code)}"
                    each="{name, code in module.methods}"
                    class="{active: selectedMethods.indexOf(module.code+'.'+code) > -1}"
                    if="{!searchString || code.toLowerCase().indexOf(searchString.toLowerCase()) !== -1 || name.toLowerCase().indexOf(searchString.toLowerCase()) !== -1}"
                ).npl
                    code.inline.toright {module.code}.{code}
                    span   {name}
                    .clear

        .flexfix-footer
            .flexrow
                button.nml.secondary(onclick="{cancel}")
                    span {voc.cancel}
                button.nml.secondary(onclick="{apply}" disabled="{selectedMethods.length === 0}")
                    span {voc.select}
    script.
        this.namespace = 'common';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);

        const fs = require('fs-extra'),
              path = require('path');
        const libsDir = './data/ct.libs';

        this.selectedMethods = [];

        this.refreshModules = () => {
            this.inputProviders = [];
            const promises = [];
            for (const modName in global.currentProject.libs) {
                const promise =
                    fs.readJSON(path.join(libsDir, modName, 'module.json'))
                    .then(catmod => {
                        if (catmod.inputMethods) {
                            this.inputProviders.push({
                                name: catmod.main.name,
                                code: modName,
                                methods: catmod.inputMethods
                            });
                        }
                    });
                promises.push(promise);
            }
            Promise.all(promises)
            .finally(() => {
                this.update();
            });
        };
        this.refreshModules();
        
        window.signals.on('modulesChanged', this.refreshModules);
        this.on('unmount', () => {
            window.signals.off('modulesChanged', this.refreshModules);
        });

        this.selectMethod = (code) => () => {
            if (this.selectedMethods) {
                if (this.selectedMethods.indexOf(code) > -1) {
                    this.selectedMethods = this.selectedMethods.filter((methodCode) => methodCode !== code);
                } else {
                    this.selectedMethods.push(code);
                }
            } else {
                this.selectedMethods = [code];
            }
        };
        this.cancel = () => {
            this.searchString = '';
            this.selectedMethods = [];
            this.parent.addingMethod = false;
            this.parent.update();
        };
        this.apply = () => {
            this.selectedMethods.forEach((code) => {
                this.opts.action.methods.push({
                    code
                });
            });
            this.searchString = '';
            this.selectedMethods = [];
            this.parent.addingMethod = false;
            this.parent.update();
        };