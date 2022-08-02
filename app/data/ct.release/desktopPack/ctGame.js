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

ipcMain.handle('ct.desktop.openDevTools', (event, options) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.webContents.openDevTools(options);
});

ipcMain.handle('ct.desktop.closeDevTools', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.webContents.closeDevTools();
});

ipcMain.on('ct.desktop.isDevToolsOpened', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    event.returnValue = mainWindow.webContents.isDevToolsOpened();
});

ipcMain.handle('ct.desktop.quit', () => {
    app.quit();
});

ipcMain.handle('ct.desktop.show', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.show();
});

ipcMain.handle('ct.desktop.hide', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.hide();
});

ipcMain.handle('ct.desktop.maximize', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.maximize();
});

ipcMain.handle('ct.desktop.unmaximize', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.unmaximize();
});

ipcMain.handle('ct.desktop.minimize', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.minimize();
});

ipcMain.handle('ct.desktop.restore', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.restore();
});

ipcMain.handle('ct.desktop.fullscreen', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.setFullScreen(true);
});

ipcMain.handle('ct.desktop.unfullscreen', (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    mainWindow.setFullScreen(false);
});
