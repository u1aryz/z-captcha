import { app, BrowserWindow, ipcMain } from 'electron';
import * as express from 'express';
import * as process from 'process';

const proxyConfig = {
  proxyRules: 'http://127.0.0.1:8200',
  pacScript: '',
  proxyBypassRules: '.google.com, .gstatic.com, unpkg.com',
};

let mainWindow: BrowserWindow | null;
let youtubeWindow: BrowserWindow | null;

const expressApp = express();
expressApp.get('/', async (_, res) => {
  res.sendFile('./recaptcha.html', {
    root: __dirname,
  });

  // Disable proxy
  mainWindow?.webContents.session.setProxy(
    {
      proxyRules: '',
      pacScript: '',
      proxyBypassRules: '',
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
  );
});
expressApp.use('/static', express.static(__dirname));
const server = expressApp.listen('8200');

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 640,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  await mainWindow.loadURL('http://localhost:8200/static');
};

app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-site-isolation-trials');

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  server.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

ipcMain.on('start-recaptcha', (_: unknown, arg: { url: string; sitekey: string }) => {
  mainWindow?.webContents.session.setProxy(proxyConfig, async () => {
    await mainWindow?.loadURL(arg.url);
  });
});

ipcMain.on('solve-recaptcha', (_: unknown, arg: string) => {
  console.log(arg);
  mainWindow?.webContents.session.setProxy(proxyConfig, () => mainWindow?.reload());
});

ipcMain.on('open-youtube', async () => {
  if (youtubeWindow == null) {
    youtubeWindow = new BrowserWindow({
      width: 600,
      height: 850,
    });
    youtubeWindow.on('closed', () => {
      youtubeWindow = null;
    });
    // https://github.com/firebase/firebase-js-sdk/issues/2478
    youtubeWindow.webContents.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) old-airport-include/1.0.0 Chrome Electron/7.1.7 Safari/537.36',
    );
    await youtubeWindow.loadURL(
      'https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Fnext%3D%252F%26hl%3Dja%26app%3Ddesktop%26action_handle_signin%3Dtrue&hl=ja&passive=true&service=youtube&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin',
    );
  } else {
    youtubeWindow.show();
  }
});
