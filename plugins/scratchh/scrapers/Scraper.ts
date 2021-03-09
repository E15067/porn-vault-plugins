import { promisify } from "util";
import { readFile } from "fs";

import { AxiosInstance } from "axios";
import { Context } from "../../../types/plugin";

const readFileAsync = promisify(readFile);

export interface IScraperArgs {
  baseUrl: string;
}

export interface IFetchOptions {
  query: string;
  fetch?: boolean;
}

export interface IItemOptions<T> {
  $el: cheerio.Cheerio | any;
  items: Map<string, T>;
  $?: cheerio.Root;
}

export abstract class Scraper<T, C extends Context> {

  client: AxiosInstance;
  ctx: C;

  abstract provider: string;
  validProviders: string[] = [];
  pagesSelector: string = "";
  itemsSelector: string = "";

  constructor(ctx: C) {
    this.client = ctx.$axios.create({
      baseURL: (ctx.args as IScraperArgs).baseUrl
    });
    this.ctx = ctx;
  }

  output(): string {
    const pluginDir = this.ctx.$path.dirname(this.ctx.$pluginPath);
    const providerSlug = this.provider.replace(" ", "-").toLowerCase();

    return this.ctx.$path.resolve(pluginDir, "data", `${providerSlug}-scenes.json`);
  }

  async read(): Promise<T[]> {
    const input = await readFileAsync(this.output(), "UTF-8");
    return JSON.parse(input);
  }

  async write(scenes: T[]): Promise<void> {
    const jsonInput = JSON.stringify(scenes, undefined, 2);
    await this.ctx.$fs.promises.writeFile(this.output(), jsonInput);
  }

  async get(endpoint: string): Promise<cheerio.Root> {
    this.ctx.$logger.info(`Fetching ${endpoint} for ${this.provider}`);
    const { data } = await this.client.get(endpoint);

    return this.ctx.$cheerio.load(data);
  }

  abstract endpoint(query: string): string;

  abstract item(_: IItemOptions<T>): void;

  async items(query: string): Promise<T[]> {
    const items = new Map();
    const q = this.unslugify(query);
    const endpoint = this.endpoint(q);

    const $ = await this.get(endpoint);
    $(this.itemsSelector)
        .each((_: number, el: cheerio.Element) => this.item({ $el: $(el), items, $ }));

    return Array.from(items.values());
  }

  async details(item: T): Promise<T> {
    return item;
  }

  unslugify(slug: string): string {
    return slug;
  }

  slugify(name: string): string {
    return name;
  }

  abstract find(query: string): (item: T) => boolean;

  async fetch({ query, fetch = true }: IFetchOptions): Promise<T | undefined> {
    if (!this.validProviders.includes(this.provider)) {
      return;
    }

    const items = fetch ? await this.items(query) : await this.read();
    const item = items.find(this.find(query));

    if (!item) {
      return;
    }

    return {
      ...item,
      ...(await this.details(item))
    };
  }
}
