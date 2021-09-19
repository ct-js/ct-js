main-menu-settings
    h1 {voc.heading}
    ul.aMenu
        li(onclick="{toggleThemeSelector}")
            svg.feather
                use(xlink:href="data/icons.svg#droplet")
            span {voc.theme}
        li(onclick="{toggleLanguageSelector}")
            svg.feather
                use(xlink:href="data/icons.svg#translate")
            span {voc.language}
        li(onclick="{toggleCodeFontSelector}")
            svg.feather
                use(xlink:href="data/icons.svg#font")
            span {voc.codeFont}
    ul.aMenu
        li(onclick="{toggleSounds}")
            svg.feather
                use(xlink:href="data/icons.svg#{localStorage.disableSounds === 'on' ? 'check-square' : 'square'}")
            span {voc.disableSounds}
        li(onclick="{toggleProdProcedures}")
            svg.feather
                use(xlink:href="data/icons.svg#{localStorage.forceProductionForDebug === 'yes' ? 'check-square' : 'square'}")
            span {voc.forceProductionForDebug}
    ul.aMenu
        li(onclick="{zoomIn}")
            svg.feather
                use(xlink:href="data/icons.svg#zoom-in")
            span {vocGlob.zoomIn}
        li(onclick="{zoomOut}")
            svg.feather
                use(xlink:href="data/icons.svg#zoom-out")
            span {vocGlob.zoomOut}
    ul.aMenu
        li(onclick="{requestDataFolderChange}")
            svg.feather
                use(xlink:href="data/icons.svg#folder")
            span {voc.changeDataFolder}
    context-menu(menu="{themesSubmenu}" ref="themeslist")
    context-menu(menu="{languagesSubmenu}" ref="languageslist")
    context-menu(menu="{codeFontSubmenu}" ref="codesettings")
    script.
        this.namespace = 'mainMenu.settings';
        this.mixin(window.riotVoc);

        this.openLanguageSelector = () => {
            this.showLanguageSelector = true;
        };

        this.toggleSounds = () => {
            localStorage.disableSounds = (localStorage.disableSounds || 'off') === 'off' ? 'on' : 'off';
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

        this.requestDataFolderChange = () => {
            require('./data/node_requires/platformUtils').requestWritableDir();
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

        const fs = require('fs-extra'),
              path = require('path');

        const themeManager = require('./data/node_requires/themes');
        this.themesSubmenu = {
            opened: false,
            items: themeManager.getThemeList().map(theme => ({
                label: theme.translated,
                icon: () => localStorage.UItheme === theme.name && 'check',
                click: async () => {
                    await themeManager.switchToTheme(theme.name);
                    this.update();
                }
            }))
        };

        this.switchLanguage = name => {
            const i18n = require('./data/node_requires/i18n.js');
            try {
                window.languageJSON = i18n.loadLanguage(name);
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
        fs.readdir('./data/i18n/')
        .then(files => {
            Promise.all(files
                .filter(filename => path.extname(filename) === '.json')
                .filter(filename => filename !== 'Comments.json')
                .map(filename =>
                    fs.readJSON(path.join('./data/i18n/', filename))
                    .then(i18nJson => {
                        this.languagesSubmenu.items.push({
                            label: filename === 'Debug.json' ? 'Debug' : `${i18nJson.me.native} (${i18nJson.me.eng})`,
                            icon: () => localStorage.appLanguage === filename.slice(0, -5) && 'check',
                            click: () => {
                                this.switchLanguage(filename.slice(0, -5));
                            }
                        });
                    })
                    .catch(e => {
                        console.error(e);
                        alertify.error(`Error while reading an i18n file ${filename}: ${e}`);
                    })))
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
        })
        .catch(e => {
            alertify.alert('Could not get i18n files: ' + e);
        });

        this.codeFontSubmenu = {
            items: [{
                label: window.languageJSON.mainMenu.settings.codeFontDefault,
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
                label: window.languageJSON.mainMenu.settings.codeFontOldSchool,
                icon: () => localStorage.fontFamily === 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace' && 'check',
                click: () => {
                    localStorage.fontFamily = 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: window.languageJSON.mainMenu.settings.codeFontSystem,
                icon: () => localStorage.fontFamily === 'monospace' && 'check',
                click: () => {
                    localStorage.fontFamily = 'monospace';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: window.languageJSON.mainMenu.settings.codeFontCustom,
                click: () => {
                    alertify
                    .defaultValue(localStorage.fontFamily || '')
                    .prompt(window.languageJSON.mainMenu.settings.newFont)
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
                label: window.languageJSON.mainMenu.settings.codeLigatures,
                type: 'checkbox',
                checked: () => localStorage.codeLigatures !== 'off',
                click: () => {
                    localStorage.codeLigatures = localStorage.codeLigatures === 'off' ? 'on' : 'off';
                    window.signals.trigger('codeFontUpdated');
                }
            }, {
                label: window.languageJSON.mainMenu.settings.codeDense,
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
