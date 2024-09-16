main-menu-settings
    h1 {voc.heading}
    ul.aMenu
        li(onclick="{toggleThemeSelector}")
            svg.feather
                use(xlink:href="#droplet")
            span {voc.theme}
        li(onclick="{toggleLanguageSelector}")
            svg.feather
                use(xlink:href="#translate")
            span {voc.language}
        li(onclick="{toggleCodeFontSelector}")
            svg.feather
                use(xlink:href="#font")
            span {voc.codeFont}
        li(onclick="{togglePrideMode}")
            svg.feather
                use(xlink:href="#{localStorage.prideMode === 'on' ? 'check-square' : 'square'}")
            span {voc.prideMode}
    ul.aMenu
        li(onclick="{toggleAutoapplyOnLaunch}" title="{voc.autoapplyOnLaunch}")
            svg.feather
                use(xlink:href="#{localStorage.autoapplyOnLaunch === 'on' ? 'check-square' : 'square'}")
            span {voc.autoapplyOnLaunch}
        li(onclick="{toggleTemplatesLayout}" title="{voc.altTemplateLayout}")
            svg.feather
                use(xlink:href="#{localStorage.altTemplateLayout === 'on' ? 'check-square' : 'square'}")
            span {voc.altTemplateLayout}
        li(
            if="{window.currentProject.language === 'catnip'}"
            onclick="{toggleCatnipLayout}"
            title="{voc.scrollableCatnipLibrary}"
        )
            svg.feather
                use(xlink:href="#{localStorage.scrollableCatnipLibrary === 'on' ? 'check-square' : 'square'}")
            span {voc.scrollableCatnipLibrary}
        li(onclick="{toggleSounds}" title="{voc.disableSounds}")
            svg.feather
                use(xlink:href="#{localStorage.disableSounds === 'on' ? 'check-square' : 'square'}")
            span {voc.disableSounds}
        li(onclick="{toggleProdProcedures}" title="{voc.forceProductionForDebug}")
            svg.feather
                use(xlink:href="#{localStorage.forceProductionForDebug === 'yes' ? 'check-square' : 'square'}")
            span {voc.forceProductionForDebug}
        li(onclick="{toggleDebuggerLayout}" title="{voc.changeDebuggerLayout}")
            svg.feather(if="{localStorage.debuggerMode === 'split'}")
                use(xlink:href="#layout-vertical")
            svg.feather(if="{localStorage.debuggerMode === 'multiwindow'}")
                use(xlink:href="#copy")
            svg.feather(if="{!localStorage.debuggerMode || localStorage.debuggerMode === 'automatic'}")
                use(xlink:href="#sparkles")
            span(if="{localStorage.debuggerMode === 'split'}") {voc.debuggerLayout}: {voc.debuggerLayouts.split}
            span(if="{localStorage.debuggerMode === 'multiwindow'}") {voc.debuggerLayout}: {voc.debuggerLayouts.multiwindow}
            span(if="{!localStorage.debuggerMode || localStorage.debuggerMode === 'automatic'}") {voc.debuggerLayout}: {voc.debuggerLayouts.automatic}
    ul.aMenu
        li(onclick="{zoomIn}")
            svg.feather
                use(xlink:href="#zoom-in")
            span {vocGlob.zoomIn}
        li(onclick="{zoomOut}")
            svg.feather
                use(xlink:href="#zoom-out")
            span {vocGlob.zoomOut}
    ul.aMenu
        li(onclick="{requestDataFolderChange}")
            svg.feather
                use(xlink:href="#folder")
            span {voc.changeDataFolder}
    context-menu(menu="{themesSubmenu}" ref="themeslist")
    context-menu(menu="{languagesSubmenu}" ref="languageslist")
    context-menu(menu="{codeFontSubmenu}" ref="codesettings")
    script.
        this.namespace = 'mainMenu.settings';
        this.mixin(require('src/node_requires/riotMixins/voc').default);

        this.openLanguageSelector = () => {
            this.showLanguageSelector = true;
        };

        this.toggleAutoapplyOnLaunch = () => {
            localStorage.autoapplyOnLaunch = localStorage.autoapplyOnLaunch === 'on' ? 'off' : 'on';
        };
        this.toggleTemplatesLayout = () => {
            localStorage.altTemplateLayout = localStorage.altTemplateLayout === 'on' ? 'off' : 'on';
        };
        this.toggleCatnipLayout = () => {
            localStorage.scrollableCatnipLibrary = localStorage.scrollableCatnipLibrary === 'on' ? 'off' : 'on';
        };
        this.toggleSounds = () => {
            localStorage.disableSounds = (localStorage.disableSounds || 'off') === 'off' ? 'on' : 'off';
        };

        this.togglePrideMode = () => {
            localStorage.prideMode = (localStorage.prideMode || 'off') === 'off' ? 'on' : 'off';
            window.signals.trigger('prideModeUpdated');
        };

        this.toggleLigatures = () => {
            localStorage.codeLigatures = localStorage.codeLigatures === 'off' ? 'on' : 'off';
            window.signals.trigger('codeFontUpdated');
        };
        this.toggleDenseCode = () => {
            localStorage.codeDense = localStorage.codeDense === 'off' ? 'on' : 'off';
            window.signals.trigger('codeFontUpdated');
        };
        this.toggleProdProcedures = () => {
            if (localStorage.forceProductionForDebug === 'yes') {
                localStorage.forceProductionForDebug = 'no';
            } else {
                localStorage.forceProductionForDebug = 'yes';
            }
        };
        this.toggleDebuggerLayout = () => {
            if (localStorage.debuggerMode === 'split') {
                localStorage.debuggerMode = 'multiwindow';
            } else if (localStorage.debuggerMode === 'multiwindow') {
                localStorage.debuggerMode = 'automatic';
            } else {
                localStorage.debuggerMode = 'split';
            }
        };

        this.requestDataFolderChange = () => {
            require('src/node_requires/platformUtils').requestWritableDir();
        };

        this.zoomIn = () => {
            const win = nw.Window.get();
            let zoom = win.zoomLevel + 0.5;
            if (Number.isNaN(zoom) || !zoom || !Number.isFinite(zoom)) {
                zoom = 0;
            } else if (zoom > 5) {
                zoom = 5;
            }
            win.zoomLevel = zoom;

            localStorage.editorZooming = zoom;
        };
        this.zoomOut = () => {
            const win = nw.Window.get();
            let zoom = win.zoomLevel - 0.5;
            if (Number.isNaN(zoom) || !zoom || !Number.isFinite(zoom)) {
                zoom = 0;
            } else if (zoom < -3) {
                zoom = -3;
            }
            win.zoomLevel = zoom;

            localStorage.editorZooming = zoom;
        };

        const themeManager = require('src/node_requires/themes');
        this.themesSubmenu = {
            opened: false,
            items: themeManager.getThemeList().map(theme => ({
                label: theme.translated,
                icon: () => localStorage.UItheme === theme.name && 'check',
                swatches: theme.swatches || [],
                click: async () => {
                    await themeManager.switchToTheme(theme.name);
                    this.update();
                }
            }))
        };

        this.switchLanguage = name => {
            const {loadLanguage} = require('src/node_requires/i18n.js');
            try {
                this.vocFull = loadLanguage(name);
                localStorage.appLanguage = name;
                window.signals.trigger('updateLocales');
                window.riot.update();
            } catch (e) {
                alertify.alert('Could not open a language file: ' + e);
            }
        };
        this.languagesSubmenu = {
            items: []
        };
        const {getLanguages} = require('src/node_requires/i18n');
        getLanguages().then(languages => {
            for (const language of languages) {
                this.languagesSubmenu.items.push({
                    label: language.filename === 'Debug.json' ? 'Debug' : `${language.meta.native} (${language.meta.eng})`,
                    icon: () => localStorage.appLanguage === language.filename.slice(0, -5) && 'check',
                    click: () => {
                        this.switchLanguage(language.filename.slice(0, -5));
                    }
                });
            }
        })
        .catch(e => {
            console.error(e);
            alertify.error(`Error while finding i18n files: ${e}`);
        })
        .finally(() => {
            this.languagesSubmenu.items.push({
                type: 'separator'
            }, {
                label: this.voc.translateToYourLanguage,
                icon: 'translate',
                click: () => {
                    nw.Shell.openExternal('https://github.com/ct-js/ct-js/tree/develop/app/data/i18n');
                }
            });
            this.update();
        });

        this.codeFontSubmenu = {
            items: [{
                label: this.vocFull.mainMenu.settings.codeFontDefault,
                icon: () => !localStorage.fontFamily && 'check',
                click: () => {
                    localStorage.fontFamily = '';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: 'Basis (Pooxel)',
                icon: () => localStorage.fontFamily === 'Basis, monospace' && 'check',
                click: () => {
                    localStorage.fontFamily = 'Basis, monospace';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: this.vocFull.mainMenu.settings.codeFontOldSchool,
                icon: () => localStorage.fontFamily === 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace' && 'check',
                click: () => {
                    localStorage.fontFamily = 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: this.vocFull.mainMenu.settings.codeFontSystem,
                icon: () => localStorage.fontFamily === 'monospace' && 'check',
                click: () => {
                    localStorage.fontFamily = 'monospace';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: this.vocFull.mainMenu.settings.codeFontCustom,
                click: () => {
                    alertify
                    .defaultValue(localStorage.fontFamily || '')
                    .prompt(this.vocFull.mainMenu.settings.newFont)
                    .then(e => {
                        if (e.inputValue && e.buttonClicked !== 'cancel') {
                            localStorage.fontFamily = `"${e.inputValue}", monospace`;
                        }
                        window.signals.trigger('codeFontUpdated');
                    });
                }
            }, {
                type: 'separator'
            }, {
                label: this.vocFull.mainMenu.settings.codeLigatures,
                type: 'checkbox',
                checked: () => localStorage.codeLigatures !== 'off',
                click: () => {
                    localStorage.codeLigatures = localStorage.codeLigatures === 'off' ? 'on' : 'off';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: this.vocFull.mainMenu.settings.codeDense,
                type: 'checkbox',
                checked: () => localStorage.codeDense === 'on',
                click: () => {
                    localStorage.codeDense = localStorage.codeDense === 'off' ? 'on' : 'off';
                    window.signals.trigger('codeFontUpdated');
                }
            }]
        };

        this.toggleThemeSelector = e => {
            this.refs.themeslist.popup(e.clientX, e.clientY);
        };
        this.toggleLanguageSelector = e => {
            this.refs.languageslist.popup(e.clientX, e.clientY);
        };
        this.toggleCodeFontSelector = e => {
            this.refs.codesettings.popup(e.clientX, e.clientY);
        };
