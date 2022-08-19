const {app, BrowserWindow, ipcMain} = require('electron');
const pckg = require('./package.json');

let mainWindow;
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: pckg.window.width,
        height: pckg.window.height,
        center: true,
        resizable: true,
        title: pckg.window.title,
        icon: 'icon.png',
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: true,
            webviewTag: false,
            webSecurity: false,
            affinity: 'ctjsRenderer'
        }
    });
    mainWindow.removeMenu();
    mainWindow.loadFile('index.html');
    if (pckg.window.mode === 'fullscreen') {
        mainWindow.setFullScreen(true);
    } else if (pckg.window.mode === 'maximized') {
        mainWindow.maximize();
    }
};

app.on('ready', createMainWindow);

ipcMain.on('ct.desktop', (event, feature, parameter) => {
    const namespace = feature.electron.namespace.split('.');
    if (namespace.length === 1) {
        if (namespace[0] === 'app') {
            event.returnValue = app[feature.electron.method](parameter);
        } else if (namespace[0] === 'mainWindow') {
            event.returnValue = mainWindow[feature.electron.method](parameter);
        }
    } else if (namespace.length === 2) {
        if (namespace[0] === 'app') {
            event.returnValue = app[namespace[1]][feature.electron.method](parameter);
        } else if (namespace[0] === 'mainWindow') {
            event.returnValue = mainWindow[namespace[1]][feature.electron.method](parameter);
        }
    }
});
