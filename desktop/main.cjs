const { app, BrowserWindow, shell, session } = require('electron');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');

const APP_TITLE = 'Project Amazon PH Academy SimGrid';
const APP_ROOT = app.getAppPath();
const START_PAGE = path.join(APP_ROOT, 'index.html');

let mainWindow;

function isLocalAppUrl(url) {
  if (!url.startsWith('file://')) return false;

  try {
    const localPath = path.normalize(fileURLToPath(url));
    const appRoot = path.normalize(APP_ROOT);
    return localPath === appRoot || localPath.startsWith(`${appRoot}${path.sep}`);
  } catch {
    return false;
  }
}

function openExternalUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    void shell.openExternal(url);
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: APP_TITLE,
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f7f8fa',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isLocalAppUrl(url)) return;
    event.preventDefault();
    openExternalUrl(url);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  void mainWindow.loadURL(pathToFileURL(START_PAGE).toString());
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.projectamazonph.simgrid');
  }

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    // The simulators do not need camera, microphone, notifications, or location access.
    callback(permission === 'clipboard-read' || permission === 'clipboard-sanitized-write');
  });

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
