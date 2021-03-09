import { SceneScraper } from "./SceneScraper"

import { IItemOptions } from "./Scraper"
import { SceneOutput } from "../../../types/scene"

export class WankzVRApi extends SceneScraper {

  site = this.provider === "MilfVR" ? "MVR" : "WVR"
  itemsSelector = ".cards-list__item.card";
  client = this.ctx.$axios.create({
    baseURL: `http://www.${this.provider.toLowerCase()}.com/`,
    headers: {
      Cookie: `member_site=${this.site}`
    }
  });
  validProviders = ["WankzVR", "MilfVR"];

  endpoint(query: string): string {
    return `/search?q=${query}`;
  }

  item({ $el, items, $ }: IItemOptions<SceneOutput>): void {
    const link = $el.find(".card__video").attr("href")!!;
    const [id] = link.match(/(\d+)/);

    items.set(link, {
      name: $el.find(".card__h").text().trim(),
      actors: $el.find(".card__links > a").map((_: number, el: cheerio.Element) => $!!(el).text().trim()).get(),
      releaseDate: new Date($el.find(".card__date").text().trim()).getTime(),
      custom: {
        link,
       thumbnailHref: `https://cdn-i.${this.provider.toLowerCase()}.com/${id.substring(0, 1)}/${id.substring(0, 4)}/${id}/cover/large.jpg`
      }
    });
  }

  unslugify(slug: string): string {
    return slug.replace(`${this.provider}-`, "")
      .replace("-180_180x180_3dh_LR", "")
      .replace("-180_180x180_3dh", "")
      .replace(/-/g, " ");
  }

  slugify(name: string): string {
    const slug = name
      .replace(/"/g, " ")
      .replace(/[^0-9A-Za-z-\s]/g, "")
      .replace(/\s/g, "-")
      .replace(/--/g, "-")
      .toLowerCase();
    return `${this.provider.toLowerCase()}-${slug}-180_180x180_3dh`;
  }

  async details(scene: SceneOutput): Promise<SceneOutput> {
    const $ = await this.get(scene.custom.link);
    const $el = $(".detail__content");

    return {
      ...scene,
      description: $el.find(".detail__txt").text().trim()
    };
  }
}
