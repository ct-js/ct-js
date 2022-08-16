const {app, BrowserWindow, ipcMain} = require('electron');

const pckg = require('./package.json');
const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
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
    if (feature.return === true) {
        if (feature.electron.namespace.split('.').length === 1) {
            if (feature.electron.namespace.split('.')[0] === 'mainWindow') {
                const webContents = event.sender;
                const mainWindow = BrowserWindow.fromWebContents(webContents);
                event.returnValue = mainWindow[feature.electron.method](parameter);
            } else {
                event.returnValue = this[feature.electron.namespace.split('.')[0]][feature.electron.method](parameter);
            }
        } else if (feature.electron.namespace.split('.').length === 2) {
            if (feature.electron.namespace.split('.')[0] === 'mainWindow') {
                const webContents = event.sender;
                const mainWindow = BrowserWindow.fromWebContents(webContents);
                event.returnValue = mainWindow[feature.electron.namespace.split('.')[1]][feature.electron.method](parameter);
            } else {
                event.returnValue = this[feature.electron.namespace.split('.')[0]][feature.electron.namespace.split('.')[1]][feature.electron.method](parameter);
            }
        }
    } else if (feature.return === false) {
        if (feature.electron.namespace.split('.').length === 1) {
            if (feature.electron.namespace.split('.')[0] === 'mainWindow') {
                const webContents = event.sender;
                const mainWindow = BrowserWindow.fromWebContents(webContents);
                mainWindow[feature.electron.method](parameter);
                event.returnValue = true;
            } else {
                this[feature.electron.namespace.split('.')[0]][feature.electron.method](parameter);
                event.returnValue = true;
            }
        } else if (feature.electron.namespace.split('.').length === 2) {
            if (feature.electron.namespace.split('.')[0] === 'mainWindow') {
                const webContents = event.sender;
                const mainWindow = BrowserWindow.fromWebContents(webContents);
                mainWindow[feature.electron.namespace.split('.')[1]][feature.electron.method](parameter);
                event.returnValue = true;
            } else {
                this[feature.electron.namespace.split('.')[0]][feature.electron.namespace.split('.')[1]][feature.electron.method](parameter);
                event.returnValue = true;
            }
        }
    }
});
