const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const net = require('net');
const http = require('http');

let mainWindow = null;

// Find an available port, preferring 3000
function getAvailablePort(preferredPort = 3000) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      // Preferred port in use, select random free port
      const fallback = net.createServer();
      fallback.unref();
      fallback.listen(0, '127.0.0.1', () => {
        const port = fallback.address().port;
        fallback.close(() => resolve(port));
      });
    });
    server.listen(preferredPort, '127.0.0.1', () => {
      server.close(() => resolve(preferredPort));
    });
  });
}

// Wait for the backend /api/health endpoint to be ready
function waitForServer(port, timeout = 12000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      });
      req.on('error', retry);
      req.setTimeout(500, () => {
        req.destroy();
        retry();
      });
    }

    function retry() {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Backend server did not respond in time'));
      } else {
        setTimeout(check, 100);
      }
    }

    check();
  });
}

async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 980,
    minHeight: 640,
    title: 'JstNotes - Cognito IDE',
    backgroundColor: '#0f172a',
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Open external links in user's default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const url = `http://127.0.0.1:${port}`;
  await mainWindow.loadURL(url);
}

async function startApp() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const port = await getAvailablePort(3000);

  process.env.PORT = String(port);
  process.env.NODE_ENV = isDev ? 'development' : 'production';
  process.env.DIST_PATH = path.join(__dirname, '../dist');

  // Start the express backend server
  try {
    require('../dist/server.cjs');
  } catch (err) {
    console.error('Failed to initialize server.cjs:', err);
  }

  try {
    await waitForServer(port);
    await createWindow(port);
  } catch (err) {
    console.error('Error launching Cognito IDE window:', err);
  }
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(startApp);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    startApp();
  }
});
