ct.desktop = {
    /* Initialize Properties */
    isNw: null,
    isElectron: null,
    isDesktop: null,

    /* Define Main Function */
    //eslint-disable-next-line consistent-return
    desktopFeature(feature) {
        /* Set Defaults for Undefined Parameters */
        feature.return ||= false;
        feature.electron ||= {};
        feature.nw.method ||= feature.name;
        feature.nw.parameter ||= feature.parameter;
        feature.electron.channel ||= feature.name;
        feature.electron.parameter ||= feature.parameter;
        feature.electron.returnTimeout ||= 10;
        /* Define Functionality for NW.js */
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('[ct.desktop.' + feature.name + '] The game is running inside ct.js\'s debugger, desktop features will only work in desktop exports! :c');
            } else if (feature.return === true && feature.nw.namespace === 'win') {
                const win = nw.Window.get();
                return win[feature.nw.method](feature.nw.parameter);
            } else if (feature.return === true && feature.nw.namespace === 'App') {
                return nw[feature.nw.namesapce][feature.nw.method](feature.nw.parameter);
            } else if (feature.return === false && feature.nw.namesapce === 'win') {
                const win = nw.Window.get();
                win[feature.nw.method](feature.nw.parameter);
            } else if (feature.return === false && feature.nw.namesapce === 'App') {
                nw[feature.nw.namespace][feature.nw.method](feature.nw.parameter);
            } else {
                console.error('[ct.desktop.' + feature.name + '] Desktop feature\'s NW.js functionality failed :c');
            }
        /* Define Functionality for Electron */
        } else if (ct.desktop.isElectron) {
            if (feature.return === true) {
                const {ipcRenderer} = require('electron');
                return ipcRenderer.sendSync('ct.desktop', feature, feature.electron.parameter);
            } else if (feature.return === false) {
                const {ipcRenderer} = require('electron');
                ipcRenderer.sendSync('ct.desktop', feature, feature.electron.parameter);
            } else {
                console.error('[ct.desktop.' + feature.name + '] Desktop feature\'s Electron functionality failed :c');
            }
        /* Define Functionality for Unkown Environments */
        } else {
            console.error('[ct.desktop.' + feature.name + '] Unknown environment :c Are we in a browser?');
        }
    },

    /* Define Methods Using Main Function */
    openDevTools(options) {
        this.desktopFeature({
            name: 'openDevTools',
            nw: {
                namespace: 'win',
                method: 'showDevTools'
            },
            electron: {
                parameter: options
            }
        });
    },
    closeDevTools() {
        this.desktopFeature({
            name: 'closeDevTools',
            nw: {
                namespace: 'win'
            }
        });
    },
    isDevToolsOpen() {
        return this.desktopFeature({
            name: 'isDevToolsOpen',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {
                channel: 'isDevToolsOpened'
            }
        });
    },
    quit() {
        this.desktopFeature({
            name: 'quit',
            nw: {
                namespace: 'App'
            }
        });
    },
    show() {
        this.desktopFeature({
            name: 'show',
            nw: {
                namespace: 'win'
            }
        });
    },
    hide() {
        this.desktopFeature({
            name: 'hide',
            nw: {
                namespace: 'win'
            }
        });
    },
    isVisible() {
        return this.desktopFeature({
            name: 'isVisible',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {}
        });
    },
    maximize() {
        this.desktopFeature({
            name: 'maximize',
            nw: {
                namespace: 'win'
            }
        });
    },
    unmaximize() {
        this.desktopFeature({
            name: 'unmaximize',
            nw: {
                namespace: 'win'
            }
        });
    },
    isMaximized() {
        return this.desktopFeature({
            name: 'isMaximized',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {}
        });
    },
    minimize() {
        this.desktopFeature({
            name: 'minimize',
            nw: {
                namespace: 'win'
            }
        });
    },
    restore() {
        this.desktopFeature({
            name: 'restore',
            nw: {
                namespace: 'win'
            }
        });
    },
    isMinimized() {
        return this.desktopFeature({
            name: 'isMinimized',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {}
        });
    },
    fullscreen() {
        this.desktopFeature({
            name: 'fullscreen',
            nw: {
                namespace: 'win',
                method: 'enterFullscreen'
            }
        });
    },
    unfullscreen() {
        this.desktopFeature({
            name: 'unfullscreen',
            nw: {
                namespace: 'win',
                method: 'leaveFullscreen'
            }
        });
    },
    isFullscreen() {
        return this.desktopFeature({
            name: 'isFullscreen',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {}
        });
    }
};

/* Set Prevously Initialized Properties */
try {
    ct.desktop.isNw = Boolean(nw && nw.App);
} catch (e) {
    ct.desktop.isNw = false;
}
try {
    require('electron');
    ct.desktop.isElectron = true;
} catch (e) {
    ct.desktop.isElectron = false;
}
ct.desktop.isDesktop = ct.desktop.isNw || ct.desktop.isElectron;
