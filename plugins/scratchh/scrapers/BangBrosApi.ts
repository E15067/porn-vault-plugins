import { SceneScraper } from "./SceneScraper"

import { IItemOptions } from "./Scraper"
import { SceneOutput } from "../../../types/scene"

export class BangBrosApi extends SceneScraper {

  itemsSelector = ".videosPopGrls .echThumb";
  validProviders = ["BangBros"];

  endpoint(query: string): string {
    return `/search/${this.slugify(query)}`;
  }

  item({ $el, items, $ }: IItemOptions<SceneOutput>): void {
    const link = $el.find("a").attr("href");
    const name = $el.find(".thmb_ttl").text().trim();
    const releaseDate = new Date($el.find(".thmb_mr_cmn:last-of-type").text()).getTime();
    const actors = $el.find(".cast").map((_: number, el: cheerio.Element) => $!!(el).text().trim()).get();
    const thumbnailHref = `https:${$el.find(".thmbPic_tag").attr("data-src")}`;
    const studio = $el.find(".thmb_mr_cmn:first-of-type").text().trim();

    items.set(link, {
      name,
      releaseDate,
      actors,
      studio,
      custom: {
        link,
        thumbnailHref
      }
    });
  }

  slugify(name: string): string {
    // return name.replace("’", "'");
    return name
      .replace(/[^A-Za-z0-9'\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
  }

  async details(scene: SceneOutput): Promise<SceneOutput> {
    const $ = await this.get(scene.custom.link);
    let thumbnailHref = `https:${$("#player-overlay-image").attr("src")}`;
    try {
      await this.client.get(thumbnailHref);
    } catch (err) {
      thumbnailHref = scene.custom.thumbnailHref;
    }

    const description = $(".vdoDesc").text();

    return {
      ...scene,
      description,
      custom: {
        thumbnailHref
      }
    };
  }
}
