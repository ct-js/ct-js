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
        event.returnValue = this[namespace[0]][feature.electron.method](parameter);
    } else if (feature.electron.namespace.split('.').length === 2) {
        event.returnValue = this[namespace[0]][namespace[1]][feature.electron.method](parameter);
    }
});
