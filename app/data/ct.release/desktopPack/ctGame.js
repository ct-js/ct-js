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

ipcMain.handle('ct.desktop.openDevTools', async (event, options) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    await mainWindow.webContents.openDevTools(options);
});

ipcMain.handle('ct.desktop.closeDevTools', async (event) => {
    const webContents = event.sender;
    const mainWindow = BrowserWindow.fromWebContents(webContents);
    await mainWindow.webContents.closeDevTools();
});

ipcMain.handle('ct.desktop.quit', () => {
    app.quit();
});
