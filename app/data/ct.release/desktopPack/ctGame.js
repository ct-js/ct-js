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

ipcMain.handle('ct.desktop', (event, name, parameter) => {
    if (name === 'openDevTools') {
        const webContents = event.sender;
        const mainWindow = BrowserWindow.fromWebContents(webContents);
        mainWindow.webContents.openDevTools(parameter);
        return;
    }
    if (name === 'closeDevTools') {
        const webContents = event.sender;
        const mainWindow = BrowserWindow.fromWebContents(webContents);
        mainWindow.webContents.closeDevTools();
        return;
    }
    if (name === 'quit') {
        app.quit();
    }
});
