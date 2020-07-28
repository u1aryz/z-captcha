import { app, BrowserWindow, Config, ipcMain } from 'electron';
import * as http from 'http';
import * as process from 'process';
import * as express from 'express';
import * as mysql from 'promise-mysql';
import * as Store from 'electron-store';
import CaptchaDao from './captchaDao';
import { dbConfig } from './config';

class Main {
  private mainWindow: BrowserWindow | null = null;

  private youtubeWindow: BrowserWindow | null = null;

  private server: http.Server | null = null;

  private pool: mysql.Pool | null = null;

  private captchaDao: CaptchaDao | null = null;

  private store = new Store();

  private static setProxy(win: BrowserWindow, config: Config): Promise<void> {
    return new Promise<void>((resolve) => {
      win.webContents.session.setProxy(config, resolve);
    });
  }

  private static setProxyForCaptcha(win: BrowserWindow): Promise<void> {
    return Main.setProxy(win, {
      proxyRules: 'http://127.0.0.1:8200',
      pacScript: '',
      proxyBypassRules: '',
    });
  }

  private static disableProxy(win: BrowserWindow): Promise<void> {
    return Main.setProxy(win, {
      proxyRules: '',
      pacScript: '',
      proxyBypassRules: '',
    });
  }

  public async setup(): Promise<void> {
    app.commandLine.appendSwitch('disable-web-security');
    app.commandLine.appendSwitch('disable-site-isolation-trials');

    app.on('ready', async () => {
      await this.createMainWindow();
    });
    app.on('window-all-closed', async () => {
      await this.windowAllClosed();
    });
    app.on('activate', async () => {
      await this.activeApp();
    });

    ipcMain.on('start-recaptcha', async (_: unknown, arg: { url: string; sitekey: string }) => {
      await this.startRecaptcha(arg.url);
    });
    ipcMain.on('solve-recaptcha', async (_: unknown, arg: string) => {
      await this.onSolveCaptcha(arg);
    });
    ipcMain.on('open-youtube', async () => {
      await this.openYoutube();
    });

    const expressApp = express();
    expressApp.get('/', async (_, res) => {
      res.sendFile('./recaptcha.html', {
        root: __dirname,
      });
      if (this.mainWindow) {
        await Main.disableProxy(this.mainWindow);
      }
    });
    expressApp.use('/static', express.static(__dirname));
    this.server = expressApp.listen('8200');

    this.pool = await mysql.createPool(dbConfig);
    this.captchaDao = new CaptchaDao(this.pool);
  }

  private async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 500,
      height: 640,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
      },
    });
    await this.mainWindow.loadURL('http://localhost:8200/static');
  }

  private async windowAllClosed(): Promise<void> {
    if (process.platform !== 'darwin') {
      app.quit();
    }
    this.server?.close();
    await this.pool?.end();
  }

  private async activeApp(): Promise<void> {
    if (BrowserWindow.getAllWindows().length === 0) {
      await this.createMainWindow();
    }
  }

  private async startRecaptcha(url: string): Promise<void> {
    if (this.mainWindow) {
      await Main.setProxyForCaptcha(this.mainWindow);
      await this.mainWindow.loadURL(url);
    }
  }

  private async onSolveCaptcha(token: string): Promise<void> {
    const sitekey = this.store.get('sitekey', '') as string;
    await this.captchaDao?.add(sitekey, token);

    if (this.mainWindow) {
      await Main.setProxyForCaptcha(this.mainWindow);
      this.mainWindow.reload();
    }
  }

  private async openYoutube(): Promise<void> {
    if (this.youtubeWindow == null) {
      this.youtubeWindow = new BrowserWindow({
        width: 600,
        height: 850,
      });
      this.youtubeWindow.on('closed', () => {
        this.youtubeWindow = null;
      });
      // https://github.com/firebase/firebase-js-sdk/issues/2478
      this.youtubeWindow.webContents.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) old-airport-include/1.0.0 Chrome Electron/7.1.7 Safari/537.36',
      );
      await this.youtubeWindow.loadURL(
        'https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Fnext%3D%252F%26hl%3Dja%26app%3Ddesktop%26action_handle_signin%3Dtrue&hl=ja&passive=true&service=youtube&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin',
      );
    } else {
      this.youtubeWindow.show();
    }
  }
}

(async () => {
  await new Main().setup();
})();
