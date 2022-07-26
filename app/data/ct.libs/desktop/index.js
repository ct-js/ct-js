ct.desktop = {
    isNw: Boolean(window.nw && window.nw.App),
    isElectron: null,
    //eslint-disable-next-line consistent-return
    desktopFeature(feature) {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('[ct.desktop.' + feature.name + '] Game is running inside ct.js\'s debugger, Desktop features only work in desktop exports! :c');
            } else if (feature.return === true) {
                return nw[feature.nw.namespace][feature.nw.method](feature.nw.parameter);
            } else {
                nw[feature.nw.namespace][feature.nw.method](feature.nw.parameter);
            }
        } else if (ct.desktop.isElectron) {
            if (feature.return === true) {
                const {ipcRenderer} = require('electron');
                ipcRenderer.invoke(feature.electron.channel, feature.electron.parameter);
                return ipcRenderer.on(feature.electron.channel, (event, message) => message);
            }
        } else {
            //eslint-disable-next-line no-console
            console.error('[ct.desktop.' + feature.name + '] Unknown environment :c Are we in a browser?');
        }
    },
    closeDevTools() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t close the debugger because this is running inside of ct.js\'s editor! Let\'s imagine it actually did close like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.closeDevTools();
            }
        } else if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.closeDevTools');
        } else {
            //eslint-disable-next-line no-console
            console.error('[ct.desktop.closeDevTools] Unknown environment :c Are we in a browser?');
        }
    },
    quit() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t quit because ct.js\'s editor would close as well. Let\'s imagine that the game has exited like it would in a desktop export! :D');
            } else {
                nw.App.quit();
            }
        } else if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.quit');
        } else {
            console.error('[ct.desktop.quit] Unknown environment :c Are we in a browser?');
        }
    },
    show() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t show the window because ct.js\'s editor is already showing. Let\'s imagine it just showed and refocused like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.show();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.show');
        } else {
            console.error('[ct.desktop.show] Unknown environment :c Are we in a browser?');
        }
    },
    hide() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t hide the window because it is running in ct.js\'s editor. Let\'s imagine it became hidden like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.hide();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.hide');
        } else {
            console.error('[ct.desktop.hide] Unknown environment :c Are we in a browser?');
        }
    },
    maximize() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t maximize the window because it is running in ct.js\'s editor. Let\'s imagine it became maximized like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.maximize();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.maximize');
        } else {
            console.error('[ct.desktop.maximize] Unknown environment :c Are we in a browser?');
        }
    },
    unmaximize() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t unmaximize the window because it is running in ct.js\'s editor. Let\'s imagine it unmaximized like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.unmaximize();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.unmaximize');
        } else {
            console.error('[ct.desktop.unmaximize] Unknown environment :c Are we in a browser?');
        }
    },
    minimize() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t minimize the window because it is running in ct.js\'s editor. Let\'s imagine it minimize like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.minimize();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.minimize');
        } else {
            console.error('[ct.desktop.minimize] Unknown environment :c Are we in a browser?');
        }
    },
    restore() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t restore the window because it is running in ct.js\'s editor. Let\'s imagine it restored like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.restore();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.restore');
        } else {
            console.error('[ct.desktop.restore] Unknown environment :c Are we in a browser?');
        }
    },
    fullscreen() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t fullscreen the window because it is running in ct.js\'s editor. Let\'s imagine it fullscreened like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.enterFullscreen();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.fullscreen');
        } else {
            console.error('[ct.desktop.fullscreen] Unknown environment :c Are we in a browser?');
        }
    },
    unfullscreen() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t leave fullscreen because the game is running in ct.js\'s editor. Let\'s imagine it left fullscreen like it would in a desktop export! :D');
            } else {
                const win = nw.Window.get();
                win.leaveFullscreen();
            }
        }
        if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop.unfullscreen');
        } else {
            console.error('[ct.desktop.unfullscreen] Unknown environment :c Are we in a browser?');
        }
    }
};

try {
    require('electron');
    ct.desktop.isElectron = true;
} catch (e) {
    ct.desktop.isElectron = false;
}

ct.desktop.isDesktop = ct.desktop.isNw || ct.desktop.isElectron;
