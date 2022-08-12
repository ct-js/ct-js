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
        feature.nw.method ||= feature.name;
        feature.nw.parameter ||= feature.parameter;
        feature.electron.method ||= feature.name;
        feature.electron.parameter ||= feature.parameter;
        /* Define Functionality for NW.js */
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('[ct.desktop.' + feature.name + '] The game is running inside ct.js\'s debugger, desktop features will only work in desktop exports! :c');
            } else if (feature.return === true && feature.nw.namespace === 'win') {
                const win = nw.Window.get();
                return win[feature.nw.method](feature.nw.parameter);
            } else if (feature.return === true) {
                return nw[feature.nw.namesapce][feature.nw.method](feature.nw.parameter);
            } else if (feature.return === false && feature.nw.namesapce === 'win') {
                const win = nw.Window.get();
                win[feature.nw.method](feature.nw.parameter);
            } else if (feature.return === false) {
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
        ct.desktop.desktopFeature({
            name: 'openDevTools',
            nw: {
                namespace: 'win',
                method: 'showDevTools'
            },
            electron: {
                namespace: 'mainWindow.webContents',
                parameter: options
            }
        });
    },
    closeDevTools() {
        ct.desktop.desktopFeature({
            name: 'closeDevTools',
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow.webContents'
            }
        });
    },
    isDevToolsOpen() {
        return ct.desktop.desktopFeature({
            name: 'isDevToolsOpen',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow.webContents',
                method: 'isDevToolsOpened'
            }
        });
    },
    quit() {
        ct.desktop.desktopFeature({
            name: 'quit',
            nw: {
                namespace: 'App'
            },
            electron: {
                namespace: 'app'
            }
        });
    },
    show() {
        ct.desktop.desktopFeature({
            name: 'show',
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    hide() {
        ct.desktop.desktopFeature({
            name: 'hide',
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    isVisible() {
        return ct.desktop.desktopFeature({
            name: 'isVisible',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    maximize() {
        ct.desktop.desktopFeature({
            name: 'maximize',
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    unmaximize() {
        ct.desktop.desktopFeature({
            name: 'unmaximize',
            nw: {
                namespace: 'win'
            }
        });
    },
    isMaximized() {
        return ct.desktop.desktopFeature({
            name: 'isMaximized',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    minimize() {
        ct.desktop.desktopFeature({
            name: 'minimize',
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    restore() {
        ct.desktop.desktopFeature({
            name: 'restore',
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    isMinimized() {
        return ct.desktop.desktopFeature({
            name: 'isMinimized',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
        });
    },
    fullscreen() {
        ct.desktop.desktopFeature({
            name: 'fullscreen',
            nw: {
                namespace: 'win',
                method: 'enterFullscreen'
            },
            electron: {
                namespace: 'mainWindow',
                method: 'setFullscreen',
                parameter: true
            }
        });
    },
    unfullscreen() {
        ct.desktop.desktopFeature({
            name: 'unfullscreen',
            nw: {
                namespace: 'win',
                method: 'leaveFullscreen'
            },
            electron: {
                namespace: 'mainWindow',
                method: 'setFullscreen',
                parameter: false
            }
        });
    },
    isFullscreen() {
        return ct.desktop.desktopFeature({
            name: 'isFullscreen',
            return: true,
            nw: {
                namespace: 'win'
            },
            electron: {
                namespace: 'mainWindow'
            }
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
