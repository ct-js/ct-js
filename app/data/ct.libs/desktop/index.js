ct.desktop = {
    isNw: window.nw && window.nw.App,
    isElectron: null,
    openDevTools(options) {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t open the debugger because it should be open in ct.js\'s editor already! Let\'s imagine it opened just now! :D');
            } else {
                const win = nw.Window.get();
                win.showDevTools();
            }
        } else if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop', 'openDevTools', options);
        } else {
            //eslint-disable-next-line no-console
            console.error('[ct.desktop/openDevTools] Unknown environment :c Are we in a browser?');
        }
    },
    closeDevTools() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t close the debugger because this is running inside of ct.js\'s editor! Let\'s imagine it actually did close! :D');
            } else {
                const win = nw.Window.get();
                win.closeDevTools();
            }
        } else if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop', 'closeDevTools');
        } else {
            //eslint-disable-next-line no-console
            console.error('[ct.desktop/closeDevTools] Unknown environment :c Are we in a browser?');
        }
    },
    quit() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t quit because ct.js\'s editor would quit as well. Let\'s imagine that the game has exited! :D');
            } else {
                nw.App.quit();
            }
        } else if (ct.desktop.isElectron) {
            const {ipcRenderer} = require('electron');
            ipcRenderer.invoke('ct.desktop', 'quit');
        } else {
            console.error('[ct.desktop/quit] Unknown environment :c Are we in a browser?');
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
