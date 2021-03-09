import { capitalize } from "../utils";
import { SceneScraper } from "./SceneScraper";

import { IItemOptions } from "./Scraper";
import { SceneOutput } from "../../../types/scene";

export class AngelaWhiteApi extends SceneScraper {

  itemsSelector = "#container > .listing-box > .videodetails";
  validProviders = ["Angela White"];

  endpoint(query: string): string {
    return `/tour/search?query=${query}`;
  }

  item({ $el, items }: IItemOptions<SceneOutput>): void {
    const link = $el.find(".videotrailor-real > a").attr("href")!!;
    const name = capitalize($el.find(".videocontent > h2 > a").text().trim());
    const actors = name.replace(/\d+/g, "").split(" X ").map(s => s.trim());
    const thumbnailEndpoint = $el.find(".videotrailor-real > a > img").attr("src0")!!;
    const { href: thumbnailHref } = new URL(thumbnailEndpoint, this.client.defaults.baseURL);

    items.set(link, {
      name,
      actors,
      releaseDate: new Date($el.find(".videocontent > h2 > .date-format").text().trim()).getTime(),
      description: $el.find(".videocontent > .desc").text().trim(),
      custom: {
        link,
        thumbnailHref
      }
    });
  }

  unslugify(slug: string): string {
    return slug.replace(/[A-Za-z\s]+/g, "");
  }

  async details(scene: SceneOutput): Promise<any> {
    const $ = await this.get(scene.custom.link);
    const $el = $(".videodetails");

    return {
      description: $el.find(".desc").text().trim()
    };
  }
}
