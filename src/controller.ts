import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';
import type { RawData } from 'ws';
import { WebSocketServer } from 'ws';
import { print } from './print';
import { ClientMessage } from './protocol';
import { Schedular } from './schedular';
import { shared } from './shared';
import type { ResolvedConfig } from './types';

export class Controller {
  private host?: string;

  private browser?: Browser;

  private page?: Page;

  private schedular!: Schedular;

  private get mode() {
    return process.env.PREVIEW ? 'preview' : 'test';
  }

  async createServer(config: ResolvedConfig) {
    const socket = config.perf.socket;
    const port = socket.port;
    const wss = new WebSocketServer({ port });

    wss.on('connection', (ws) => {
      ws.on('message', this.onMessage);
    });
  }

  async initBrowser() {
    this.browser = await chromium.launch({
      headless:
        this.mode === 'preview' ? false : shared.config.perf.browser.headless,
    });

    return this.browser;
  }

  async open(searchParams: Record<string, any> = {}) {
    await this.page?.close();

    this.page = await this.browser!.newPage();
    const url = new URL(this.host!);
    url.search = new URLSearchParams(searchParams).toString();
    await this.page.goto(url.toString());

    return this.page;
  }

  private onMessage = async (message: RawData) => {
    const data: ClientMessage = JSON.parse(message.toString());
    const { signal } = data;

    if (signal === 'ready') {
      const { userAgent, tasks } = data;
      this.schedular = new Schedular(userAgent, tasks);
    } else if (signal === 'report') {
      const {
        result: { status },
      } = data;

      if (status === 'passed') print.success(`Task ${data.task} completed`);
      else if (status === 'skipped') print.warn(`Task ${data.task} skipped`);
      else if (status === 'failed') print.error(`Task ${data.task} failed`);

      this.schedular.report(data);
    }

    const task = this.schedular.getTask();
    if (task) {
      this.open({ type: 'assign', task });
      print.info(`Running task: ${task}`);
    } else {
      await this.schedular.save();
      process.exit(0);
    }
  };

  async start(host: string) {
    this.host = host;
    await this.initBrowser();
    if (this.mode === 'preview') await this.open({ type: 'preview' });
    else await this.open({ type: 'init' });
  }
}
