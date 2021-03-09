import { SceneScraper } from "./SceneScraper"
// import { times } from "../utils";

import { IItemOptions } from './Scraper'
import { SceneOutput } from "../../../types/scene"

export class NaughtyAmericaApi extends SceneScraper {

  pagesSelector = ".pagination > li:last-child > a";
  itemsSelector = ".scene-item";
  validProviders = ["NaughtyAmerica", "NaughtyAmericaVR"];

  output(): string {
    if (this.provider === "NaughtyAmerica") {
      const pluginDir = this.ctx.$path.dirname(this.ctx.$pluginPath);
      const providerSlug = this.provider.replace(" ", "-").toLowerCase();
      const slug = this.actorName.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

      return this.ctx.$path.resolve(pluginDir, "data", `${providerSlug}-${slug}-scenes.json`);
    }

    return super.output();
  }

  endpoint(query: string): string {
    switch (this.provider) {
      case "NaughtyAmerica":
        const slug = this.actorName.replace(/[^a-zA-Z69]+/g, "-").toLowerCase();
        return `/pornstar/${slug}?related_page=${query}`;
      case "NaughtyAmericaVR":
      default:
        return `/vr-porn?page=${query}`;
    }
  }

  async pages(): Promise<number> {
    const endpoint = this.endpoint("1");
    const $ = await this.get(endpoint);
    const $pages = $(this.pagesSelector);
    if (!$pages.length) {
      return 1;
    }

    const { searchParams } = new URL($pages.attr("href")!!);
    const param = this.provider === "NaughtyAmericaVR" ? "page" : "related_page";

    return parseInt(searchParams.get(param)!!, 10);
  }

  item({ $el, items, $ }: IItemOptions<SceneOutput>): void {
    const link = $el.find(".contain-img").attr("href")!!;
    const pictureNr = this.provider === "NaughtyAmerica" ? 2 : 1;
    const $thumbnail = $el.find(`.contain-img picture:nth-of-type(${pictureNr}) img`);
    const thumbnailHref = `https:${$thumbnail.attr("data-src") || $thumbnail.attr("data-srcset")}`;
    const paths = new URL(thumbnailHref).pathname.split("/");
    const name = `${paths[5]}${paths[6]}`;

    items.set(link, {
      name,
      actors: $el.find(".contain-actors > a").map((_: number, el: cheerio.Element) => $!!(el).text().trim()).get(),
      releaseDate: new Date($el.find(".entry-date").text().trim()).getTime(),
      studio: $el.find(".site-title").text().trim(),
      custom: {
        link,
        thumbnailHref
      }
    });
  }

  async items(_: string): Promise<SceneOutput[]> {
    const items = new Map();
    const pages = await this.pages();

    const promises = Array(pages).fill("").map(async (_: any, index: number) => {
      const endpoint = this.endpoint((index + 1).toString());
      const $ = await this.get(endpoint);

      $(this.itemsSelector)
        .each((_: number, el: cheerio.Element) => this.item({ $el: $(el), items, $ }));
    });
    await Promise.all(promises);

    const values = Array.from(items.values());
    await this.write(values)

    return values
  }

  async details(scene: SceneOutput): Promise<SceneOutput> {
    const $ = await this.get(scene.custom.link);
    const $el = $(".left-scene");
    const thumbnailHref = $el.find(".start-card").length
      ? `https:${$el.find(".start-card").attr("src")}`
      : `https:${$el.find("dl8-video").attr("poster")}`;

    return {
      ...scene,
      name: $el.find("h1.scene-title").text().trim(),
      description: $el.find(".synopsis").text().trim().replace(/Synopsis/i, ""),
      custom: {
        thumbnailHref
      }
    };
  }
}
