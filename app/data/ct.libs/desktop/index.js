ct.desktop = {
    isNw: window.nw && window.nw.App,
    isElectron: null,
    openDevTools() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We can\'t open the debugger because it should already be open in ct.js! Let\'s imagine it opened! :D');
            } else {
                nw.win.showDevTools();
            }
        } else if (ct.desktop.isElectron) {
            require('electron').remote.getCurrentWindow().webContents.openDevTools();
        } else {
            //eslint-disable-next-line no-console
            console.error('[ct.desktop/openDevTools] Unknown environment :c Are we in a browser?');
        }
    },
    quit() {
        if (ct.desktop.isNw) {
            if (window.iAmInCtIdeDebugger) {
                // eslint-disable-next-line no-console
                console.warn('We don\'t quit because ct.js would quit as well. Let\'s imagine that the game has exited! :D');
            } else {
                nw.App.quit();
            }
        } else if (ct.desktop.isElectron) {
            require('electron').remote.getCurrentWindow().close();
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
